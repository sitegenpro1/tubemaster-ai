import React, { useState } from 'react';
import { Button, Input, SectionTitle, Card } from '../components/UI';
import { SEO } from '../components/SEO';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <SEO 
        title="Contact Support" 
        description="Get in touch with the TubeMaster AI team. Support, Enterprise inquiries, and Feature requests." 
        path="/contact" 
      />

      <div className="pt-12 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Get in Touch</h1>
        <p className="text-slate-400 text-lg">We'd love to hear from you. Seriously.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <Card className="h-full border-brand-500/10">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl">✅</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Received!</h3>
                <p className="text-slate-400">
                  Thanks for reaching out. Our support team (humans, not AI) will get back to you within 24 hours.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-brand-400 hover:text-brand-300 font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Your Name</label>
                  <Input required placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Email Address</label>
                  <Input required type="email" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Subject</label>
                  <div className="relative">
                    <select className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-brand-500 outline-none appearance-none">
                      <option>General Support</option>
                      <option>Bug Report</option>
                      <option>Feature Request</option>
                      <option>Enterprise / API Access</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">▼</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Message</label>
                  <textarea 
                    required
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:border-brand-500 outline-none min-h-[150px] resize-none placeholder:text-slate-600"
                    placeholder="How can we help you dominate your niche today?"
                  />
                </div>
                <Button disabled={loading} className="w-full py-4 font-bold text-lg">
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Info Side */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Other Ways to Connect</h3>
            <div className="grid gap-4">
              <a href="#" className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-brand-500/30 transition-colors group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Twitter / X</h4>
                  <p className="text-sm text-slate-400">@TubeMasterAI</p>
                </div>
              </a>
              
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-brand-500/30 transition-colors group">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Email Support</h4>
                  <p className="text-sm text-slate-400">help@tubemaster.ai</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-900/20 to-slate-900 p-8 rounded-2xl border border-brand-500/20">
            <h4 className="font-bold text-white mb-2">Need API Access?</h4>
            <p className="text-sm text-slate-400 mb-4">
              Building your own tool? We offer enterprise access to our proprietary Keyword & Vision logic endpoints.
            </p>
            <button className="text-brand-400 text-sm font-bold hover:text-brand-300">Request API Keys →</button>
          </div>
        </div>
      </div>
    </div>
  );
};