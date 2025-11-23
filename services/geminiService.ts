
import { KeywordResult, ScriptResponse, CompetitorAnalysisResult, ThumbnailGenResult, ThumbnailCompareResult } from "../types";

// --- CONFIGURATION ---

// Centralized Model Definitions
// Text Tools -> GROQ Provider (as requested)
const TEXT_MODEL = 'openai/gpt-oss-120b'; 
// Vision Tools -> OPENROUTER Provider (as requested)
const VISION_MODEL = "x-ai/grok-4.1-fast";

const getEnvVar = (key: string): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}

  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {}

  return "";
};

const getGroqKey = () => getEnvVar('VITE_GROQ_API_KEY');
const getOpenRouterKey = () => getEnvVar('VITE_OPENROUTER_API_KEY');

// --- CORE HELPERS ---

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  // Remove markdown code blocks
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  // Remove <think> tags (DeepSeek/Reasoning models)
  clean = clean.replace(/<think>[\s\S]*?<\/think>/g, "");
  
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
};

// Generic Fetch Wrapper
const callAI = async (
  provider: 'GROQ' | 'OPENROUTER',
  model: string,
  messages: any[],
  jsonMode: boolean = true
): Promise<string> => {
  
  // STRICT PROVIDER LOGIC:
  // GROQ -> Always use Groq Endpoint + Groq Key
  // OPENROUTER -> Always use OpenRouter Endpoint + OpenRouter Key
  
  const isGroq = provider === 'GROQ';
  const apiKey = isGroq ? getGroqKey() : getOpenRouterKey();
  const endpoint = isGroq
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://openrouter.ai/api/v1/chat/completions";

  if (!apiKey) { 
    const missingKeyName = isGroq ? 'VITE_GROQ_API_KEY' : 'VITE_OPENROUTER_API_KEY';
    console.warn(`Missing API Key for ${provider} (Model: ${model})`);
    throw new Error(`Missing API Key. Please add ${missingKeyName} to your environment variables.`);
  }

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // Add OpenRouter specific headers if we are hitting that endpoint
  if (!isGroq) {
    headers["HTTP-Referer"] = "https://tubemaster.ai";
    headers["X-Title"] = "TubeMaster AI";
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        response_format: jsonMode ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const err = await response.text();
      // Parse error if possible to show friendly message
      let friendlyError = err;
      try {
        const errObj = JSON.parse(err);
        if (errObj.error && errObj.error.message) friendlyError = errObj.error.message;
      } catch (e) {}
      
      if (response.status === 401) {
        throw new Error(`Authentication Failed (401) for ${provider}. Check ${isGroq ? 'VITE_GROQ_API_KEY' : 'VITE_OPENROUTER_API_KEY'}.`);
      }

      throw new Error(`${provider} Error (${response.status}): ${friendlyError}`);
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
  const systemPrompt = `You are a YouTube SEO expert. Return a valid JSON object containing an array "keywords".`;
  const userPrompt = `
    Topic: "${topic}"
    Generate 10 highly specific keywords/tags.
    Strictly follow this JSON schema:
    { "keywords": [ { "keyword": "string", "searchVolume": "string", "difficulty": number (0-100), "opportunityScore": number (0-100), "trend": "Rising" | "Stable" | "Falling", "intent": "Educational" | "Commercial", "cpc": "string", "competitionDensity": "Low" | "Medium" | "High", "topCompetitor": "string", "videoAgeAvg": "string", "ctrPotential": "High" | "Medium" } ] }
  `;

  try {
    const jsonStr = await callAI('GROQ', TEXT_MODEL, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], true);
    
    const parsed = JSON.parse(cleanJson(jsonStr));
    return Array.isArray(parsed.keywords) ? parsed.keywords : [];
  } catch (e) {
    console.error("Keyword find error", e);
    throw e;
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
    console.warn("Scraping failed, proceeding with URL only", e);
    contextData = `Channel URL: ${channelUrl}`;
  }

  // 2. AI Reasoning
  const systemPrompt = "You are a YouTube Strategist. Output strictly JSON.";
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

  const jsonStr = await callAI('GROQ', TEXT_MODEL, [
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

  const jsonStr = await callAI('GROQ', TEXT_MODEL, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
  ], true);

  return JSON.parse(cleanJson(jsonStr));
};

export const generateTitles = async (topic: string): Promise<string[]> => {
  const userPrompt = `Generate 10 viral, click-bait style YouTube titles for: "${topic}". Return JSON: { "titles": ["string"] }`;
  const jsonStr = await callAI('GROQ', TEXT_MODEL, [{ role: "user", content: userPrompt }], true);
  const parsed = JSON.parse(cleanJson(jsonStr));
  return parsed.titles || [];
};

export const suggestBestTime = async (title: string, audience: string, tags: string): Promise<string> => {
  const userPrompt = `Best time to publish video "${title}" for "${audience}". Keep it brief (2 sentences).`;
  // Using generic mode (no JSON enforcement) for simple text
  return await callAI('GROQ', TEXT_MODEL, [{ role: "user", content: userPrompt }], false);
};

export const generateThumbnail = async (prompt: string, style: string, mood: string, optimize: boolean): Promise<ThumbnailGenResult> => {
  let finalPrompt = prompt;

  // 1. Optimize Prompt with Groq (Text Tool)
  if (optimize) {
    try {
      finalPrompt = await callAI('GROQ', TEXT_MODEL, [{
        role: "user", 
        content: `Enhance this image prompt for an AI generator (Flux/Midjourney). Make it detailed, describing lighting and composition. Prompt: "${prompt}". Style: ${style}, Mood: ${mood}. Output ONLY the prompt text.`
      }], false);
    } catch (e) {
      console.warn("Prompt optimization failed, using original");
    }
  }

  // 2. Generate Image using Pollinations.ai (FREE, UNLIMITED)
  const encodedPrompt = encodeURIComponent(finalPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;

  // Pre-fetch check
  try { await fetch(imageUrl); } catch(e) {}

  return {
    imageUrl: imageUrl,
    originalPrompt: prompt,
    optimizedPrompt: finalPrompt,
    style,
    createdAt: Date.now()
  };
};

export const compareThumbnailsVision = async (imgA: string, imgB: string, provider: 'GROQ' | 'OPENROUTER'): Promise<ThumbnailCompareResult> => {
  // STRICTLY USE OPENROUTER FOR VISION as requested
  // We ignore the incoming provider arg to ensure safety, or default it.
  
  const apiKey = getOpenRouterKey();
  if (!apiKey) throw new Error("VITE_OPENROUTER_API_KEY is missing. Cannot perform Vision analysis.");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tubemaster.ai",
      "X-Title": "TubeMaster AI"
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze these two YouTube thumbnails. Which has higher CTR potential? Output strictly JSON: { \"winner\": \"A\" or \"B\", \"scoreA\": number, \"scoreB\": number, \"reasoning\": \"string\", \"breakdown\": [{\"criterion\": \"Contrast\", \"winner\": \"A\", \"explanation\": \"string\"}] }" },
            { type: "image_url", image_url: { url: imgA } },
            { type: "image_url", image_url: { url: imgB } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    let errorMsg = err;
    try {
       const e = JSON.parse(err);
       if(e.error && e.error.message) errorMsg = e.error.message;
    } catch(e){}
    
    if (response.status === 401) throw new Error("OpenRouter Auth Failed. Check VITE_OPENROUTER_API_KEY.");
    throw new Error(`Vision API Error: ${errorMsg}`);
  }
  
  const json = await response.json();
  const content = json.choices?.[0]?.message?.content || "{}";
  const result = JSON.parse(cleanJson(content));

  if (!result.breakdown) result.breakdown = [];
  return result;
};
