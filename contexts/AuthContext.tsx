

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import api from '../services/mockApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (role: Role) => Promise<void>;
  logout: () => void;
}

// FIX: Export AuthContext to allow it to be imported by other files like hooks/useAuth.ts
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (role: Role) => {
    setLoading(true);
    const loggedInUser = await api.login(role);
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
