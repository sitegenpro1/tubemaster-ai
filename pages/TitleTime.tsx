import React, { useState } from 'react';
import { Card, Input, Button, Spinner } from '../components/UI';
import { generateTitles, suggestBestTime } from '../services/geminiService';
import { SEO } from '../components/SEO';

type Tab = 'titles' | 'time';

export const TitleTime: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('titles');
  const [titleTopic, setTitleTopic] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  
  const [timeTitle, setTimeTitle] = useState('');
  const [audience, setAudience] = useState('General Audience');
  const [timeSuggestion, setTimeSuggestion] = useState('');
  const [loadingTime, setLoadingTime] = useState(false);

  const handleGenerateTitles = async () => {
    if (!titleTopic) return;
    setLoadingTitles(true);
    try {
      const data = await generateTitles(titleTopic);
      setTitles(data);
    } catch (e: any) {
      alert("Failed to generate titles.");
    } finally {
      setLoadingTitles(false);
    }
  };

  const handleSuggestTime = async () => {
    if (!timeTitle) return;
    setLoadingTime(true);
    try {
      const data = await suggestBestTime(timeTitle, audience, "");
      setTimeSuggestion(data);
    } catch (e: any) {
      alert("Failed to analyze best time.");
    } finally {
      setLoadingTime(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <SEO title="Title & Best Publish Time" description="Get click-worthy titles and publishing times." path="/title-time" />
      <div className="flex justify-center gap-4">
        <button onClick={() => setActiveTab('titles')} className={`px-6 py-3 rounded-full font-bold ${activeTab === 'titles' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Title Generator</button>
        <button onClick={() => setActiveTab('time')} className={`px-6 py-3 rounded-full font-bold ${activeTab === 'time' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Best Time</button>
      </div>

      {activeTab === 'titles' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <Card title="Title Generator">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Video Topic</label>
                <Input value={titleTopic} onChange={(e) => setTitleTopic(e.target.value)} />
              </div>
              <Button onClick={handleGenerateTitles} disabled={loadingTitles}>{loadingTitles ? <Spinner /> : 'Generate'}</Button>
            </div>
          </Card>
          <div className="space-y-4">
            {titles.map((t, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-lg cursor-pointer hover:border-brand-500" onClick={() => navigator.clipboard.writeText(t)}>
                <p className="text-slate-200">{t}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <Card title="Best Publishing Time">
           <div className="space-y-4">
             <Input placeholder="Video Title" value={timeTitle} onChange={(e) => setTimeTitle(e.target.value)} />
             <Input placeholder="Audience" value={audience} onChange={(e) => setAudience(e.target.value)} />
             <Button onClick={handleSuggestTime} disabled={loadingTime}>{loadingTime ? <Spinner /> : 'Analyze'}</Button>
             {timeSuggestion && <div className="bg-slate-900 p-6 rounded-xl text-indigo-100">{timeSuggestion}</div>}
           </div>
        </Card>
      )}
    </div>
  );
};