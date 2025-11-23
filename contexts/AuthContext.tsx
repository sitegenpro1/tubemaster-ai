
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'agency';
}

interface AuthContextType {
  user: User | null;
  isPro: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  upgradeToPro: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for persistent login simulation
    const storedUser = localStorage.getItem('tubemaster_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isPro = user?.plan === 'pro' || user?.plan === 'agency';

  const login = async (email: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      plan: 'free' // Default to free
    };
    
    setUser(newUser);
    localStorage.setItem('tubemaster_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tubemaster_user');
    // Force reload to clear any state
    window.location.reload();
  };

  const upgradeToPro = () => {
    if (!user) return;
    const updatedUser = { ...user, plan: 'pro' as const };
    setUser(updatedUser);
    localStorage.setItem('tubemaster_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isPro, login, logout, upgradeToPro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
