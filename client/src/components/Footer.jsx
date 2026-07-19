import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const { showToast } = useToast();

  return (
    <footer className="mt-auto border-t border-brand-border bg-brand-card/65 backdrop-blur-md py-12 px-4 md:px-12 select-none w-full z-10">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
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
        
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest border-l-2 border-brand-primary pl-2">Platform</h4>
          <Link to="/" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Home Hub</Link>
          <Link to="/feed/trending" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Trending Feeds</Link>
          <Link to="/channels" className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Browse Partner channels</Link>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest border-l-2 border-brand-pink pl-2">Legal</h4>
          <Link to="#" onClick={(e) => { e.preventDefault(); showToast('Demo: Terms & Conditions coming soon!', 'info'); }} className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Terms & Conditions</Link>
          <Link to="#" onClick={(e) => { e.preventDefault(); showToast('Demo: Privacy Charter coming soon!', 'info'); }} className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Privacy Charter</Link>
          <Link to="#" onClick={(e) => { e.preventDefault(); showToast('Demo: Cookie Settings coming soon!', 'info'); }} className="text-[11px] text-brand-muted hover:text-brand-text transition-colors font-semibold">Cookie Settings</Link>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest border-l-2 border-brand-blue pl-2">Developer info</h4>
          <p className="text-[11px] text-brand-muted leading-relaxed font-semibold">
            Powered by Google Gemini 2.5 Flash, React.js, Express, and MongoDB. 
          </p>
          <span className="text-[10px] text-brand-primary font-bold">© 2026 ViewFlow. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
