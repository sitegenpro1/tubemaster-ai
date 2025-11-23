
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
    throw new Error("Configuration Error: VITE_RAPID_API_KEY is missing. Add it to Vercel Environment Variables.");
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
  const wrappers = ['data', 'stats', 'statistics', 'meta', 'result', 'items', 'channel', 'author', 'snippet'];
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

export const resolveChannelId = async (input: string): Promise<string> => {
  let query = input.trim();
  
  // 1. Check for explicit Channel ID format (UC...)
  // YouTube Channel IDs are 24 chars starting with UC
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
         if (part === 'channel' || part === 'c' || part === 'user') continue;
         // If it's a vanity URL part (e.g. /MrBeast), use it
         if (part.length > 0) query = part;
      }
    } catch(e) {}
  }

  // 3. Search Strategy: Try with @, then without
  const attempts = [];
  if (query.startsWith('@')) {
      attempts.push(query); // Try as is (@MrBeast)
      attempts.push(query.substring(1)); // Try without @ (MrBeast)
  } else {
      attempts.push(`@${query}`); // Try with @ (@MrBeast)
      attempts.push(query); // Try as is (MrBeast)
  }

  for (const q of attempts) {
    if (!q) continue;
    console.log(`[RapidAPI] Resolving ID for: ${q}`);
    
    try {
      // Use type=channel to filter
      const response = await fetch(`https://${RAPID_HOST}/search?query=${encodeURIComponent(q)}&type=channel`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (response.ok) {
        const rawData = await response.json();
        const results = unwrapArray(rawData);
        
        // Find the first result that has a valid Channel ID
        for (const r of results) {
            // Search deeply for an ID field
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

  throw new Error(`Could not find a valid Channel ID for "${input}". Try pasting the specific YouTube Channel URL.`);
};

export const getChannelStats = async (channelId: string): Promise<RapidChannelData> => {
  try {
    console.log(`[RapidAPI] Fetching Stats: ${channelId}`);
    const response = await fetch(`https://${RAPID_HOST}/channel?id=${channelId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const rawData = await response.json();
    
    // Robust Parsing using findValue
    const title = findValue(rawData, ['title', 'name', 'channelName', 'channelTitle']) || channelId; // Fallback to ID if title missing
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
    throw new Error("Failed to fetch channel statistics.");
  }
};

export const getChannelVideos = async (channelId: string): Promise<RapidVideoData[]> => {
  try {
    console.log(`[RapidAPI] Fetching Videos: ${channelId}`);
    // Request videos for the channel
    const response = await fetch(`https://${RAPID_HOST}/channel/videos?id=${channelId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const rawData = await response.json();
    const items = unwrapArray(rawData);

    return items.map((v: any) => {
      // Find Video ID
      const vidId = findValue(v, ['videoId', 'id']);
      if (!vidId || typeof vidId !== 'string') return null;

      // Safe Thumbnail Extraction
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
    .slice(0, 15); // Analyze top 15 videos to save tokens

  } catch (e) {
    console.error("Videos API Error", e);
    return []; // Return empty array instead of throwing to allow partial analysis
  }
};
