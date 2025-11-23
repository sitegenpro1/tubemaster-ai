
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, Spinner, SectionTitle } from '../components/UI';
import { generateFlowchartSteps } from '../services/geminiService';
import { FlowchartStep } from '../types';
import { SEO } from '../components/SEO';

const PASTEL_COLORS = [
  '#E0F7FA', // Cyan
  '#F3E5F5', // Purple
  '#FFF3E0', // Orange
  '#E8F5E9', // Green
  '#E3F2FD', // Blue
  '#FCE4EC', // Pink
  '#FFFDE7'  // Yellow
];

export const ExplainerBoard: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<FlowchartStep[]>([]);
  const [format, setFormat] = useState<'landscape' | 'portrait'>('landscape');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateSteps = async () => {
    if (!topic) return;
    setLoading(true);
    setSteps([]);
    try {
      const data = await generateFlowchartSteps(topic);
      setSteps(data);
    } catch (e) {
      alert("Failed to generate flowchart logic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas || steps.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    const width = format === 'landscape' ? 1920 : 1080;
    const height = format === 'landscape' ? 1080 : 1920;
    canvas.width = width;
    canvas.height = height;

    // 1. Background (Creamy)
    ctx.fillStyle = '#FDFBF7';
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Grid
    ctx.strokeStyle = '#E2E0DD';
    ctx.lineWidth = 1;
    const gridSize = 60;
    
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 3. Layout Logic
    const nodeWidth = format === 'landscape' ? 320 : 500;
    const nodeHeight = format === 'landscape' ? 180 : 250;
    const padding = 40;
    
    // Calculate positions
    const positions: {x: number, y: number}[] = [];
    
    if (format === 'landscape') {
      // Snake Layout
      const cols = 3; 
      const startX = (width - ((cols * nodeWidth) + ((cols-1) * 100))) / 2;
      const startY = 150;
      const xGap = 100;
      const yGap = 150;

      steps.forEach((_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        // Zig Zag logic
        const actualCol = row % 2 === 0 ? col : (cols - 1 - col);
        
        positions.push({
          x: startX + (actualCol * (nodeWidth + xGap)),
          y: startY + (row * (nodeHeight + yGap))
        });
      });
    } else {
      // Portrait Vertical Layout
      const centerX = width / 2 - nodeWidth / 2;
      const startY = 150;
      const gap = 80;
      
      steps.forEach((_, i) => {
        positions.push({
          x: centerX,
          y: startY + (i * (nodeHeight + gap))
        });
      });
    }

    // 4. Draw Connectors First (so they are behind nodes)
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]); // Dashed lines for explainer vibe

    for (let i = 0; i < positions.length - 1; i++) {
        const start = positions[i];
        const end = positions[i+1];
        
        const startX = start.x + nodeWidth / 2;
        const startY = start.y + nodeHeight / 2;
        const endX = end.x + nodeWidth / 2;
        const endY = end.y + nodeHeight / 2;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        // Curve Logic
        if (format === 'landscape' && Math.abs(startY - endY) > 50) {
           // Jumping rows
           ctx.bezierCurveTo(startX, endY, endX, startY, endX, endY);
        } else {
           ctx.lineTo(endX, endY);
        }
        ctx.stroke();
    }
    ctx.setLineDash([]); // Reset dash

    // 5. Draw Nodes
    steps.forEach((step, i) => {
      const pos = positions[i];
      const color = PASTEL_COLORS[i % PASTEL_COLORS.length];
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      drawRoundRect(ctx, pos.x + 10, pos.y + 10, nodeWidth, nodeHeight, 20);
      ctx.fill();

      // Box Body
      ctx.fillStyle = color;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, pos.x, pos.y, nodeWidth, nodeHeight, 20);
      ctx.fill();
      ctx.stroke();

      // Text Formatting
      ctx.fillStyle = '#1E293B';
      ctx.textAlign = 'center';
      
      // Icon
      ctx.font = '40px "Segoe UI Emoji"';
      ctx.fillText(step.iconHint, pos.x + nodeWidth/2, pos.y + 50);

      // Title
      ctx.font = 'bold 24px Inter, sans-serif';
      wrapText(ctx, step.title, pos.x + nodeWidth/2, pos.y + 90, nodeWidth - 40, 30);

      // Desc
      ctx.font = '18px Inter, sans-serif';
      ctx.fillStyle = '#475569';
      wrapText(ctx, step.description, pos.x + nodeWidth/2, pos.y + 130, nodeWidth - 30, 24);

      // Number Badge
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Inter';
      ctx.fillText((i + 1).toString(), pos.x, pos.y + 5);
    });

    // 6. Watermark
    ctx.font = 'bold 20px Inter';
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.textAlign = 'right';
    ctx.fillText("Generated by TubeMaster AI", width - 40, height - 40);
  };

  // Helper: Round Rect
  const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Helper: Text Wrap
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  useEffect(() => {
    if (steps.length > 0) {
      // Small delay to ensure fonts load? Usually standard fonts are fine.
      setTimeout(drawBoard, 100);
    }
  }, [steps, format]);

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `explainer-board-${format}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-12 pb-20">
      <SEO 
        title="AI Explainer Board Generator" 
        description="Create clean, flowchart-style explainer graphics for your YouTube videos without design skills." 
        path="/explainer-board" 
      />

      <div className="text-center pt-8 md:pt-12">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-teal-500">Explainer Board</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Turn any complex topic into a beautiful, educational flowchart graphic.
          Perfect for "How-To" videos and documentaries.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <Card title="Board Configuration">
          <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1">
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Topic</label>
               <Input 
                 placeholder="e.g. How the Stock Market Works" 
                 value={topic}
                 onChange={(e) => setTopic(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && generateSteps()}
               />
             </div>
             <div className="md:w-48">
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Format</label>
               <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
                  <button 
                    onClick={() => setFormat('landscape')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-colors ${format === 'landscape' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    16:9
                  </button>
                  <button 
                    onClick={() => setFormat('portrait')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-colors ${format === 'portrait' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    9:16
                  </button>
               </div>
             </div>
          </div>
          <Button onClick={generateSteps} disabled={loading || !topic} className="w-full mt-4 py-4 text-lg font-bold">
            {loading ? <Spinner /> : '✨ Design Board'}
          </Button>
        </Card>

        {steps.length > 0 && (
          <div className="space-y-4 animate-slide-up">
            <div className="flex justify-between items-center text-white">
               <h3 className="font-bold text-xl">Preview</h3>
               <button 
                 onClick={downloadCanvas}
                 className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-teal-500/20"
               >
                 <span>⬇️</span> Download PNG
               </button>
            </div>
            
            <div className="w-full bg-slate-900/50 rounded-2xl border border-slate-800 p-4 overflow-hidden flex justify-center backdrop-blur-sm">
               <canvas 
                 ref={canvasRef} 
                 className="max-w-full h-auto shadow-2xl rounded-lg border border-slate-700"
                 style={{ maxHeight: '80vh' }}
               />
            </div>
            
            <p className="text-center text-slate-500 text-sm">
              Note: This graphic is generated locally in your browser. No image APIs used.
            </p>
          </div>
        )}
      </div>

      <section className="max-w-4xl mx-auto px-4 pt-12 border-t border-slate-800/50 mt-12">
        <SectionTitle title="Why Use Explainer Boards?" center />
        <div className="grid md:grid-cols-3 gap-6 mt-8">
           <Card className="bg-slate-900/30" title="Visual Retention">
             <p className="text-slate-400 text-sm">
               Viewers retain 95% of a message when they watch it in a video compared to 10% when reading it in text. Visual flowcharts map complex ideas instantly.
             </p>
           </Card>
           <Card className="bg-slate-900/30" title="Zero Hallucinations">
             <p className="text-slate-400 text-sm">
               Unlike image generators which struggle with text, this tool renders crisp, readable fonts directly onto the canvas. No garbled letters.
             </p>
           </Card>
           <Card className="bg-slate-900/30" title="Multi-Format">
             <p className="text-slate-400 text-sm">
               Generate a wide version for your main video and instantly switch to vertical for your Shorts/TikTok/Reels promotion.
             </p>
           </Card>
        </div>
      </section>
    </div>
  );
};
