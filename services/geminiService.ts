import { GoogleGenAI } from "@google/genai";
import { ThumbnailGenResult, CompetitorAnalysisResult, ScriptResponse, KeywordResult } from "../types";

// --- CONFIGURATION ---

// Helper to ensure we get keys in Vite environment
const getGeminiKey = () => {
  // @ts-ignore
  return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || "";
};

const getOpenRouterKey = () => {
  // @ts-ignore
  return import.meta.env.VITE_OPENROUTER_API_KEY || "";
};

const ai = new GoogleGenAI({ apiKey: getGeminiKey() });

// --- CORE HELPERS ---

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  // Remove markdown code blocks
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  // Remove <think> tags if present
  clean = clean.replace(/<think>[\s\S]*?<\/think>/g, "");
  
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
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

// HYBRID MODEL: Web Scraper + AI Reasoning
export const analyzeCompetitor = async (channelUrl: string): Promise<CompetitorAnalysisResult> => {
  let contextData = "";
  
  // 1. Web Scraping Layer
  try {
    // Use AllOrigins to proxy the request and avoid CORS
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(channelUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const data = await response.json();
      const html = data.contents;
      
      // Regex extraction for key metadata (lighter than parsing full DOM)
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
    model: 'gemini-3-pro-preview',
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
    model: 'gemini-3-pro-preview',
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

  // Generate image using Gemini 2.5 Flash Image model
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

export const compareThumbnailsVision = async (imgA: string, imgB: string, provider: 'GROQ' | 'OPENROUTER'): Promise<any> => {
  try {
    const [cA, cB] = await Promise.all([compressImage(imgA), compressImage(imgB)]);
    
    // Explicitly using x-ai/grok-4.1-fast via OpenRouter as requested
    if (provider === 'OPENROUTER') {
      const apiKey = getOpenRouterKey();
      if (!apiKey) throw new Error("VITE_OPENROUTER_API_KEY is missing");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "x-ai/grok-4.1-fast",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze these two YouTube thumbnails. Which has a higher Click-Through Rate (CTR) potential? Critically analyze contrast, readability, facial expressions, and curiosity gaps. Return STRICT JSON with no markdown: { \"winner\": \"A\", \"scoreA\": 8, \"scoreB\": 6, \"reasoning\": \"...\", \"breakdown\": [{\"criterion\": \"Contrast\", \"winner\": \"A\", \"explanation\": \"...\"}] }" },
                { type: "image_url", image_url: { url: cA } },
                { type: "image_url", image_url: { url: cB } }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter/Grok Error: ${response.statusText}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content || "{}";
      return JSON.parse(cleanJson(content));
    }

    // Fallback to Gemini if provider is not OpenRouter
    const getBase64 = (dataUri: string) => dataUri.split(',')[1];
    const mimeTypeA = cA.split(';')[0].split(':')[1] || 'image/jpeg';
    const mimeTypeB = cB.split(';')[0].split(':')[1] || 'image/jpeg';
    
    const prompt = `Analyze these two thumbnails. Which has higher CTR? Return JSON: { "winner": "A", "scoreA": 8, "scoreB": 6, "reasoning": "...", "breakdown": [{"criterion": "Contrast", "winner": "A", "explanation": "..."}] }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeTypeA, data: getBase64(cA) } },
          { inlineData: { mimeType: mimeTypeB, data: getBase64(cB) } },
          { text: prompt }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });

    const result = JSON.parse(cleanJson(response.text || "{}"));
    
    if (!result || typeof result !== 'object') throw new Error("Invalid response");
    if (!result.breakdown || !Array.isArray(result.breakdown)) {
        result.breakdown = []; 
    }
    
    return result;
  } catch (error) {
    console.error("Comparison Vision Error:", error);
    throw error;
  }
};
