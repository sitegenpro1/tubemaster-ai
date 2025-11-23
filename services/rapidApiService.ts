
import { RapidChannelData, RapidVideoData } from '../types';

// Host for "Unlimited YouTube API" by Scrappa on RapidAPI
const RAPID_HOST = 'unlimited-youtube-api.p.rapidapi.com';

const getApiKey = () => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env.VITE_RAPID_API_KEY;
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    return process.env.VITE_RAPID_API_KEY;
  }
  return '';
};

const getHeaders = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("VITE_RAPID_API_KEY is missing.");
    return null;
  }
  return {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': RAPID_HOST
  };
};

// --- HELPER FUNCTIONS ---

// Improved recursive search for a key in a complex object
const findValue = (obj: any, possibleKeys: string[]): any => {
  if (!obj || typeof obj !== 'object') return undefined;
  
  // 1. Direct check at current level
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  }
  
  // 2. Check common API wrapper keys
  const wrappers = ['data', 'stats', 'statistics', 'meta', 'result', 'items', 'channel', 'author', 'snippet', 'results', 'details'];
  for (const wrapper of wrappers) {
    if (obj[wrapper] && typeof obj[wrapper] === 'object') {
      const val = findValue(obj[wrapper], possibleKeys);
      if (val !== undefined) return val;
    }
  }
  
  return undefined;
};

// Robust array unwrapper that handles multiple nesting levels
const unwrapArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  
  // Check common array container keys
  const keys = ['data', 'items', 'results', 'contents', 'channels', 'videos'];
  for (const k of keys) {
      if (data[k]) {
          if (Array.isArray(data[k])) return data[k];
          // Recurse if the key points to an object (e.g. data.items)
          if (typeof data[k] === 'object') {
             const nested = unwrapArray(data[k]);
             if (nested.length > 0) return nested;
          }
      }
  }
  
  // Fallback: if data contains a single object that looks like a result, wrap it
  if (data.id || data.channelId || data.title) return [data];
  
  return [];
};

// --- CORE SERVICES ---

