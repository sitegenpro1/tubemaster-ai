
import { GoogleGenAI } from "@google/genai";
import { ThumbnailGenResult, CompetitorAnalysisResult, ScriptResponse, KeywordResult, ThumbnailCompareResult } from "../types";

// --- CONFIGURATION ---

// Helper to get keys safely in Vite and Vercel environments
const getEnv = (key: string) => {
  // Check Vite's import.meta.env
  const meta = import.meta as any;
  if (typeof meta !== 'undefined' && meta.env && meta.env[key]) {
    return meta.env[key];
  }
  // Check standard process.env (fallback for some build steps)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

// Initialize Gemini (Only for other tools, not for Thumbnail Compare)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- CORE HELPERS ---

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  // Remove markdown code blocks
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  // Remove thinking traces if any
  clean = clean.replace(/<think>[\s\S]*?<\/think>/g, "");
  
  // Find the first '{' and last '}'
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return clean.substring(firstBrace, lastBrace + 1);
  }
  
  // If no braces found, return original (might be raw json) or empty object
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
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

// --- GROK / OPENROUTER HELPERS ---

const callOpenRouterGrok = async (systemPrompt: string, userPrompt: string, images?: string[]): Promise<string> => {
  const openRouterKey = getEnv('VITE_OPENROUTER_API_KEY');
  
  if (!openRouterKey) {
    throw new Error("Missing VITE_OPENROUTER_API_KEY. Please set this in your environment variables.");
  }

  const messages: any[] = [
    { role: "system", content: systemPrompt },
  ];

  if (images && images.length > 0) {
    const content = [
      { type: "text", text: userPrompt },
      ...images.map(img => ({
        type: "image_url",
        image_url: { url: img } // OpenRouter expects data URI directly
      }))
    ];
    messages.push({ role: "user", content });
  } else {
    messages.push({ role: "user", content: userPrompt });
  }

  // Model ID as requested
  const MODEL = "x-ai/grok-2-vision-1212";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openRouterKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tubemaster.ai", 
      "X-Title": "TubeMaster AI"
    },
    body: JSON.stringify({
      model: MODEL, 
      messages: messages,
      temperature: 0.5, // Lower temperature for more consistent JSON
      response_format: { type: "json_object" } 
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Throwing a detailed error helps the UI show what happened (e.g., 404, 401)
    throw new Error(`OpenRouter API Error (${response.status}): ${errorText}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const parsed = JSON.parse(cleanJson(response.text || "{}"));
    return Array.isArray(parsed.keywords) ? parsed.keywords : [];
  } catch (e) {
    console.error("Keyword find error", e);
    return [];
  }
};

export const analyzeCompetitor = async (channelUrl: string): Promise<CompetitorAnalysisResult> => {
  let contextData = "";
  
  // 1. Web Scraping Layer
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(channelUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const data = await response.json();
      const html = data.contents;
      
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const descMatch = html.match(/name="description" content="(.*?)"/);
      const keywordsMatch = html.match(/name="keywords" content="(.*?)"/);
      
      const title = titleMatch ? titleMatch[1] : "Unknown Channel";
      const description = descMatch ? descMatch[1] : "";
      const keywords = keywordsMatch ? keywordsMatch[1] : "";
      
      contextData = `Channel Name: ${title}\nDescription: ${description}\nKeywords: ${keywords}`;
    }
  } catch (e) {
    console.warn("Scraping failed, proceeding with AI inference only.", e);
    contextData = `Channel URL: ${channelUrl} (Metadata could not be scraped)`;
  }

  // 2. AI Reasoning Layer
  const prompt = `
    Analyze this competitor channel based on the available data:
    ${contextData.substring(0, 2000)}
    
    If data is scarce, infer based on the channel name or likely niche.
    
    Task: Provide a strategic analysis.
    Return JSON:
    {
      "channelName": "...",
      "subscriberEstimate": "e.g. 100k-500k",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
      "contentGaps": ["gap 1", "gap 2", "gap 3"],
      "topPerformingTopics": ["topic 1", "topic 2"],
      "actionPlan": "One sentence strategy to beat them."
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });
  
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateScript = async (title: string, audience: string): Promise<ScriptResponse> => {
  const prompt = `
    Write a YouTube script for "${title}" aimed at "${audience}".
    Structure: Hook -> Context -> Value -> Pattern Interrupt -> Payoff.
    Return JSON: { "title": "...", "estimatedDuration": "...", "targetAudience": "...", "sections": [ { "title": "...", "content": "...", "duration": "...", "visualCue": "...", "logicStep": "..." } ] }
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateTitles = async (topic: string): Promise<string[]> => {
  const prompt = `Generate 10 click-worthy, viral-style YouTube titles for: "${topic}". Return JSON: { "titles": ["..."] }`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });
  const parsed = JSON.parse(cleanJson(response.text || "{}"));
  return parsed.titles || [];
};

export const suggestBestTime = async (title: string, audience: string, tags: string): Promise<string> => {
  const prompt = `Best time to publish video "${title}" for "${audience}". Keep it brief (2 sentences).`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  });
  return response.text || "";
};

export const generateThumbnail = async (prompt: string, style: string, mood: string, optimize: boolean): Promise<ThumbnailGenResult> => {
  let finalPrompt = prompt;
  
  if (optimize) {
    try {
      const optimResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Optimize this image prompt for an AI image generator. Make it highly detailed. Prompt: "${prompt}". Style: ${style}, ${mood}. Output ONLY text.`
      });
      if (optimResponse.text) {
        finalPrompt = optimResponse.text;
      }
    } catch (e) { /* ignore */ }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: finalPrompt }]
    }
  });

  let imageUrl = "";
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  if (!imageUrl) {
    throw new Error("No image generated by Gemini");
  }

  return {
    imageUrl: imageUrl,
    originalPrompt: prompt,
    optimizedPrompt: finalPrompt,
    style,
    createdAt: Date.now()
  };
};

// Strictly uses Grok via OpenRouter for Thumbnail Comparison. No Fallback.
export const compareThumbnailsVision = async (imgA: string, imgB: string): Promise<ThumbnailCompareResult> => {
  const [cA, cB] = await Promise.all([compressImage(imgA), compressImage(imgB)]);
  
  const system = "You are an expert YouTube Strategist with deep knowledge of CTR (Click Through Rate) psychology. You analyze thumbnails.";
  const user = `Analyze these two thumbnails. Which has higher CTR potential? Compare contrast, text readability, facial emotion, and curiosity gap. Return strictly JSON: { "winner": "A", "scoreA": 8, "scoreB": 6, "reasoning": "...", "breakdown": [{"criterion": "Contrast", "winner": "A", "explanation": "..."}] }`;
  
  console.log("Calling OpenRouter with Grok Vision...");
  
  try {
    const jsonStr = await callOpenRouterGrok(system, user, [cA, cB]);
    return JSON.parse(cleanJson(jsonStr));
  } catch (error) {
    console.error("Grok Vision Analysis Failed:", error);
    // Rethrow to let the UI handle the error state instead of crashing
    throw error;
  }
};
