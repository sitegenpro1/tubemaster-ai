import React from 'react';
import { Card, SectionTitle, Badge } from '../components/UI';
import { SEO } from '../components/SEO';

export const About: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      <SEO 
        title="About Us - Data-Driven Growth" 
        description="Learn about TubeMaster AI's mission to help creators make better decisions using advanced analytics and computer vision." 
        path="/about" 
      />

      {/* Hero Section */}
      <div className="relative pt-12 md:pt-20 text-center px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full -z-10"></div>
        <Badge color="brand">Our Mission</Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mt-6 mb-6">
          Turn Guesswork <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-500">Into Growth.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          TubeMaster AI provides the analytical tools you need to make informed decisions. We help you understand the metrics that matter, so you can focus on creating your best work.
        </p>
      </div>

      {/* The Story Grid */}
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <SectionTitle title="The Origin Story" />
          <div className="prose prose-invert text-slate-400 leading-relaxed">
            <p>
              In 2023, the YouTube landscape changed. It became harder for new creators to be discovered without understanding their audience deeply.
            </p>
            <p>
              We realized that to succeed, creators needed better insights. They needed to know what topics were trending and what visual styles appealed to viewers.
            </p>
            <p>
              So we built <strong>TubeMaster</strong>. By combining Google's Gemini models for understanding text and advanced Computer Vision for analyzing visuals, we created a suite of tools that assists you in your creative process.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" 
            alt="Data Analysis" 
            className="relative rounded-2xl shadow-2xl border border-slate-700/50 grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </div>

      {/* Tech Stack / Values */}
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle title="Our Core Philosophy" center />
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-slate-900/40" title="Strategy > Guessing">
            <p className="text-slate-400 text-sm">
              We provide data-backed insights to help you improve your thumbnails and content strategy, saving you time and effort.
            </p>
          </Card>
          <Card className="bg-slate-900/40" title="Ethical Tools">
            <p className="text-slate-400 text-sm">
              We build tools that help you improve your skills and understanding. No bots, no fake engagement, just honest analysis.
            </p>
          </Card>
          <Card className="bg-slate-900/40" title="Privacy First">
            <p className="text-slate-400 text-sm">
              Your channel data is your asset. We process insights in real-time and do not sell your analytics to third parties.
            </p>
          </Card>
        </div>
      </div>

      {/* Team CTA */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-3xl rounded-full"></div>
        <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Join the Community</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto relative z-10">
          We are a team of developers and creators working to make professional insights accessible to everyone.
        </p>
        <div className="flex justify-center gap-4 relative z-10">
          <button className="text-slate-300 hover:text-brand-400 font-medium transition-colors">View Careers →</button>
        </div>
      </div>
    </div>
  );
};