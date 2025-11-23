
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
 * The Scrappa API sometimes returns data in `data`, `results`, `items`, or `contents`.
 * This helper checks all possible locations to prevent crashes.
 */
const getArrayFromResponse = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || data.items || data.contents || data.videos || data.data || [];
};

// Helper to extract channel ID from various URL formats or search for handle
export const resolveChannelId = async (input: string): Promise<string> => {
  // 1. If input is a URL with channel_id (UC...)
  const idMatch = input.match(/channel\/(UC[\w-]{21}[AQgw])/);
  if (idMatch) return idMatch[1];

  // 2. Extract handle or query
  let query = input;
  if (input.includes('youtube.com/')) {
    const parts = input.split('youtube.com/');
    query = parts[1].split('/')[0].split('?')[0]; // Remove query params
  }
  
  // Ensure we are searching for a handle if it looks like one
  if (!query.startsWith('@') && !query.startsWith('UC') && !query.includes(' ')) {
    query = `@${query}`;
  }

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
    
    const data = await response.json();
    const results = getArrayFromResponse(data);
    
    // Filter for actual channels
    const channelItem = results.find((item: any) => 
      item.type === 'channel' || (item.channelId && !item.videoId)
    );
    
    if (channelItem) {
        return channelItem.channelId || channelItem.id;
    }
    
    // Fallback: Use first result ID if it looks like a channel ID
    if (results.length > 0 && results[0].id && results[0].id.startsWith('UC')) {
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
    const response = await fetch(`https://${RAPID_HOST}/channel?id=${channelId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    // The API might return the object directly OR wrapped in a 'meta' or 'stats' object
    // We use fallback logic || to catch values wherever they are.
    
    const stats = data.stats || data.statistics || {};
    const meta = data.meta || data;

    return {
      id: meta.id || channelId,
      title: meta.title || meta.name || 'Unknown Channel',
      description: meta.description || '',
      subscriberCount: stats.subscribersText || stats.subscribers || meta.subscribers || 'Hidden',
      viewCount: stats.views || meta.views || '0',
      videoCount: stats.videos || stats.videoCount || meta.videoCount || '0',
      avatar: (meta.avatar && meta.avatar[0]?.url) || meta.avatar || (meta.thumbnails && meta.thumbnails[0]?.url) || '',
      isVerified: meta.isVerified || false
    };
  } catch (e) {
    console.error("Stats Fetch Error", e);
    // Return a safe "Empty" object instead of crashing, allowing partial data display
    return {
      id: channelId,
      title: 'Channel Found (Stats Hidden)',
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
    // Fetch videos, sorted by newest
    const response = await fetch(`https://${RAPID_HOST}/channel/videos?id=${channelId}&filter=videos_latest`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await response.json();
    const contents = getArrayFromResponse(data);
    
    return contents.map((v: any) => {
      // Map varying API response structures
      const vidId = v.videoId || v.id;
      if (!vidId) return null;

      // Safe Thumbnail Extraction
      let thumb = '';
      if (v.thumbnails && v.thumbnails.length > 0) thumb = v.thumbnails[v.thumbnails.length - 1]?.url; // Best quality usually last
      else if (v.thumbnail && v.thumbnail.length > 0) thumb = v.thumbnail[0]?.url;

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
    // Return empty array instead of crashing so AI can still try to analyze stats
    return [];
  }
};
