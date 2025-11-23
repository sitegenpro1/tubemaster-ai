
import { KeywordResult, ScriptResponse, CompetitorAnalysisResult, ThumbnailGenResult, ThumbnailCompareResult, RapidFullAnalysisData, DescriptionResult } from "../types";

// --- CONFIGURATION ---

// Centralized Model Definitions
// Text Tools -> GROQ Provider (gpt-oss-120b as requested)
const TEXT_MODEL = 'openai/gpt-oss-120b'; 
// Vision Tools -> OPENROUTER Provider
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

// --- SAFETY & ETHICS FILTER ---
const ETHICAL_SAFETY_INSTRUCTION = `
  STRICT SAFETY & ETHICAL GUIDELINES:
  1. Do NOT generate content that is hateful, racist, sexist, or promotes violence or harm.
  2. Do NOT generate content that is sexually explicit (NSFW), promotes pornography, or nudity.
  3. Do NOT generate content that promotes gambling, excessive alcohol consumption, or illegal drug use.
  4. Do NOT generate content that is sinful, religiously offensive, or ethically compromising (haram/sinful).
  5. If the user request violates these rules, refuse to generate the specific harmful part and provide a sanitized, safe alternative.
  6. Maintain a helpful, professional, and commercial-safe tone at all times.
`;

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

  if (!isGroq) {
    headers["HTTP-Referer"] = "https://tubemaster.ai";
    headers["X-Title"] = "TubeMaster AI";
  }

  // Inject safety instruction into the system prompt or first message
  const safeMessages = [...messages];
  if (safeMessages.length > 0 && safeMessages[0].role === 'system') {
    safeMessages[0].content += " " + ETHICAL_SAFETY_INSTRUCTION;
  } else {
    safeMessages.unshift({ role: 'system', content: ETHICAL_SAFETY_INSTRUCTION });
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: model,
        messages: safeMessages,
        temperature: 0.7,
        response_format: jsonMode ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const err = await response.text();
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

export const generateSeoTags = async (topic: string): Promise<string[]> => {
  const systemPrompt = "You are a world-class YouTube SEO Expert. Your job is to generate the absolute best metadata tags.";
  const userPrompt = `
    Video Topic: "${topic}"
    
    Task: Generate EXACTLY 5 extremely powerful, high-volume, low-competition tags. 
    Do not give generic tags. Give semantic, long-tail tags that specific audiences search for.
    
    Output strictly JSON: { "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"] }
  `;

  const jsonStr = await callAI('GROQ', TEXT_MODEL, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
  ], true);

  const parsed = JSON.parse(cleanJson(jsonStr));
  return parsed.tags || [];
};

export const generateVideoDescription = async (topic: string, keywords: string): Promise<DescriptionResult> => {
  const systemPrompt = "You are a YouTube Growth Hacker. You write video descriptions that trigger the algorithm and convert viewers.";
  const userPrompt = `
    Video Title/Topic: "${topic}"
    Focus Keywords (optional): "${keywords}"
    
    Write a high-ranking description.
    Structure:
    1. Hook: 2 lines that appear 'above the fold' to grab attention.
    2. Body: SEO-rich summary of what the video covers. Natural language, but keyword heavy.
    3. Hashtags: 3-5 specific hashtags.
    
    Output strictly JSON: 
    { 
      "hook": "string", 
      "body": "string", 
      "keywordsUsed": ["string"], 
      "hashtags": ["string"] 
    }
  `;

  const jsonStr = await callAI('GROQ', TEXT_MODEL, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
  ], true);

  return JSON.parse(cleanJson(jsonStr));
};

