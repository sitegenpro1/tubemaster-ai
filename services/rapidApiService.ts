
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

// Recursively search for a key in an object
const findValue = (obj: any, possibleKeys: string[]): any => {
  if (!obj || typeof obj !== 'object') return undefined;
  
  // 1. Direct check
  for (const key of possibleKeys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  
  // 2. Check common wrapper keys 'data', 'stats', 'statistics', 'meta'
  const wrappers = ['data', 'stats', 'statistics', 'meta', 'result', 'items'];
  for (const wrapper of wrappers) {
    if (obj[wrapper] && typeof obj[wrapper] === 'object') {
      const val = findValue(obj[wrapper], possibleKeys);
      if (val !== undefined) return val;
    }
  }
  
  return undefined;
};

const unwrapArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.contents)) return data.contents;
  return [];
};

// --- CORE SERVICES ---

export const resolveChannelId = async (input: string): Promise<string> => {
  // 1. Check for ID in URL (Standard YouTube Channel ID format is UC...)
  const idMatch = input.match(/(UC[\w-]{21}[AQgw])/);
  if (idMatch) return idMatch[1];

  // 2. Extract query/handle
  let query = input;
  if (input.includes('youtube.com/')) {
    try {
      const parts = input.split('youtube.com/');
      // Handle /channel/, /c/, /user/, or /@handle
      const afterDomain = parts[1].split(/[/?#]/)[0];
      if (afterDomain.startsWith('@')) {
        query = afterDomain;
      } else if (parts[1].includes('channel/')) {
         // Already handled by regex above usually, but fallback
         const sub = parts[1].split('channel/')[1];
         return sub.split(/[/?#]/)[0];
      } else {
         query = afterDomain;
      }
    } catch(e) {}
  }

  // Ensure handle format for search if it looks like a handle
  if (!query.startsWith('@') && !query.startsWith('UC') && !query.includes(' ')) {
    query = `@${query}`;
  }

  console.log(`[RapidAPI] Searching for: ${query}`);

  try {
    const response = await fetch(`https://${RAPID_HOST}/search?query=${encodeURIComponent(query)}&type=channel`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
       if (response.status === 403 || response.status === 401) throw new Error("Invalid RapidAPI Key");
       throw new Error(`Search failed: ${response.status}`);
    }
    
    const rawData = await response.json();
    const results = unwrapArray(rawData);
    
    // Find first valid channel
    const channel = results.find((r: any) => 
      r.type === 'channel' || 
      (r.channelId && r.channelId.startsWith('UC')) ||
      (r.id && typeof r.id === 'string' && r.id.startsWith('UC'))
    );

    if (channel) {
      return channel.channelId || channel.id;
    }

    // Fallback: If no channel type found, grab anything starting with UC
    const anyResult = results.find((r: any) => r.id && r.id.startsWith && r.id.startsWith('UC'));
    if (anyResult) return anyResult.id;

    throw new Error('Channel not found via Search');
  } catch (e: any) {
    console.warn("Search Error:", e);
    // If it was a handle search failure, maybe the API needs just the name
    if (query.startsWith('@')) {
       // Recursive retry without '@' is dangerous for loops, so we just throw for now or handle in UI
    }
    throw new Error(`Could not find channel for: ${query}`);
  }
};

export const getChannelStats = async (channelId: string): Promise<RapidChannelData> => {
  try {
    console.log(`[RapidAPI] Getting Stats: ${channelId}`);
    const response = await fetch(`https://${RAPID_HOST}/channel?id=${channelId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const rawData = await response.json();
    console.log('[RapidAPI] Stats Data:', rawData);

    // Robust extraction
    const title = findValue(rawData, ['title', 'name', 'channelName', 'channelTitle']) || 'Unknown Channel';
    const subCount = findValue(rawData, ['subscriberCountText', 'subscribersText', 'subscribers', 'subscriber_count']) || 'Hidden';
    const viewCount = findValue(rawData, ['views', 'viewCount', 'viewsText', 'viewCountText']) || '0';
    const videoCount = findValue(rawData, ['videoCount', 'videos', 'videoCountText']) || '0';
    const desc = findValue(rawData, ['description', 'descriptionShort', 'shortDescription']) || '';
    
    // Avatar extraction is often nested in arrays
    let avatar = '';
    const avatarObj = findValue(rawData, ['avatar', 'thumbnails', 'image']);
    if (Array.isArray(avatarObj) && avatarObj.length > 0) {
      avatar = avatarObj[0].url || avatarObj[0];
    } else if (typeof avatarObj === 'string') {
      avatar = avatarObj;
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
    return {
      id: channelId,
      title: 'Unknown Channel',
      description: 'API Error',
      subscriberCount: '---',
      viewCount: '---',
      videoCount: '---',
      avatar: '',
      isVerified: false
    };
  }
};

export const getChannelVideos = async (channelId: string): Promise<RapidVideoData[]> => {
  try {
    console.log(`[RapidAPI] Getting Videos: ${channelId}`);
    // NOTE: Removed 'filter' parameter as it can cause empty results on some endpoints
    const response = await fetch(`https://${RAPID_HOST}/channel/videos?id=${channelId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const rawData = await response.json();
    const items = unwrapArray(rawData);

    console.log(`[RapidAPI] Found ${items.length} videos`);

    return items.map((v: any) => {
      const vidId = v.videoId || v.id;
      if (!vidId || typeof vidId !== 'string') return null;

      // Safe Thumbnail
      let thumb = '';
      if (v.thumbnails && v.thumbnails.length) thumb = v.thumbnails[0].url;
      else if (v.thumbnail && v.thumbnail.length) thumb = v.thumbnail[0].url;
      else if (typeof v.thumbnail === 'string') thumb = v.thumbnail;

      return {
        videoId: vidId,
        title: v.title || 'Untitled',
        viewCount: v.views || v.viewCountText || '0',
        publishedTimeText: v.publishedTimeText || v.publishedText || v.published || '',
        lengthText: v.lengthText || v.durationText || v.duration || '',
        thumbnail: thumb
      };
    })
    .filter(Boolean)
    .slice(0, 20); // Top 20

  } catch (e) {
    console.error("Videos API Error", e);
    return [];
  }
};
