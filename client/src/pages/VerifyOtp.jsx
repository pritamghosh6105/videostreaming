import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const VerifyOtp = () => {
  useDocumentTitle('Verify Channel');
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();
  const { showToast } = useToast();

  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !code.trim()) return;

    setLoading(true);
    setErrorMsg('');

    const res = await verifyOtp(email, code);
    if (res.success) {
      showToast('Email verified successfully! Channel activated.', 'success');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.message);
      showToast(res.message || 'Verification failed.', 'error');
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
            Verify Your Channel
          </h2>
          <p className="text-xs text-brand-muted font-semibold mt-1 max-w-[280px] mx-auto leading-relaxed">
            Enter the 6-digit verification code logged in your server terminal console.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-brand-danger/10 border border-brand-danger/25 text-brand-danger text-xs font-bold text-center mb-6">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">Gmail Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 text-xs rounded-2xl bg-brand-card/50 border border-brand-border text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary font-bold"
              placeholder="e.g. yourname@gmail.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="code" className="text-[10px] font-black text-brand-primary uppercase tracking-widest pl-1">6-Digit Verification Code</label>
            <input
              id="code"
              type="text"
              required
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-5 py-3 text-center text-lg tracking-[0.5em] font-black rounded-2xl bg-brand-card/50 border border-brand-border text-brand-text focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4.5 bg-gradient-to-tr from-brand-primary to-brand-pink hover:opacity-95 text-white font-black text-xs tracking-widest uppercase rounded-2xl shadow-lg shadow-brand-primary-glow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:scale-100"
          >
            <span>{loading ? 'Activating...' : 'Verify Channel'}</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
