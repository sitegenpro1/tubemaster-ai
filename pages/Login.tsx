import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import { SEO } from '../components/SEO';

interface LoginProps {
  onNavigate: (view: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, logout } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await login(email);
    setLoading(false);
    onNavigate('home');
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  if (user) {
     return (
       <div className="flex items-center justify-center min-h-[60vh]">
         <Card className="w-full max-w-md text-center p-8">
           <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
             👤
           </div>
           <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user.name}</h2>
           <p className="text-slate-400 mb-8">You are currently logged in as {user.email}</p>
           <Button onClick={handleLogout} variant="secondary" className="w-full">
             Log Out
           </Button>
         </Card>
       </div>
     );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <SEO title="Login" description="Login to TubeMaster AI" path="/login" />
      
      <Card className="w-full max-w-md p-8 border-slate-700 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Enter your email to access your workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <Button disabled={loading} className="w-full py-4 text-lg font-bold">
            {loading ? 'Logging in...' : 'Continue with Email'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </Card>
    </div>
  );
};