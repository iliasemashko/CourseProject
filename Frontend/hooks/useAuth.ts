import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { getCurrentUser, logoutUser as apiLogout } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const current = getCurrentUser();
    if (current) setUser(current);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    apiLogout();
  }, []);

  const setUserAndSave = useCallback((newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, []);

  return { user, setUser: setUserAndSave, logout };
};
