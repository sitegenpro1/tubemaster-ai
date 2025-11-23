
import React, { useState } from 'react';
import { Button, Input, SectionTitle, Card, Badge } from '../components/UI';
import { SEO } from '../components/SEO';

interface ThumbOption {
  label: string;
  res: string;
  url: string;
  key: string;
}

export const ThumbnailDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const extractId = (input: string) => {
    setError('');
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = input.match(regExp);

    if (match && match[2].length === 11) {
      setVideoId(match[2]);
    } else {
      setError('Invalid YouTube URL. Please try again.');
      setVideoId(null);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    if (val.length > 10) extractId(val);
  };

  const downloadImage = async (imgUrl: string, label: string) => {
    try {
      // Attempt to fetch as blob to force download
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `tubemaster-${label}-${videoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // Fallback if CORS blocks the fetch
      window.open(imgUrl, '_blank');
    }
  };

  const getThumbnails = (id: string): ThumbOption[] => [
    { label: 'Max Resolution (HD)', res: '1280x720', url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`, key: 'max' },
    { label: 'Standard Definition', res: '640x480', url: `https://img.youtube.com/vi/${id}/sddefault.jpg`, key: 'sd' },
    { label: 'High Quality', res: '480x360', url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, key: 'hq' },
    { label: 'Medium Quality', res: '320x180', url: `https://img.youtube.com/vi/${id}/mqdefault.jpg`, key: 'mq' },
  ];

  return (
    <div className="space-y-16 pb-20">
      <SEO 
        title="YouTube Thumbnail Downloader (4K & HD)" 
        description="Free YouTube Thumbnail Downloader. Extract high-quality images (1080p, 720p) from any YouTube video instantly without API keys." 
        path="/thumbnail-downloader" 
      />

      {/* Hero */}
      <div className="text-center pt-8 md:pt-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-600/10 blur-[100px] rounded-full -z-10"></div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3">
          YouTube <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Thumbnail Grabber</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Extract high-resolution cover images from any video or Short in seconds.
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-700/50 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
          
          <div className="flex flex-col gap-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Paste Video Link</label>
            <div className="relative">
              <input 
                value={url}
                onChange={handleInput}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-4 text-lg text-white placeholder:text-slate-600 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all pr-12"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                🔗
              </div>
            </div>
            {error && <p className="text-rose-400 text-sm font-medium animate-pulse">⚠️ {error}</p>}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {videoId && (
        <div className="max-w-6xl mx-auto px-4 animate-slide-up space-y-8">
          
          <div className="flex items-center gap-3">
            <Badge color="red">ID: {videoId}</Badge>
            <span className="text-slate-500 text-sm">4 Variations Found</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Main Preview (Max Res) */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-700 shadow-2xl group">
                <img 
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                  onError={(e) => {
                    // Fallback if maxres doesn't exist (older videos)
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }}
                  alt="Max Resolution" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/20">Preview HD</span>
                </div>
              </div>
            </div>

            {/* Download Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {getThumbnails(videoId).map((t) => (
                <div key={t.key} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-red-500/30 transition-all group">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="text-white font-bold text-sm">{t.label}</h4>
                       <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">{t.res}</span>
                    </div>
                    <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden group-hover:w-full transition-all duration-500">
                      <div className="h-full bg-red-500"></div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => downloadImage(t.url, t.key)}
                    className="w-full py-2.5 rounded-lg bg-slate-950 text-slate-300 font-medium text-sm border border-slate-800 hover:bg-red-600 hover:text-white hover:border-red-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download Image
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEO Content */}
      <section className="max-w-4xl mx-auto px-4 pt-16 border-t border-slate-800/50 mt-12">
        <SectionTitle title="Why Download Thumbnails?" subtitle="Use cases for creators, designers, and marketers." center />
        
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card title="Competitor Analysis" className="bg-slate-900/30">
            <p className="text-slate-400 text-sm">
              Download high-performing thumbnails from your niche to analyze their composition, color grading, and text placement. Build a "Swipe File" of inspiration.
            </p>
          </Card>
          <Card title="A/B Testing Archives" className="bg-slate-900/30">
            <p className="text-slate-400 text-sm">
              Recover your own thumbnails if you lost the original source files. Useful for re-uploading or running historical A/B tests on older content.
            </p>
          </Card>
          <Card title="Blog & Social Sharing" className="bg-slate-900/30">
            <p className="text-slate-400 text-sm">
              Embed high-res video covers in your blog posts, newsletters, or Twitter threads to link back to the YouTube video with a professional look.
            </p>
          </Card>
        </div>

        <div className="mt-12 bg-slate-950 p-6 rounded-xl border-l-4 border-red-500 text-slate-400 text-sm leading-relaxed">
          <strong>Copyright Note:</strong> YouTube thumbnails are the intellectual property of the video creator. Fair Use usually applies for commentary, criticism, and analysis, but do not use downloaded thumbnails as your own on YouTube without permission.
        </div>
      </section>

    </div>
  );
};
