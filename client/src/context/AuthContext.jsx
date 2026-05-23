import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('pinvault_token'));

  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('pinvault_token');
    if (!savedToken) { setLoading(false); return; }
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('pinvault_token');
      localStorage.removeItem('pinvault_user');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('pinvault_token', newToken);
    localStorage.setItem('pinvault_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('pinvault_token', newToken);
    localStorage.setItem('pinvault_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('pinvault_token');
    localStorage.removeItem('pinvault_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('pinvault_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, isAuthenticated: !!user,
      login, register, logout, updateUser, loadUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
