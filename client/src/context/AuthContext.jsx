import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user credentials exist in local storage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Listen to global logout event from Axios interceptors
    const handleGlobalLogout = () => {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    };

    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout);
    };
  }, []);

  // Login handler
  const login = async (emailOrUsername, password) => {
    try {
      setLoading(true);
      const res = await api.post('/users/login', { emailOrUsername, password });
      
      const { token, ...userData } = res.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Registration handler (supports multipart FormData for avatar and banner)
  const register = async (formData) => {
    try {
      setLoading(true);
      const res = await api.post('/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { token, ...userData } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update profile handler (name, email, bio)
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/users/profile', profileData);
      const updatedUser = res.data.data;

      // Retain avatar/banner from local storage state if not returned
      const newUserData = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);

      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Profile update failed' };
    }
  };

  // Update avatar
  const updateAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.patch('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = { ...user, avatar: res.data.data.avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, url: res.data.data.avatar };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Avatar update failed' };
    }
  };

  // Update banner
  const updateBanner = async (file) => {
    try {
      const formData = new FormData();
      formData.append('banner', file);

      const res = await api.patch('/users/banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = { ...user, banner: res.data.data.banner };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, url: res.data.data.banner };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Banner update failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
        updateBanner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
