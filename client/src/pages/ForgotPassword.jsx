import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, Lock, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ForgotPassword = () => {
  useDocumentTitle('Reset Password');
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Request Code, 2: Reset Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg('');

    const res = await forgotPassword(email);
    if (res.success) {
      showToast(res.message || 'Verification code sent to your registered Gmail address!', 'success');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setStep(2);
      setLoading(false);
    } else {
      setErrorMsg(res.message);
      showToast(res.message || 'Request failed.', 'error');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email.trim() || !code.trim() || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await resetPassword(email, code, newPassword);
    if (res.success) {
      showToast('Password reset successfully! Please sign in with your new password.', 'success');
      navigate('/login');
    } else {
      setErrorMsg(res.message);
      showToast(res.message || 'Reset failed.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-4 bg-brand-bg relative select-none">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 md:p-10 rounded-3xl premium-glass hover:border-brand-primary/30 transition-colors duration-500 shadow-2xl relative z-10">
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-pink text-white flex items-center justify-center shadow-lg shadow-brand-primary-glow animate-float">
            <KeyRound size={24} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-brand-text tracking-wider uppercase">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <p className="text-xs text-brand-muted font-semibold mt-1 max-w-[280px] mx-auto leading-relaxed">
            {step === 1
              ? 'Enter your registered email address to receive a password reset verification code.'
              : 'Enter the 6-digit verification code sent to your registered Gmail address.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs font-bold text-center mb-6">
            {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="flex flex-col gap-5" autoComplete="off">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-5 py-3 text-xs rounded-2xl bg-brand-card/50 border border-brand-border text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary font-bold"
                  placeholder="e.g. yourname@gmail.com"
                  autoComplete="email"
                />
                <Mail size={14} className="absolute left-3.5 top-3.5 text-brand-muted" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-gradient-to-tr from-brand-primary to-brand-pink hover:opacity-95 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg shadow-brand-primary-glow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Sending...' : 'Request Code'}</span>
              <ArrowRight size={14} />
            </button>

            <Link to="/login" className="flex items-center justify-center gap-1.5 text-xs text-brand-muted hover:text-white font-bold transition-colors">
              <ArrowLeft size={12} />
              <span>Back to Sign In</span>
            </Link>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-5" autoComplete="off">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="code" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">6-Digit Reset Code</label>
              <input
                id="code"
                type="text"
                required
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-5 py-3 text-center text-lg tracking-[0.5em] font-black rounded-2xl bg-brand-card/50 border border-brand-border text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">New Password</label>
              <div className="relative">
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-5 py-3 text-xs rounded-2xl bg-brand-card/50 border border-brand-border text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary font-bold"
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                />
                <Lock size={14} className="absolute left-3.5 top-3.5 text-brand-muted" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">Confirm New Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-5 py-3 text-xs rounded-2xl bg-brand-card/50 border border-brand-border text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary font-bold"
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                <Lock size={14} className="absolute left-3.5 top-3.5 text-brand-muted" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-gradient-to-tr from-brand-primary to-brand-pink hover:opacity-95 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg shadow-brand-primary-glow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-1.5 text-xs text-brand-muted hover:text-white font-bold transition-colors cursor-pointer bg-transparent border-none"
            >
              <ArrowLeft size={12} />
              <span>Back to Request Code</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
