import { Link } from 'react-router-dom';
import { Play, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-brand-border bg-brand-card/65 backdrop-blur-md py-12 px-4 md:px-12 select-none w-full z-10">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand Info */}
        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-pink text-white flex items-center justify-center">
              <Play size={12} fill="white" className="ml-0.5" />
            </div>
            <span className="font-black text-base tracking-wider uppercase text-brand-text">
              View<span className="bg-gradient-to-r from-brand-primary to-brand-pink bg-clip-text text-transparent">Flow</span>
            </span>
          </Link>
          <p className="text-[11px] text-brand-muted leading-relaxed font-semibold">
            The next-generation video streaming experience. Engineered for beautiful visuals, seamless latency, and creator expression.
          </p>
        </div>

        {/* Platform Links */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest border-l-2 border-brand-primary pl-2">Platform</h4>
          <Link to="/" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Home Hub</Link>
          <Link to="/feed/trending" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Trending Feeds</Link>
          <Link to="/channels" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Browse Partner channels</Link>
        </div>

        {/* Legal Links */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest border-l-2 border-brand-pink pl-2">Legal</h4>
          <Link to="/terms" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Terms & Conditions</Link>
          <Link to="/privacy" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Privacy Charter</Link>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-cookie-settings'))}
            className="text-left text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold"
          >
            Cookie Settings
          </button>
        </div>

        {/* Contact Us Section */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest border-l-2 border-emerald-400 pl-2">Contact Us</h4>
          <a
            href="mailto:pg9810487@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] text-brand-muted hover:text-red-400 transition-colors font-semibold group"
          >
            <div className="p-1 rounded-md bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
              <Mail size={13} />
            </div>
            Gmail Support
          </a>
          <a
            href="https://www.linkedin.com/in/pritam-ghosh-3487a6296/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] text-brand-muted hover:text-blue-400 transition-colors font-semibold group"
          >
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </div>
            LinkedIn Profile
          </a>
        </div>

        {/* Developer Info */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest border-l-2 border-brand-blue pl-2">Developer info</h4>
          <p className="text-[11px] text-brand-muted leading-relaxed font-semibold">
            Powered by Team ViewFlow.
          </p>
          <span className="text-[10px] text-brand-primary font-bold">© 2026 ViewFlow. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
