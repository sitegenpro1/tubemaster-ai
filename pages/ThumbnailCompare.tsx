
import React, { useState } from 'react';
import { Card, Button, Spinner, Badge } from '../components/UI';
import { compareThumbnailsVision } from '../services/geminiService';
import { ThumbnailCompareResult } from '../types';
import { SEO } from '../components/SEO';

// Client-side compression utility
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 1024;

        // Maintain aspect ratio while resizing
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Canvas context unavailable"));
            return;
        }
        
        // Draw white background for transparency handling (PNG -> JPEG)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        const MAX_BYTES = 600 * 1024; // 600KB limit for API safety
        let quality = 0.95;
        
        // Iterative compression to meet size requirements
        const attemptCompression = (q: number) => {
            const dataUrl = canvas.toDataURL('image/jpeg', q);
            // Estimate size: (Base64 Chars - Header) * 0.75 = Bytes
            const head = 'data:image/jpeg;base64,';
            const size = Math.round((dataUrl.length - head.length) * 0.75);
            
            if (size <= MAX_BYTES) {
                resolve(dataUrl);
            } else if (q <= 0.3) {
                // If quality drops too low and still big, fail gracefully
                reject(new Error("Image too large"));
            } else {
                // Step down quality
                attemptCompression(q - 0.15);
            }
        };
        
        attemptCompression(quality);
      };
      img.onerror = () => reject(new Error("Image load failed"));
    };
    reader.onerror = () => reject(new Error("File read failed"));
  });
};

export const ThumbnailCompare: React.FC = () => {
  const [imgA, setImgA] = useState<string | null>(null);
  const [imgB, setImgB] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false); // New state for compression status
  const [result, setResult] = useState<ThumbnailCompareResult | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, setImg: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setProcessing(true);
      try {
        const compressedDataUrl = await compressImage(file);
        setImg(compressedDataUrl);
      } catch (err) {
        console.error("Compression failed:", err);
        alert("Please upload images smaller than 600 KB");
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleCompare = async () => {
    if (!imgA || !imgB) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await compareThumbnailsVision(imgA, imgB, 'OPENROUTER');
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Comparison failed. Check your OpenRouter API Key or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <SEO title="Thumbnail A/B" description="AI Thumbnail Comparison" path="/compare" />
      
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Thumbnail A/B Simulator</h2>
        <p className="text-slate-400 mt-2">Predict the winner using AI Vision intelligence.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {[
          { id: 'A', img: imgA, set: setImgA, score: result?.scoreA, win: result?.winner === 'A' },
          { id: 'B', img: imgB, set: setImgB, score: result?.scoreB, win: result?.winner === 'B' }
        ].map((item) => (
          <Card key={item.id} title={`Thumbnail ${item.id}`} className={item.win ? 'border-green-500 ring-1 ring-green-500/50' : ''}>
            <div 
              onClick={() => !processing && document.getElementById(`file${item.id}`)?.click()}
              className={`aspect-video bg-slate-950 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center hover:border-slate-600 overflow-hidden relative transition-colors ${processing ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
            >
              {item.img ? (
                <img src={item.img} className="w-full h-full object-cover" /> 
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">🖼️</span>
                  {processing && <span className="text-xs text-brand-400 animate-pulse">Compressing...</span>}
                </div>
              )}
              
              <input 
                id={`file${item.id}`} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFile(e, item.set)}
                disabled={processing}
              />
              
              {item.score !== undefined && (
                <div className="absolute top-2 right-2 bg-black/80 px-3 py-1 rounded text-xl font-bold text-white">
                  {item.score}/10
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          onClick={handleCompare} 
          disabled={loading || processing || !imgA || !imgB} 
          className="px-10 py-4 text-lg rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Spinner /> : processing ? 'Processing Images...' : 'Predict Winner'}
        </Button>
      </div>

      {result && (
        <div className="animate-slide-up space-y-6">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950">
             <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
             <p className="text-slate-300 leading-relaxed">{result.reasoning}</p>
          </Card>
          
          {result.breakdown && result.breakdown.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {result.breakdown.map((b, i) => (
                <div key={i} className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="font-medium text-slate-300">{b.criterion}</span>
                  <Badge color={b.winner === 'A' ? 'green' : 'blue'}>{b.winner}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
