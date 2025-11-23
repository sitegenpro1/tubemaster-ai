
import { KeywordResult, ScriptResponse, CompetitorAnalysisResult, ThumbnailGenResult, ThumbnailCompareResult } from "../types";

// --- CONFIGURATION ---

const getGroqKey = () => {
  // @ts-ignore
  return import.meta.env.VITE_GROQ_API_KEY || "";
};

const getOpenRouterKey = () => {
  // @ts-ignore
  return import.meta.env.VITE_OPENROUTER_API_KEY || "";
};

// --- CORE HELPERS ---

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  // Remove <think> tags if present (common in DeepSeek/Grok models)
  clean = clean.replace(/<think>[\s\S]*?<\/think>/g, "");
  
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
};

// Generic Fetch Wrapper for Groq/OpenRouter to reduce code duplication
const callAI = async (
  provider: 'GROQ' | 'OPENROUTER',
  model: string,
  messages: any[],
  jsonMode: boolean = true
): Promise<string> => {
  const apiKey = provider === 'GROQ' ? getGroqKey() : getOpenRouterKey();
  const endpoint = provider === 'GROQ' 
    ? "https://api.groq.com/openai/v1/chat/completions" 
    : "https://openrouter.ai/api/v1/chat/completions";

  if (!apiKey && provider !== 'GROQ') { 
    // Allow Groq to fail gracefully or mock if needed, but here we throw
    throw new Error(`Missing API Key for ${provider}`);
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        response_format: jsonMode ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`${provider} Error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error(`${provider} Call Failed:`, error);
    throw error;
  }
};

// --- EXPORTED SERVICES ---

export const findKeywords = async (topic: string): Promise<KeywordResult[]> => {
  // Using Llama-3-70b via Groq for high intelligence + JSON adherence
  const systemPrompt = `You are a YouTube SEO expert. Return a valid JSON object containing an array "keywords".`;
  const userPrompt = `
    Topic: "${topic}"
    Generate 10 highly specific keywords/tags.
    Strictly follow this JSON schema:
    { "keywords": [ { "keyword": "string", "searchVolume": "string", "difficulty": number (0-100), "opportunityScore": number (0-100), "trend": "Rising" | "Stable" | "Falling", "intent": "Educational" | "Commercial", "cpc": "string", "competitionDensity": "Low" | "Medium" | "High", "topCompetitor": "string", "videoAgeAvg": "string", "ctrPotential": "High" | "Medium" } ] }
  `;

  try {
    const jsonStr = await callAI('GROQ', 'llama3-70b-8192', [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], true);
    
    const parsed = JSON.parse(cleanJson(jsonStr));
    return Array.isArray(parsed.keywords) ? parsed.keywords : [];
  } catch (e) {
    console.error("Keyword find error", e);
    // Return empty array to prevent UI crash
    return [];
  }
};

export const analyzeCompetitor = async (channelUrl: string): Promise<CompetitorAnalysisResult> => {
  let contextData = "";
  
  // 1. Web Scraping Layer (Client-side proxy)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(channelUrl)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      const html = data.contents;
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const descMatch = html.match(/name="description" content="(.*?)"/);
      contextData = `Channel Title: ${titleMatch?.[1] || 'Unknown'}\nDescription: ${descMatch?.[1] || 'Unknown'}`;
    }
  } catch (e) {
    console.warn("Scraping failed", e);
    contextData = `Channel URL: ${channelUrl}`;
  }

  // 2. AI Reasoning (Groq)
  const systemPrompt = "You are a YouTube Strategist. output strictly JSON.";
  const userPrompt = `
    Analyze this competitor data: ${contextData.substring(0, 1000)}
    Provide a strategic analysis in this JSON format:
    {
      "channelName": "string",
      "subscriberEstimate": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "contentGaps": ["string"],
      "topPerformingTopics": ["string"],
      "actionPlan": "string"
    }
  `;

  const jsonStr = await callAI('GROQ', 'llama3-70b-8192', [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
  ], true);

  return JSON.parse(cleanJson(jsonStr));
};

export const generateScript = async (title: string, audience: string): Promise<ScriptResponse> => {
  const systemPrompt = "You are a professional YouTube Scriptwriter. Output strictly JSON.";
  const userPrompt = `
    Write a viral script for "${title}" targeting "${audience}".
    Structure: Hook -> Context -> Value -> Pattern Interrupt -> Payoff.
    JSON Schema: { "title": "string", "estimatedDuration": "string", "targetAudience": "string", "sections": [ { "title": "string", "content": "string (script dialogue)", "duration": "string", "visualCue": "string (editor notes)", "logicStep": "Hook" | "Body" | "Conclusion" } ] }
  `;

  const jsonStr = await callAI('GROQ', 'llama3-70b-8192', [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
  ], true);

  return JSON.parse(cleanJson(jsonStr));
};

export const generateTitles = async (topic: string): Promise<string[]> => {
  const userPrompt = `Generate 10 viral, click-bait style YouTube titles for: "${topic}". Return JSON: { "titles": ["string"] }`;
  const jsonStr = await callAI('GROQ', 'llama3-70b-8192', [{ role: "user", content: userPrompt }], true);
  const parsed = JSON.parse(cleanJson(jsonStr));
  return parsed.titles || [];
};

export const suggestBestTime = async (title: string, audience: string, tags: string): Promise<string> => {
  const userPrompt = `Best time to publish video "${title}" for "${audience}". Keep it brief (2 sentences).`;
  // Using generic mode (no JSON enforcement) for simple text
  return await callAI('GROQ', 'llama3-8b-8192', [{ role: "user", content: userPrompt }], false);
};

export const generateThumbnail = async (prompt: string, style: string, mood: string, optimize: boolean): Promise<ThumbnailGenResult> => {
  let finalPrompt = prompt;

  // 1. Optimize Prompt with Groq (Fast)
  if (optimize) {
    try {
      finalPrompt = await callAI('GROQ', 'llama3-8b-8192', [{
        role: "user", 
        content: `Enhance this image prompt for an AI generator (Flux/Midjourney). Make it detailed, describing lighting and composition. Prompt: "${prompt}". Style: ${style}, Mood: ${mood}. Output ONLY the prompt text.`
      }], false);
    } catch (e) {
      console.warn("Prompt optimization failed, using original");
    }
  }

  // 2. Generate Image using Pollinations.ai (FREE, UNLIMITED, NO API KEY REQUIRED)
  // This satisfies the "Unlimited" requirement perfectly.
  // We use the Flux model via Pollinations
  const encodedPrompt = encodeURIComponent(finalPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;

  // We fetch it to ensure it's generated (hot-loading) before returning
  await fetch(imageUrl);

  return {
    imageUrl: imageUrl,
    originalPrompt: prompt,
    optimizedPrompt: finalPrompt,
    style,
    createdAt: Date.now()
  };
};

export const compareThumbnailsVision = async (imgA: string, imgB: string, provider: 'GROQ' | 'OPENROUTER'): Promise<ThumbnailCompareResult> => {
  // We use OpenRouter for Vision as Groq's Vision support is limited/beta.
  // We target a robust model like 'google/gemini-flash-1.5' or 'x-ai/grok-vision-beta' via OpenRouter
  
  const apiKey = getOpenRouterKey();
  if (!apiKey) throw new Error("VITE_OPENROUTER_API_KEY is missing. Cannot perform Vision analysis.");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-flash-1.5", // Or 'x-ai/grok-beta' if available and preferred
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze these two YouTube thumbnails. Which has higher CTR potential? Output strictly JSON: { \"winner\": \"A\" or \"B\", \"scoreA\": number, \"scoreB\": number, \"reasoning\": \"string\", \"breakdown\": [{\"criterion\": \"Contrast\", \"winner\": \"A\", \"explanation\": \"string\"}] }" },
            { type: "image_url", image_url: { url: imgA } },
            { type: "image_url", image_url: { url: imgB } }
          ]
        }
      ]
    })
  });

  if (!response.ok) throw new Error("Vision API Failed");
  
  const json = await response.json();
  const content = json.choices?.[0]?.message?.content || "{}";
  const result = JSON.parse(cleanJson(content));

  // Safety check for UI
  if (!result.breakdown) result.breakdown = [];
  return result;
};