export const resolveChannelId = async (input: string): Promise<string | null> => {
  let query = input.trim();
  const headers = getHeaders();
  if (!headers) return null; // Fallback to AI if no key

  // 1. Check for explicit Channel ID format (UC...)
  const idMatch = query.match(/^(UC[\w-]{21}[AQgw])$/);
  if (idMatch) return idMatch[1];

  // 2. Extract handle/ID from URL
  if (query.includes('youtube.com/') || query.includes('youtu.be/')) {
    try {
      const cleanPath = query.replace(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//, '');
      const pathParts = cleanPath.split(/[/?#]/); 
      
      for (const part of pathParts) {
         if (part.startsWith('UC') && part.length === 24) return part; 
         if (part.startsWith('@')) {
             query = part;
             break;
         }
         if (part.length > 0 && !part.match(/^(channel|c|user|results|watch|shorts)$/)) {
            query = part;
         }
      }
    } catch(e) {}
  }

  // 3. Search Strategy - Try both exact match and search endpoint
  // Note: Based on the screenshot, /searchYouTube or /search is likely correct
  const attempts = [];
  if (query.startsWith('@')) {
      attempts.push(query); 
      attempts.push(query.substring(1));
  } else {
      attempts.push(`@${query}`);
      attempts.push(query);
  }

  for (const q of attempts) {
    if (!q) continue;
    console.log(`[RapidAPI] Resolving ID for: ${q}`);
    
    try {
      // Try multiple search endpoints common to this API family
      const endpoints = [
        `https://${RAPID_HOST}/search?query=${encodeURIComponent(q)}&type=channel`,
        `https://${RAPID_HOST}/searchYouTube?query=${encodeURIComponent(q)}&type=channel`
      ];

      for (const url of endpoints) {
        try {
          const response = await fetch(url, { method: 'GET', headers: headers });
          if (response.ok) {
            const rawData = await response.json();
            const results = unwrapArray(rawData);
            
            for (const r of results) {
                // Check if result matches the handle we are looking for (fuzzy check)
                const id = findValue(r, ['channelId', 'channel_id', 'id', 'externalId', 'authorId']);
                if (id && typeof id === 'string' && id.startsWith('UC')) {
                    return id;
                }
            }
          }
        } catch(innerE) { continue; }
      }
    } catch (e) {
      console.warn(`Search attempt failed for ${q}`, e);
    }
  }

  console.warn(`Could not resolve ID for ${input}. Returning null for AI fallback.`);
  return null;
};

export const getChannelStats = async (channelId: string): Promise<RapidChannelData | null> => {
  const headers = getHeaders();
  if (!headers) return null;

  try {
    console.log(`[RapidAPI] Fetching Stats: ${channelId}`);
    
    // We try 'details' first as it usually has everything, then 'stats' if that fails
    const endpoints = [
       `https://${RAPID_HOST}/channels/details?id=${channelId}`, // Plural "channels" per screenshot
       `https://${RAPID_HOST}/channel/details?id=${channelId}`, // Singular fallback
       `https://${RAPID_HOST}/channels/about?id=${channelId}`,
       `https://${RAPID_HOST}/channel?id=${channelId}`
    ];

    let rawData: any = null;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, { method: 'GET', headers: headers });
        if (response.ok) {
          rawData = await response.json();
          // Verify we got valid data
          const t = findValue(rawData, ['title', 'name', 'channelName', 'channelTitle']);
          if (t) break; // We found good data
        }
      } catch(e) {}
    }
    
    if (!rawData) return null;
    
    const title = findValue(rawData, ['title', 'name', 'channelName', 'channelTitle']);
    if (!title) return null; 

    const subCount = findValue(rawData, ['subscriberCountText', 'subscribersText', 'subscribers', 'subscriber_count', 'stats.subscribers']) || 'Hidden';
    const viewCount = findValue(rawData, ['views', 'viewCount', 'viewsText', 'viewCountText', 'stats.views']) || '0';
    const videoCount = findValue(rawData, ['videoCount', 'videos', 'videoCountText', 'stats.videos']) || '0';
    const desc = findValue(rawData, ['description', 'descriptionShort', 'shortDescription']) || 'No description available.';
    
    let avatar = '';
    const avatarObj = findValue(rawData, ['avatar', 'thumbnails', 'image', 'profilePicture']);
    if (Array.isArray(avatarObj) && avatarObj.length > 0) {
       avatar = avatarObj[0].url || avatarObj[0];
    } else if (typeof avatarObj === 'string') {
       avatar = avatarObj;
    } else if (avatarObj && avatarObj.url) {
       avatar = avatarObj.url;
    }

    const isVerified = findValue(rawData, ['isVerified', 'verified']) === true;

    return {
      id: channelId,
      title,
      description: desc,
      subscriberCount: typeof subCount === 'number' ? `${subCount}` : subCount,
      viewCount: typeof viewCount === 'number' ? `${viewCount}` : viewCount,
      videoCount: typeof videoCount === 'number' ? `${videoCount}` : videoCount,
      avatar,
      isVerified
    };
  } catch (e) {
    console.error("Stats API Error", e);
    return null;
  }
};

export const getChannelVideos = async (channelId: string): Promise<RapidVideoData[]> => {
  const headers = getHeaders();
  if (!headers) return [];

  try {
    console.log(`[RapidAPI] Fetching Videos: ${channelId}`);
    
    // Try plural 'channels' first (matching screenshot style) then singular
    const endpoints = [
      `https://${RAPID_HOST}/channels/videos?id=${channelId}`,
      `https://${RAPID_HOST}/channel/videos?id=${channelId}`
    ];

    let items: any[] = [];
    
    for (const url of endpoints) {
        try {
            const response = await fetch(url, { method: 'GET', headers: headers });
            if (response.ok) {
                const rawData = await response.json();
                const result = unwrapArray(rawData);
                if (result.length > 0) {
                    items = result;
                    break;
                }
            }
        } catch(e) {}
    }

    return items.map((v: any) => {
      const vidId = findValue(v, ['videoId', 'id']);
      if (!vidId || typeof vidId !== 'string') return null;

      let thumb = '';
      const thumbObj = findValue(v, ['thumbnails', 'thumbnail']);
      if (Array.isArray(thumbObj) && thumbObj.length > 0) thumb = thumbObj[0].url;
      else if (thumbObj && thumbObj.url) thumb = thumbObj.url;
      else if (typeof thumbObj === 'string') thumb = thumbObj;

      return {
        videoId: vidId,
        title: findValue(v, ['title', 'videoTitle']) || 'Untitled Video',
        viewCount: findValue(v, ['views', 'viewCount', 'viewCountText']) || '0',
        publishedTimeText: findValue(v, ['publishedTimeText', 'publishedText', 'date', 'publishedTime']) || '',
        lengthText: findValue(v, ['lengthText', 'durationText', 'duration']) || '',
        thumbnail: thumb
      };
    })
    .filter(Boolean)
    .slice(0, 15);

  } catch (e) {
    console.error("Videos API Error", e);
    return [];
  }
};
