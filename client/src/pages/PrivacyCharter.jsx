import { useEffect } from 'react';
import { ShieldCheck, Lock, Database, Eye, Server, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyCharter = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'principles',
      icon: ShieldCheck,
      title: '1. Our Core Privacy Commitment',
      content: (
        <>
          <p>
            At <strong>ViewFlow</strong>, privacy is not an afterthought—it is fundamentally engineered into our video streaming architecture.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
            <div className="p-3 rounded-2xl bg-brand-bg/60 border border-brand-border text-xs">
              <strong className="text-brand-text block mb-1">🔍 Transparency</strong>
              Clear explanations of what data is processed and why.
            </div>
            <div className="p-3 rounded-2xl bg-brand-bg/60 border border-brand-border text-xs">
              <strong className="text-brand-text block mb-1">🛡️ User Control</strong>
              Full autonomy over your privacy settings & cookie preferences.
            </div>
            <div className="p-3 rounded-2xl bg-brand-bg/60 border border-brand-border text-xs">
              <strong className="text-brand-text block mb-1">🔒 Zero Data Selling</strong>
              We never sell or monetize user personal data to third parties.
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'data-collected',
      icon: Database,
      title: '2. Information We Collect',
      content: (
        <>
          <p>To provide high-quality video streaming and account services, we collect:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-brand-muted text-xs md:text-sm">
            <li><strong>Account Profile Data:</strong> Email address, username, avatar image, and hashed passwords (for manual registration) or Google profile tokens (for Google OAuth).</li>
            <li><strong>Media Uploads:</strong> Video files, custom thumbnails, titles, and descriptions uploaded to Cloudinary storage.</li>
            <li><strong>Playback & History Metrics:</strong> Watch history, video likes, subscriptions, playlist collections, and comments.</li>
            <li><strong>Technical Diagnostics:</strong> IP address, browser user-agent, streaming bandwidth, and error telemetry to optimize buffer performance.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'third-party',
      icon: Server,
      title: '3. Storage & Third-Party Infrastructure',
      content: (
        <>
          <p>We work with enterprise-grade cloud providers to operate ViewFlow securely:</p>
          <div className="space-y-2 mt-3 text-xs">
            <div className="p-3 rounded-2xl bg-brand-card/80 border border-brand-border flex items-center justify-between">
              <div>
                <strong className="text-brand-text">MongoDB Atlas</strong>
                <p className="text-brand-muted text-[11px]">Secure database for user authentication, channels, and metadata.</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Encrypted DB</span>
            </div>
            <div className="p-3 rounded-2xl bg-brand-card/80 border border-brand-border flex items-center justify-between">
              <div>
                <strong className="text-brand-text">Cloudinary Storage</strong>
                <p className="text-brand-muted text-[11px]">High-speed CDN for video assets, avatars, and custom thumbnails.</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">HTTPS CDN</span>
            </div>
            <div className="p-3 rounded-2xl bg-brand-card/80 border border-brand-border flex items-center justify-between">
              <div>
                <strong className="text-brand-text">Google Gemini AI Engine</strong>
                <p className="text-brand-muted text-[11px]">Powers intelligent search, video summaries, and AI assistant chat.</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">AI Analytics</span>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'security',
      icon: Lock,
      title: '4. Security & Encryption Standards',
      content: (
        <>
          <p>
            ViewFlow employs industry-standard security measures, including 256-bit SSL/TLS encryption for all data in transit, bcrypt password hashing, and stateless JSON Web Tokens (JWT) for secure authentication.
          </p>
        </>
      ),
    },
    {
      id: 'user-rights',
      icon: Eye,
      title: '5. Your Rights & Data Controls',
      content: (
        <>
          <p>Regardless of your geographic location, ViewFlow grants you full control over your digital footprint:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1.5 text-brand-muted text-xs md:text-sm">
            <li><strong>Right to Access & Export:</strong> View all your uploaded videos, channel statistics, and activity history.</li>
            <li><strong>Right to Clear History:</strong> Clear your watch history or search logs anytime from your account dashboard.</li>
            <li><strong>Right to Erasure (Account Deletion):</strong> Delete your channel and user account permanently.</li>
            <li><strong>Cookie Preference Controls:</strong> Adjust your privacy toggles at any time via the Cookie Settings modal.</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen py-10 px-4 md:px-12 max-w-[1200px] mx-auto select-none">
      {/* Top Header */}
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-brand-muted hover:text-brand-text mb-4 transition-colors">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-brand-card via-brand-bg to-brand-card border border-brand-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pink/15 border border-brand-pink/30 text-brand-pink text-xs font-bold">
              <ShieldCheck size={14} /> Privacy & Data Trust
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-brand-text tracking-tight">
              Privacy Charter
            </h1>
            <p className="text-xs md:text-sm text-brand-muted font-medium">
              Transparent Data Practices & Protection Standards • Updated July 2026
            </p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-pink text-white text-xs font-bold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-all self-start md:self-auto shrink-0"
          >
            Manage Cookie Preferences <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Table of Contents */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-5 rounded-2xl bg-brand-card/80 border border-brand-border backdrop-blur-md space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-brand-text border-l-2 border-brand-pink pl-2">
              Privacy Overview
            </h3>
            <nav className="flex flex-col space-y-1">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="text-xs text-brand-muted hover:text-brand-pink font-semibold py-1.5 px-2 rounded-lg hover:bg-brand-pink/10 transition-all"
                >
                  {sec.title.split('.')[1]}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Sections Content */}
        <div className="lg:col-span-3 space-y-6">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                id={sec.id}
                className="p-6 md:p-8 rounded-3xl bg-brand-card/60 border border-brand-border backdrop-blur-sm space-y-4 hover:border-brand-pink/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-brand-pink/15 text-brand-pink border border-brand-pink/20">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-brand-text">{sec.title}</h2>
                </div>
                <div className="text-xs md:text-sm text-brand-muted leading-relaxed font-medium">
                  {sec.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PrivacyCharter;
