
import React from 'react';
import { Card, Button, Badge } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { SEO } from '../components/SEO';

interface PricingProps {
  onNavigate: (view: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
      <SEO 
        title="Pricing Plans" 
        description="Join the TubeMaster AI Beta. Full access to all tools for free." 
        path="/pricing" 
      />

      <div className="text-center pt-12 mb-12">
        <Badge color="green">Launch Special</Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mt-6 mb-4">
          Start Growing <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-500">For Free</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          We are currently in public beta. Enjoy full access to our commercial-grade suite while we build the future of YouTube analytics.
        </p>
      </div>

      <div className="max-w-md mx-auto px-4">
        {/* Founder's Free Tier */}
        <div className="bg-gradient-to-b from-brand-900/20 to-slate-900 border border-brand-500 rounded-3xl p-8 flex flex-col relative shadow-2xl shadow-brand-900/20 z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-lg shadow-brand-500/40">
            Founder's Access
          </div>
          
          <div className="mb-6 text-center border-b border-white/10 pb-6 mt-2">
             <h3 className="text-2xl font-bold text-white">Standard Access</h3>
             <div className="flex items-center justify-center gap-2 mt-2">
               <span className="text-5xl font-extrabold text-white">$0</span>
               <div className="text-left text-xs text-slate-400 leading-tight">
                 <div>Forever</div>
                 <div>during Beta</div>
               </div>
             </div>
             <p className="text-brand-200/80 text-sm mt-4 font-medium">Ad-Supported Experience</p>
          </div>

          <Button variant="primary" onClick={() => !user ? onNavigate('login') : onNavigate('home')} className="mb-8 w-full py-4 text-lg shadow-brand-500/25">
             {user ? 'Go to Dashboard' : 'Start Creating Now'}
          </Button>

          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Included Features</p>
            <ul className="space-y-3 text-sm text-slate-300 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-brand-400 mt-0.5">✓</span> 
                <span><strong>Unlimited</strong> Keyword Research</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-400 mt-0.5">✓</span> 
                <span><strong>Competitor Spy</strong> (Full Access)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-400 mt-0.5">✓</span> 
                <span><strong>4K Thumbnail Generator</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-400 mt-0.5">✓</span> 
                <span>Viral Script Writer</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-400 mt-0.5">✓</span> 
                <span>Thumbnail A/B Testing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center max-w-2xl mx-auto">
        <h4 className="text-white font-bold mb-2">Why is it free?</h4>
        <p className="text-slate-500 text-sm leading-relaxed">
          We are refining our AI models. In exchange for free access, we simply display unobtrusive banner ads to cover our server costs. A Premium Ad-Free plan will be introduced later for power users.
        </p>
      </div>
    </div>
  );
};
