import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../Frontend/types';
import { StorageService } from '../Frontend/services/storageService';

interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const current = StorageService.getCurrentUser();
    if (current) setUserState(current);
  }, []);

  const setUser = useCallback((newUser: User) => {
    setUserState(newUser);
    StorageService.saveUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    StorageService.clearUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
