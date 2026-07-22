import { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, X, Info, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const DEFAULT_PREFERENCES = {
  essential: true,
  functional: true,
  analytics: true,
  personalization: true,
};

const CookieSettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const { showToast } = useToast();

  useEffect(() => {
    // Load saved preferences from localStorage
    const saved = localStorage.getItem('viewflow_cookie_preferences');
    if (saved) {
      try {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) });
      } catch (err) {
        console.error('Failed to parse cookie preferences:', err);
      }
    }

    // Event listener to open modal from anywhere (Footer, Navbar, etc.)
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-cookie-settings', handleOpen);
    return () => window.removeEventListener('open-cookie-settings', handleOpen);
  }, []);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    if (key === 'essential') return; // Essential cookies cannot be toggled
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (customPrefs = preferences) => {
    localStorage.setItem('viewflow_cookie_preferences', JSON.stringify(customPrefs));
    setPreferences(customPrefs);
    setIsOpen(false);
    showToast('Cookie preferences updated successfully!', 'success');
  };

  const handleAcceptAll = () => {
    const allEnabled = {
      essential: true,
      functional: true,
      analytics: true,
      personalization: true,
    };
    handleSave(allEnabled);
  };

  const handleRejectOptional = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
      personalization: false,
    };
    handleSave(essentialOnly);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-brand-card/95 border border-brand-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-brand-border flex items-center justify-between bg-gradient-to-r from-brand-card via-brand-bg to-brand-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-primary/15 text-brand-primary border border-brand-primary/20">
              <Cookie size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                Cookie Settings & Privacy Controls
              </h3>
              <p className="text-xs text-brand-muted font-medium mt-0.5">
                Manage your privacy options and data collection preferences for ViewFlow.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-brand-border/50 text-brand-muted hover:text-brand-text transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content / Cookie Categories */}
        <div className="p-6 overflow-y-auto space-y-4 flex-grow custom-scrollbar">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-400 font-medium leading-relaxed">
            <Info size={18} className="shrink-0 mt-0.5" />
            <span>
              We use cookies and similar technologies to enhance your video playback, remember settings, analyze streaming latency, and offer customized recommendations.
            </span>
          </div>

          {/* Essential Cookies */}
          <div className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-grow space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-brand-text">Strictly Essential Cookies</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Lock size={10} /> Always Active
                </span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed font-medium">
                Necessary for fundamental site features such as user authentication, JWT session persistence, security verification, and video state recovery.
              </p>
            </div>
            <div className="relative inline-flex items-center cursor-not-allowed opacity-80 shrink-0">
              <input type="checkbox" checked disabled className="sr-only" />
              <div className="w-11 h-6 bg-emerald-500/40 rounded-full flex items-center justify-end px-1">
                <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-md flex items-center justify-center">
                  <Check size={10} className="text-black font-bold" />
                </div>
              </div>
            </div>
          </div>

          {/* Functional & Preference Cookies */}
          <div className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-grow space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-brand-text">Functional & Interface Preferences</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-primary/15 text-brand-primary border border-brand-primary/20">
                  Optional
                </span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed font-medium">
                Remembers your custom player volume, dark/light theme, theater mode settings, and sidebar collapse states across browser sessions.
              </p>
            </div>
            <button
              onClick={() => handleToggle('functional')}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                preferences.functional ? 'bg-brand-primary justify-end' : 'bg-brand-border justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Performance & Streaming Analytics */}
          <div className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-grow space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-brand-text">Performance & Streaming Telemetry</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-pink/15 text-brand-pink border border-brand-pink/20">
                  Optional
                </span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed font-medium">
                Collects anonymous metrics on video buffer health, resolution changes, and network speed to help us optimize server performance.
              </p>
            </div>
            <button
              onClick={() => handleToggle('analytics')}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                preferences.analytics ? 'bg-brand-primary justify-end' : 'bg-brand-border justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* AI Recommendation & Personalization */}
          <div className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-grow space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-brand-text">AI Personalization & Feeds</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/20">
                  Optional
                </span>
              </div>
              <p className="text-xs text-brand-muted leading-relaxed font-medium">
                Allows Google Gemini AI to analyze your watch history and liked videos to generate tailored home recommendations and assistant suggestions.
              </p>
            </div>
            <button
              onClick={() => handleToggle('personalization')}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                preferences.personalization ? 'bg-brand-primary justify-end' : 'bg-brand-border justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-brand-border bg-brand-bg/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleRejectOptional}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-brand-border hover:border-brand-text/30 text-xs font-bold text-brand-muted hover:text-brand-text transition-colors"
          >
            Reject Optional
          </button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-brand-primary/30 bg-brand-primary/10 hover:bg-brand-primary/20 text-xs font-bold text-brand-primary transition-all"
            >
              Accept All
            </button>
            <button
              onClick={() => handleSave()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-pink text-white text-xs font-bold shadow-lg shadow-brand-primary/25 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieSettingsModal;
