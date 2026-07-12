import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Eye, EyeOff, Mail, Lock, User, FileText, Image, Smile } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Register = () => {
  useDocumentTitle('Create Channel');
  const navigate = useNavigate();
  const { register, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 bg-brand-bg relative select-none">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl flex flex-col items-center text-center gap-6">
          <Play className="text-brand-primary h-12 w-12 animate-pulse" />
          <h2 className="text-2xl font-black text-white">Already Signed In</h2>
          <p className="text-brand-muted text-sm font-semibold">
            You are already authenticated. You can head back to the homepage, go to your creator dashboard, or log out of this account.
          </p>
          <div className="flex flex-col w-full gap-3 mt-2">
            <Link to="/" className="w-full py-3 bg-brand-primary text-white font-black text-sm rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 flex items-center justify-center">
              Go to Home
            </Link>
            <Link to="/dashboard" className="w-full py-3 bg-white/10 text-white font-black text-sm rounded-2xl hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300 flex items-center justify-center">
              Creator Dashboard
            </Link>
            <button type="button" onClick={logout} className="w-full py-3 bg-brand-pink/20 hover:bg-brand-pink/30 text-brand-pink font-black text-sm rounded-2xl transition-colors duration-300 cursor-pointer">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !username || !password) {
      setErrorMsg('Please fill in all required fields.');
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('username', username.toLowerCase());
    formData.append('password', password);
    formData.append('bio', bio);
    if (avatar) {
      formData.append('avatar', avatar);
    }
    if (banner) {
      formData.append('banner', banner);
    }

    const res = await register(formData);
    if (res.success) {
      showToast('Registration successful! Channel launched.', 'success');
      navigate('/');
    } else {
      setErrorMsg(res.message);
      showToast(res.message || 'Registration failed.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 bg-brand-bg relative select-none">
      {/* Dynamic blurred background sparks */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />

      {/* Glassmorphism Container */}
      <div className="w-full max-w-lg p-8 md:p-10 rounded-3xl premium-glass hover:border-brand-primary/30 transition-colors duration-500 shadow-2xl relative z-10 my-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-pink text-white flex items-center justify-center shadow-lg shadow-brand-primary-glow animate-float">
            <Play size={24} fill="white" className="ml-0.5" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-brand-text tracking-wider uppercase">
            Create Channel
          </h2>
          <p className="text-xs text-brand-muted font-semibold mt-1">
            Launch your creator hub and share movies on ViewFlow
          </p>
        </div>

        {/* Error Box */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs font-bold text-center mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Row 1: Full name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">Full Name</label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-xs rounded-xl bg-black/5 dark:bg-white/5 border border-brand-border text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-semibold"
                />
                <User size={15} className="absolute left-4 top-3.5 text-brand-muted" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. user@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-xs rounded-xl bg-black/5 dark:bg-white/5 border border-brand-border text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-semibold"
                />
                <Mail size={15} className="absolute left-4 top-3.5 text-brand-muted" />
              </div>
            </div>
          </div>

          {/* Row 2: Username & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">Username</label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="e.g. mychannel"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-xs rounded-xl bg-black/5 dark:bg-white/5 border border-brand-border text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-semibold"
                />
                <Smile size={15} className="absolute left-4 top-3.5 text-brand-muted" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="registerPassword" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">Password</label>
              <div className="relative">
                <input
                  id="registerPassword"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 chars..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 text-xs rounded-xl bg-black/5 dark:bg-white/5 border border-brand-border text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-semibold"
                />
                <Lock size={15} className="absolute left-4 top-3.5 text-brand-muted" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Bio Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">Channel Bio</label>
            <div className="relative">
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell your viewers who you are..."
                rows="2"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl bg-black/5 dark:bg-white/5 border border-brand-border text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-semibold resize-none"
              />
            </div>
          </div>

          {/* File Picker Row: Avatar & Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="avatarInput" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1 cursor-pointer">Avatar / Logo</label>
              <label htmlFor="avatarInput" className="flex items-center justify-center p-3.5 rounded-xl border border-dashed border-brand-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-brand-primary/30 transition-all text-xs font-bold text-brand-muted cursor-pointer truncate">
                <input
                  id="avatarInput"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files[0])}
                  className="hidden"
                />
                {avatar ? (
                  <span className="text-brand-pink truncate">{avatar.name}</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Image size={14} /> Upload Avatar</span>
                )}
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="bannerInput" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1 cursor-pointer">Channel Banner</label>
              <label htmlFor="bannerInput" className="flex items-center justify-center p-3.5 rounded-xl border border-dashed border-brand-border bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-brand-primary/30 transition-all text-xs font-bold text-brand-muted cursor-pointer truncate">
                <input
                  id="bannerInput"
                  name="banner"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBanner(e.target.files[0])}
                  className="hidden"
                />
                {banner ? (
                  <span className="text-brand-pink truncate">{banner.name}</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Image size={14} /> Upload Banner</span>
                )}
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !fullName || !email || !username || !password}
            className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-pink text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-brand-primary-glow hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-3 cursor-pointer"
          >
            {loading ? 'Creating Channel...' : 'Register & Launch'}
          </button>
        </form>

        {/* Footer redirection */}
        <div className="text-center text-xs mt-6">
          <span className="text-brand-muted font-semibold">Already have a channel? </span>
          <Link to="/login" className="text-brand-pink font-extrabold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
