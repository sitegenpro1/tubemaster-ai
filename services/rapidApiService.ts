
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
    // Return empty to trigger fallback downstream if needed, but usually we want to know config is missing
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
  const wrappers = ['data', 'stats', 'statistics', 'meta', 'result', 'items', 'channel', 'author', 'snippet', 'results'];
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
      // Remove protocol and domain
      const cleanPath = query.replace(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//, '');
      const pathParts = cleanPath.split(/[/?#]/); // Split by slash, query, or hash
      
      for (const part of pathParts) {
         if (part.startsWith('UC') && part.length === 24) return part; // Found ID in URL
         if (part.startsWith('@')) {
             query = part; // Found handle in URL
             break;
         }
         // Valid handle chars (alphanumeric, dots, underscores, hyphens)
         if (part.length > 0 && !part.match(/^(channel|c|user|results|watch|shorts)$/)) {
            query = part;
         }
      }
    } catch(e) {}
  }

  // 3. Search Strategy
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
      const response = await fetch(`https://${RAPID_HOST}/search?query=${encodeURIComponent(q)}&type=channel`, {
        method: 'GET',
        headers: headers
      });
      
      if (response.ok) {
        const rawData = await response.json();
        const results = unwrapArray(rawData);
        
        for (const r of results) {
            const id = findValue(r, ['channelId', 'channel_id', 'id', 'externalId', 'authorId']);
            if (id && typeof id === 'string' && id.startsWith('UC')) {
                return id;
            }
        }
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
    const response = await fetch(`https://${RAPID_HOST}/channel?id=${channelId}`, {
      method: 'GET',
      headers: headers
    });
    
    const rawData = await response.json();
    
    const title = findValue(rawData, ['title', 'name', 'channelName', 'channelTitle']);
    if (!title) return null; // If no title, consider data invalid

    const subCount = findValue(rawData, ['subscriberCountText', 'subscribersText', 'subscribers', 'subscriber_count']) || 'Hidden';
    const viewCount = findValue(rawData, ['views', 'viewCount', 'viewsText', 'viewCountText']) || '0';
    const videoCount = findValue(rawData, ['videoCount', 'videos', 'videoCountText']) || '0';
    const desc = findValue(rawData, ['description', 'descriptionShort', 'shortDescription']) || 'No description available.';
    
    let avatar = '';
    const avatarObj = findValue(rawData, ['avatar', 'thumbnails', 'image']);
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
      subscriberCount: subCount,
      viewCount: viewCount,
      videoCount: videoCount,
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
    const response = await fetch(`https://${RAPID_HOST}/channel/videos?id=${channelId}`, {
      method: 'GET',
      headers: headers
    });
    
    const rawData = await response.json();
    const items = unwrapArray(rawData);

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
        publishedTimeText: findValue(v, ['publishedTimeText', 'publishedText', 'date']) || '',
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
