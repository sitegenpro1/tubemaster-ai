import { ThumbnailGenResult, CompetitorAnalysisResult, ScriptResponse, KeywordResult, ThumbnailCompareResult } from "../types";

// --- CONFIGURATION ---

const getEnv = (key: string) => {
  // 1. Try Vite's import.meta.env
  const meta = import.meta as any;
  if (meta && meta.env && meta.env[key]) {
    return meta.env[key];
  }
  // 2. Try standard process.env (Vercel/Node)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

// Use OpenRouter for all text/vision logic
const API_KEY = getEnv('VITE_OPENROUTER_API_KEY');
const SITE_URL = 'https://tubemaster.ai'; // Required by OpenRouter
const SITE_NAME = 'TubeMaster AI';

// Models
const TEXT_MODEL = "google/gemini-2.0-flash-lite-preview-02-05:free"; // High quality, free tier on OpenRouter
const VISION_MODEL = "x-ai/grok-2-vision-1212"; // User requested Grok for Vision

// --- CORE HELPERS ---

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  // Remove markdown code blocks
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  // Remove thinking traces
  clean = clean.replace(/<think>[\s\S]*?<\/think>/g, "");
  
  // Attempt to find valid JSON object
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return clean.substring(firstBrace, lastBrace + 1);
  }
  return firstBrace !== -1 ? clean : "{}";
};

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const MAX = 1024;
      let w = img.width;
      let h = img.height;
      if (w > h) { if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; } }
      else { if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; } }
      
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

// --- API CALLER (Replaces GoogleGenAI SDK) ---

