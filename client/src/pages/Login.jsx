import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Login = () => {
  useDocumentTitle('Sign In');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password) return;

    setLoading(true);
    setErrorMsg('');

    const res = await login(emailOrUsername, password);
    if (res.success) {
      showToast('Logged in successfully!', 'success');
      navigate('/');
    } else {
      setErrorMsg(res.message);
      showToast(res.message || 'Login failed.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 bg-brand-bg relative select-none">
      {/* Animated glowing backdrop circles */}
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />

      {/* Glass card container */}
      <div className="w-full max-w-md p-8 md:p-10 rounded-3xl premium-glass hover:border-brand-primary/30 transition-colors duration-500 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-pink text-white flex items-center justify-center shadow-lg shadow-brand-primary-glow">
            <Play size={24} fill="white" className="ml-0.5" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-wider uppercase">
            Sign In to View<span className="bg-gradient-to-r from-brand-primary to-brand-pink bg-clip-text text-transparent">Flow</span>
          </h2>
          <p className="text-xs text-brand-muted font-semibold mt-1">
            Access your creator dashboard & cinematic streams
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs font-bold text-center mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email or Username */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="emailOrUsername" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">Username or Email</label>
            <div className="relative">
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                required
                placeholder="Enter username or email..."
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-semibold"
              />
              <Mail size={15} className="absolute left-4 top-3.5 text-brand-muted" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-semibold"
              />
              <Lock size={15} className="absolute left-4 top-3.5 text-brand-muted" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-brand-muted hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !emailOrUsername.trim() || !password}
            className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-pink text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-brand-primary-glow hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-3 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Redirect */}
        <div className="text-center text-xs mt-6">
          <span className="text-brand-muted font-semibold">Don't have a channel? </span>
          <Link to="/register" className="text-brand-pink font-extrabold hover:underline">
            Register Channel
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
