
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

/**
 * HELPER: Safe Data Extractor
 * The Scrappa API often wraps responses in a 'data' object.
 * We must unwrap it to get to the actual content.
 */
const unwrapResponse = (data: any): any => {
  if (!data) return {};
  // If the root has a 'data' property that is an object (and not an array), usually that's the payload
  if (data.data && !Array.isArray(data.data) && typeof data.data === 'object') {
    return data.data;
  }
  return data;
};

const getArrayFromResponse = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  
  // Scrappa often puts lists in 'data', 'items', 'results'
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.contents)) return data.contents;
  
  return [];
};

// Helper to extract channel ID from various URL formats or search for handle
export const resolveChannelId = async (input: string): Promise<string> => {
  // 1. If input is a URL with channel_id (UC...)
  const idMatch = input.match(/channel\/(UC[\w-]{21}[AQgw])/);
  if (idMatch) return idMatch[1];

  // 2. Extract handle or query
  let query = input;
  if (input.includes('youtube.com/')) {
    try {
      const parts = input.split('youtube.com/');
      query = parts[1].split('/')[0].split('?')[0]; // Remove query params
    } catch(e) {
      // Fallback
    }
  }
  
  // Ensure we are searching for a handle if it looks like one
  if (!query.startsWith('@') && !query.startsWith('UC') && !query.includes(' ')) {
    query = `@${query}`;
  }

  console.log(`[RapidAPI] Searching for channel ID: ${query}`);

  // 3. Search for the channel
  try {
    const response = await fetch(`https://${RAPID_HOST}/search?query=${encodeURIComponent(query)}&type=channel`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) {
       if (response.status === 403 || response.status === 401) throw new Error("Invalid RapidAPI Key");
       throw new Error('Search failed');
    }
    
    const rawData = await response.json();
    console.log('[RapidAPI] Search Response:', rawData);

    const results = getArrayFromResponse(rawData);
    
    // Filter for actual channels
    const channelItem = results.find((item: any) => 
      item.type === 'channel' || (item.channelId && !item.videoId)
    );
    
    if (channelItem) {
        return channelItem.channelId || channelItem.id;
    }
    
    // Fallback: Use first result ID if it looks like a channel ID
    if (results.length > 0 && results[0].id && typeof results[0].id === 'string' && results[0].id.startsWith('UC')) {
        return results[0].id;
    }
    
    throw new Error('Channel not found');
  } catch (e: any) {
    console.error("ID Resolution Error", e);
    throw new Error(`Could not find channel: ${query}. Please check your spelling or API Key.`);
  }
};

export const getChannelStats = async (channelId: string): Promise<RapidChannelData> => {
  try {
    console.log(`[RapidAPI] Fetching Stats for ID: ${channelId}`);
    const response = await fetch(`https://${RAPID_HOST}/channel?id=${channelId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const rawData = await response.json();
    console.log('[RapidAPI] Raw Stats Response:', rawData);

    // UNWRAP LOGIC: This is where it was failing. We need to check if everything is inside .data
    const root = unwrapResponse(rawData);
    
    // Sometimes stats are in root.stats, sometimes just in root
    const stats = root.stats || root.statistics || root;
    const meta = root.meta || root;

    return {
      id: meta.id || channelId,
      title: meta.title || meta.name || meta.channelName || 'Unknown Channel',
      description: meta.description || '',
      subscriberCount: stats.subscribersText || stats.subscribers || meta.subscribers || 'Hidden',
      viewCount: stats.views || meta.views || '0',
      videoCount: stats.videos || stats.videoCount || meta.videoCount || '0',
      avatar: (meta.avatar && meta.avatar[0]?.url) || meta.avatar || (meta.thumbnails && meta.thumbnails[0]?.url) || '',
      isVerified: meta.isVerified || false
    };
  } catch (e) {
    console.error("Stats Fetch Error", e);
    return {
      id: channelId,
      title: 'Channel Found (Stats Error)',
      description: 'Could not retrieve full stats.',
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
    console.log(`[RapidAPI] Fetching Videos for ID: ${channelId}`);
    // Fetch videos, sorted by newest
    const response = await fetch(`https://${RAPID_HOST}/channel/videos?id=${channelId}&filter=videos_latest`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const rawData = await response.json();
    // No full log here to avoid clutter, but check array extraction
    const contents = getArrayFromResponse(rawData);
    
    if (contents.length === 0) {
      console.warn('[RapidAPI] No videos found in response:', rawData);
    }

    return contents.map((v: any) => {
      // Map varying API response structures
      const vidId = v.videoId || v.id;
      if (!vidId) return null;

      // Safe Thumbnail Extraction
      let thumb = '';
      if (v.thumbnails && v.thumbnails.length > 0) thumb = v.thumbnails[v.thumbnails.length - 1]?.url; 
      else if (v.thumbnail && Array.isArray(v.thumbnail)) thumb = v.thumbnail[0]?.url;
      else if (typeof v.thumbnail === 'string') thumb = v.thumbnail;

      return {
        videoId: vidId,
        title: v.title || 'Untitled',
        viewCount: v.views || v.viewCountText || '0',
        publishedTimeText: v.publishedTimeText || v.published || 'Recently',
        lengthText: v.durationText || v.lengthText || '',
        thumbnail: thumb
      };
    }).filter(Boolean).slice(0, 20); // Get top 20 for AI analysis
  } catch (e) {
    console.error("Videos Fetch Error", e);
    return [];
  }
};