const callOpenRouter = async (
  messages: any[], 
  model: string = TEXT_MODEL, 
  jsonMode: boolean = true
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Missing VITE_OPENROUTER_API_KEY. Please add it to Vercel Environment Variables.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      response_format: jsonMode ? { type: "json_object" } : undefined,
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenRouter Error:", response.status, errText);
    throw new Error(`AI API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  return content;
};

// --- EXPORTED SERVICES ---

export const findKeywords = async (topic: string): Promise<KeywordResult[]> => {
  const prompt = `
    Act as a YouTube SEO Algorithm Expert.
    Topic: "${topic}"
    Generate 10 highly specific keywords/tags.
    Return strictly a JSON object: { "keywords": [ { "keyword": "...", "searchVolume": "...", "difficulty": 50, "opportunityScore": 80, "trend": "Rising", "intent": "Educational", "cpc": "$1.20", "competitionDensity": "Medium", "topCompetitor": "Channel Name", "videoAgeAvg": "2 years", "ctrPotential": "High" } ] }
  `;
  
  try {
    const text = await callOpenRouter([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(cleanJson(text));
    return Array.isArray(parsed.keywords) ? parsed.keywords : [];
  } catch (e) {
    console.error("Keyword find error", e);
    return [];
  }
};

export const analyzeCompetitor = async (channelUrl: string): Promise<CompetitorAnalysisResult> => {
  // We'll skip the scraping layer for now to simplify and ensure Vercel compatibility, 
  // relying on AI to infer from the structure provided or just the prompt.
  // In a real generic implementation, we'd assume the user might paste just the name if scraping fails.
  
  const prompt = `
    Analyze the YouTube channel URL: "${channelUrl}".
    If you cannot access the live URL, infer the likely content strategy based on the channel name/handle implied by the URL.
    
    Task: Provide a strategic analysis for a competitor.
    Return JSON:
    {
      "channelName": "Inferred Name",
      "subscriberEstimate": "e.g. 100k-500k",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
      "contentGaps": ["gap 1", "gap 2", "gap 3"],
      "topPerformingTopics": ["topic 1", "topic 2"],
      "actionPlan": "One sentence strategy to beat them."
    }
  `;

  try {
    const text = await callOpenRouter([{ role: "user", content: prompt }]);
    return JSON.parse(cleanJson(text));
  } catch (e) {
    console.error("Analysis error", e);
    throw new Error("Failed to analyze competitor.");
  }
};

export const generateScript = async (title: string, audience: string): Promise<ScriptResponse> => {
  const prompt = `
    Write a YouTube script for "${title}" aimed at "${audience}".
    Structure: Hook -> Context -> Value -> Pattern Interrupt -> Payoff.
    Return JSON: { "title": "...", "estimatedDuration": "...", "targetAudience": "...", "sections": [ { "title": "...", "content": "...", "duration": "...", "visualCue": "...", "logicStep": "..." } ] }
  `;
  
  try {
    const text = await callOpenRouter([{ role: "user", content: prompt }]);
    return JSON.parse(cleanJson(text));
  } catch (e) {
    console.error("Script error", e);
    throw new Error("Failed to generate script.");
  }
};

export const generateTitles = async (topic: string): Promise<string[]> => {
  const prompt = `Generate 10 click-worthy, viral-style YouTube titles for: "${topic}". Return JSON: { "titles": ["..."] }`;
  
  try {
    const text = await callOpenRouter([{ role: "user", content: prompt }]);
    const parsed = JSON.parse(cleanJson(text));
    return parsed.titles || [];
  } catch (e) {
    console.error("Title gen error", e);
    return [];
  }
};

export const suggestBestTime = async (title: string, audience: string, tags: string): Promise<string> => {
  const prompt = `Best time to publish video "${title}" for "${audience}". Keep it brief (2 sentences).`;
  
  try {
    // We don't need JSON mode for this simple text response
    const text = await callOpenRouter([{ role: "user", content: prompt }], TEXT_MODEL, false);
    return text;
  } catch (e) {
    return "Could not determine best time.";
  }
};

// REPLACEMENT: Use Pollinations.ai (Flux) instead of Gemini Image
// This avoids the need for a Google API Key for images and is free/unlimited.
export const generateThumbnail = async (prompt: string, style: string, mood: string, optimize: boolean): Promise<ThumbnailGenResult> => {
  let finalPrompt = prompt;

  // 1. Optimize Prompt if requested (Text only)
  if (optimize) {
    try {
      const optimPrompt = `Optimize this image prompt for an AI image generator (Flux). Make it highly detailed, visual, and click-worthy. Prompt: "${prompt}". Style: ${style}, ${mood}. Output ONLY the raw prompt text, no reasoning.`;
      finalPrompt = await callOpenRouter([{ role: "user", content: optimPrompt }], TEXT_MODEL, false);
    } catch (e) {
      console.warn("Prompt optimization failed, using original.");
    }
  }

  // 2. Generate Image URL via Pollinations
  // Pollinations doesn't require an async fetch to get bytes, we just construct the URL.
  // We append random seed to ensure new images on re-rolls.
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(`${finalPrompt}, ${style} style, ${mood} atmosphere, 4k, youtube thumbnail`);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&seed=${seed}&nologo=true`;

  // We do a quick fetch just to ensure the service is up/image generates, 
  // though typically we can just return the URL. 
  // For better UX, let's preload it.
  try {
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
  } catch (e) {
    // If preload fails, we still return URL, browser might show broken image icon but user can retry
  }

  return {
    imageUrl: imageUrl,
    originalPrompt: prompt,
    optimizedPrompt: finalPrompt,
    style,
    createdAt: Date.now()
  };
};

export const compareThumbnailsVision = async (imgA: string, imgB: string): Promise<ThumbnailCompareResult> => {
  const [cA, cB] = await Promise.all([compressImage(imgA), compressImage(imgB)]);
  
  const system = "You are an expert YouTube Strategist. Compare these two thumbnails for CTR potential.";
  const userPrompt = `Analyze these two thumbnails. Which has higher CTR potential? Compare contrast, text readability, facial emotion, and curiosity gap. Return strictly JSON: { "winner": "A", "scoreA": 8, "scoreB": 6, "reasoning": "...", "breakdown": [{"criterion": "Contrast", "winner": "A", "explanation": "..."}] }`;
  
  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: cA } },
        { type: "image_url", image_url: { url: cB } }
      ]
    }
  ];

  try {
    // Using the user-preferred Vision model
    const text = await callOpenRouter(messages, VISION_MODEL, true);
    return JSON.parse(cleanJson(text));
  } catch (error) {
    console.error("Vision Analysis Failed:", error);
    throw error;
  }
};