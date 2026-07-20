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

    // Listen to storage changes to sync logout/login across multiple tabs (B71)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          setUser(null);
        } else {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            setUser(JSON.parse(userStr));
          }
        }
      }
    };

    window.addEventListener('auth-logout', handleGlobalLogout);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout);
      window.removeEventListener('storage', handleStorageChange);
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

      if (res.data.needsVerification) {
        return { success: true, needsVerification: true, email: res.data.email };
      }

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

  // Verify OTP handler
  const verifyOtp = async (email, code) => {
    try {
      setLoading(true);
      const res = await api.post('/users/verify-email', { email, code });
      const { token, ...userData } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Verification failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Google Login handler
  const googleLogin = async (googleUser) => {
    try {
      setLoading(true);
      const res = await api.post('/users/google-login', googleUser);
      const { token, ...userData } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Google Sign-in failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const res = await api.post('/users/forgot-password', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Request failed.' };
    } finally {
      setLoading(false);
    }
  };

  // Reset password handler
  const resetPassword = async (email, code, newPassword) => {
    try {
      setLoading(true);
      const res = await api.post('/users/reset-password', { email, code, newPassword });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Password reset failed.' };
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

      const rawUrl = res.data.data.avatar;
      const avatarUrl = rawUrl ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : rawUrl;

      const updatedUser = { ...user, avatar: avatarUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, url: avatarUrl };
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

      const rawUrl = res.data.data.banner;
      const bannerUrl = rawUrl ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : rawUrl;

      const updatedUser = { ...user, banner: bannerUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, url: bannerUrl };
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
        verifyOtp,
        googleLogin,
        forgotPassword,
        resetPassword,
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
