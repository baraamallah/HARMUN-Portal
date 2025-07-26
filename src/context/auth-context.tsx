
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import LoadingScreen from '@/components/LoadingScreen';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const minDisplayTime = new Promise(resolve => setTimeout(resolve, 3000));
    
    const authReady = new Promise<User | null>(resolve => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            resolve(user);
            unsubscribe(); // Unsubscribe after the first auth state change
        });
    });

    Promise.all([minDisplayTime, authReady]).then(() => {
        setLoading(false);
    });

  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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

export const AuthLoader = ({ children }: { children: React.ReactNode }) => {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
