import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, HelpCircle } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const NotFound = () => {
  useDocumentTitle('404 Page Not Found');

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex items-center justify-center p-6 bg-brand-bg relative select-none">
      {/* Shifting radial gradient glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Premium Glassmorphic Card Container */}
      <div className="w-full max-w-lg p-10 md:p-14 rounded-3xl premium-glass border border-white/10 hover:border-brand-primary/30 shadow-2xl relative z-10 text-center flex flex-col items-center gap-6 transition-colors duration-500">
        
        {/* Shimmering Neon 404 Header */}
        <div className="relative">
          <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-brand-primary via-brand-pink to-brand-primary bg-clip-text text-transparent animate-gradient-text tracking-tighter">
            404
          </h1>
          <div className="absolute -top-4 -right-4 p-2 bg-brand-pink/20 rounded-full border border-brand-pink/30 animate-float">
            <HelpCircle className="text-brand-pink" size={24} />
          </div>
        </div>

        {/* Cinematic Heading & Subtitle */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">
            Lost in the Stream
          </h2>
          <p className="text-xs md:text-sm text-brand-muted font-medium max-w-sm">
            The broadcast you are looking for has been taken offline, moved to another frequency, or does not exist.
          </p>
        </div>

        {/* Compass Navigation Indicator */}
        <div className="w-24 h-24 rounded-full border border-dashed border-brand-border/40 flex items-center justify-center animate-morph-blob bg-white/[0.02]">
          <Compass className="text-brand-primary animate-spin" style={{ animationDuration: '20s' }} size={36} />
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-primary to-brand-pink text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-brand-primary-glow hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <Home size={14} />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all duration-300 cursor-pointer"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