export const analyzeCompetitor = async (scrapedData: RapidFullAnalysisData): Promise<CompetitorAnalysisResult> => {
  // Relaxed Validation: Accept if we have a channel object
  if (!scrapedData || !scrapedData.channel) {
    throw new Error("Invalid channel data provided to AI analysis.");
  }

  const systemPrompt = "You are a YouTube Strategist. Output strictly JSON.";
  
  const videoSummary = scrapedData.recentVideos.length > 0 
    ? scrapedData.recentVideos.map(v => `- "${v.title}" (${v.viewCount} views, ${v.publishedTimeText})`).join('\n')
    : "No recent videos found. Base analysis on general niche assumptions.";

  const userPrompt = `
    Analyze this competitor channel data:
    Channel: ${scrapedData.channel.title}
    Subs: ${scrapedData.channel.subscriberCount}
    Description: ${scrapedData.channel.description.substring(0, 300)}...
    
    Recent Videos:
    ${videoSummary}

    Task:
    1. Identify content gaps (what topics are missing or underperforming?).
    2. Analyze what is working (high views relative to subs). EXTRACT SPECIFIC KEYWORDS/NICHES from the high performing videos.
    3. Create a "Steal Their Traffic" action plan.

    Provide a strategic analysis in this JSON format:
    {
      "channelName": "string (Use actual name)",
      "subscriberEstimate": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "contentGaps": ["string (Topic ideas they missed)"],
      "topPerformingTopics": ["string (Specific keywords/niches driving views)"],
      "actionPlan": "string (Strategic advice)"
    }
  `;

  const jsonStr = await callAI('GROQ', TEXT_MODEL, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
  ], true);

  return JSON.parse(cleanJson(jsonStr));
};

// Fallback function when API fails
export const estimateCompetitorAnalysis = async (query: string): Promise<CompetitorAnalysisResult> => {
  const systemPrompt = "You are a YouTube Strategist. The user provided a channel handle or name, but live data is unavailable. You must generate a high-quality strategic analysis based on your internal knowledge of this channel (if famous) or by inferring the niche from the name.";
  
  const userPrompt = `
    Channel Identifier: "${query}"
    
    Task:
    1. Infer the likely niche (e.g., Gaming, Finance, Music, Vlog) based on the name.
    2. Estimate likely subscriber count if famous, or default to "Unknown/Hidden" if generic.
    3. Generate generic but high-value advice for this specific niche.
    4. Identify "Evergreen" topics for this niche as "Top Performing".
    
    Output STRICT JSON:
    {
      "channelName": "${query}",
      "subscriberEstimate": "Estimated",
      "strengths": ["string (General niche strengths)"],
      "weaknesses": ["string (Common niche pitfalls)"],
      "contentGaps": ["string ( underserved topics in this niche)"],
      "topPerformingTopics": ["string (Viral topics in this niche)"],
      "actionPlan": "string (Strategic advice)"
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
  return await callAI('GROQ', TEXT_MODEL, [{ role: "user", content: userPrompt }], false);
};

export const generateThumbnail = async (prompt: string, style: string, mood: string, optimize: boolean): Promise<ThumbnailGenResult> => {
  let finalPrompt = prompt;

  // STRICT POLICY: Prevent generation of realistic human figures for safety/cost reasons
  // Added Ethical Constraints
  const safetyInstruction = " Important Constraint: Do NOT generate any human figures, faces, people, men, women, or skin. If the user asks for a person, replace it with a robot, silhouette, or abstract geometric representation. Focus strictly on objects, environments, text, and scenery. Ensure content is ethically safe, non-violent, and not hateful.";

  if (optimize) {
    try {
      finalPrompt = await callAI('GROQ', TEXT_MODEL, [{
        role: "user", 
        content: `Enhance this image prompt for an AI generator (Flux/Midjourney). Make it detailed, describing lighting and composition. ${safetyInstruction} ${ETHICAL_SAFETY_INSTRUCTION} Prompt: "${prompt}". Style: ${style}, Mood: ${mood}. Output ONLY the prompt text.`
      }], false);
    } catch (e) {
      console.warn("Prompt optimization failed, using original");
      finalPrompt = prompt + " " + safetyInstruction;
    }
  } else {
    // If not optimized, just append the constraint
    finalPrompt = prompt + " " + safetyInstruction;
  }

  const encodedPrompt = encodeURIComponent(finalPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&model=flux&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;

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
            { type: "text", text: `Analyze these two YouTube thumbnails. Which has higher CTR potential? Output strictly JSON: { "winner": "A" or "B", "scoreA": number, "scoreB": number, "reasoning": "string", "breakdown": [{"criterion": "Contrast", "winner": "A", "explanation": "string"}] } ${ETHICAL_SAFETY_INSTRUCTION}` },
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
