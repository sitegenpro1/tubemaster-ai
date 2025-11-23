
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
    throw new Error("Configuration Error: VITE_RAPID_API_KEY is missing in environment variables. Please add it to Vercel/Netlify settings.");
  }
  return {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': RAPID_HOST
  };
};

// Helper to extract channel ID from various URL formats or search for handle
export const resolveChannelId = async (input: string): Promise<string> => {
  // 1. If input is a URL with channel_id (UC...)
  const idMatch = input.match(/channel\/(UC[\w-]{21}[AQgw])/);
  if (idMatch) return idMatch[1];

  // 2. Extract handle or query
  let query = input;
  if (input.includes('youtube.com/')) {
    // Handle formats like youtube.com/@handle or youtube.com/c/name
    const parts = input.split('youtube.com/');
    query = parts[1].split('/')[0];
  }
  
  // Ensure we are searching for a handle if it looks like one, otherwise just text
  if (!query.startsWith('@') && !query.startsWith('UC') && !query.includes(' ')) {
    query = `@${query}`;
  }

  // 3. Search for the channel using the API
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
    
    // Scrappa "Unlimited YouTube API" structure:
    // { results: [ { position: 1, type: "channel", channel: { id: "...", ... } } ] }
    const results = data.results || data.data || [];
    
    // Filter for actual channels
    const channelItem = results.find((item: any) => 
      item.type === 'channel' || (item.channel && item.channel.id)
    );
    
    if (channelItem) {
        return channelItem.channel?.id || channelItem.id;
    }
    
    // Fallback if structure is flat or different
    if (results.length > 0 && results[0].id) {
        return results[0].id;
    }
    
    throw new Error('Channel not found');
  } catch (e: any) {
    console.error("ID Resolution Error", e);
    throw new Error(`Could not find channel for: ${query}. Please check the handle or API Key.`);
  }
};

export const getChannelStats = async (channelId: string): Promise<RapidChannelData> => {
  try {
    const response = await fetch(`https://${RAPID_HOST}/channel?id=${channelId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await response.json();
    
    // API returns specific fields, we map them to our interface
    // Note: Scrappa often nests stats in a 'stats' object or root
    
    const stats = data.stats || {};
    
    return {
      id: data.id || channelId,
      title: data.title || data.name || 'Unknown',
      description: data.description || '',
      subscriberCount: stats.subscribersText || stats.subscribers || data.subscribers || 'Hidden',
      viewCount: stats.views || data.views || '0',
      videoCount: stats.videos || data.videoCount || '0',
      avatar: data.avatar?.[0]?.url || data.avatar || '',
      isVerified: data.isVerified || false
    };
  } catch (e) {
    console.error("Stats Fetch Error", e);
    throw new Error('Failed to fetch channel stats');
  }
};

export const getChannelVideos = async (channelId: string): Promise<RapidVideoData[]> => {
  try {
    // Fetch videos, sorted by newest to see what they are doing NOW
    const response = await fetch(`https://${RAPID_HOST}/channel/videos?id=${channelId}&filter=videos_latest`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    const data = await response.json();
    const contents = data.items || data.contents || data.videos || [];
    
    return contents.map((v: any) => {
      // Map varying API response structures
      const vidId = v.videoId || v.id;
      if (!vidId) return null;

      return {
        videoId: vidId,
        title: v.title || 'Untitled',
        viewCount: v.views || v.viewCountText || '0',
        publishedTimeText: v.publishedTimeText || v.published || 'Recently',
        lengthText: v.durationText || v.lengthText || '',
        thumbnail: v.thumbnails?.[0]?.url || v.thumbnail?.[0]?.url || ''
      };
    }).filter(Boolean).slice(0, 20); // Get top 20 for AI analysis
  } catch (e) {
    console.error("Videos Fetch Error", e);
    throw new Error('Failed to fetch videos');
  }
};
