import React from 'react';
import { SectionTitle } from '../components/UI';
import { SEO } from '../components/SEO';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <SEO 
        title="Privacy Policy" 
        description="Legal information regarding data usage, cookies, and AI processing at TubeMaster AI." 
        path="/privacy" 
      />

      <div className="pt-12 mb-12 border-b border-slate-800 pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-invert prose-lg max-w-none">
        <p className="lead text-xl text-slate-300">
          At TubeMaster AI, we believe your creative data is your intellectual property. This policy outlines how we handle your data, our use of AI models, and your rights.
        </p>

        <h3 className="text-brand-400">1. Data Collection & AI Processing</h3>
        <p>
          TubeMaster AI acts as a client-side interface for various Artificial Intelligence models (specifically Google Gemini and Imagen). When you use our tools:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-400">
          <li><strong>Input Data:</strong> Text prompts, uploaded images (for comparison), and channel URLs are sent to our AI providers for processing.</li>
          <li><strong>No Retention:</strong> We do not store your uploaded images or generated scripts on our servers. All processing happens in transient sessions.</li>
          <li><strong>API Keys:</strong> If you provide your own API keys, they are stored strictly in your browser's local storage or environment variables and are never transmitted to our backend.</li>
        </ul>

        <h3 className="text-brand-400">2. Cookie Policy</h3>
        <p>
          We use minimal local storage to enhance your experience:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-400">
          <li><strong>Preferences:</strong> Saving your dark mode or layout settings.</li>
          <li><strong>Session History:</strong> Temporarily caching your generated keywords or scripts so you don't lose them if you refresh (stored locally on your device).</li>
        </ul>

        <h3 className="text-brand-400">3. Third-Party Services</h3>
        <p>
          Our suite integrates with the following services. We recommend reviewing their privacy policies:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-400">
          <li><strong>Google Gemini API:</strong> Used for text generation and vision analysis.</li>
          <li><strong>Pollinations.ai / Imagen:</strong> Used for thumbnail generation.</li>
          <li><strong>AllOrigins:</strong> Used as a CORS proxy for the Competitor Analysis tool.</li>
        </ul>

        <h3 className="text-brand-400">4. User Rights</h3>
        <p>
          Since we do not create user accounts or store personal databases, you generally do not need to request "deletion" of your account, as none exists. You can clear your browser cache to remove all local traces of TubeMaster AI.
        </p>

        <div className="bg-slate-900 border-l-4 border-brand-500 p-6 my-8 rounded-r-xl">
          <h4 className="text-white font-bold mb-2">Contact Us</h4>
          <p className="text-sm text-slate-400 mb-0">
            If you have specific questions about data security, please contact us at <a href="/contact" className="text-brand-400 hover:underline">privacy@tubemaster.ai</a>.
          </p>
        </div>
      </div>
    </div>
  );
};