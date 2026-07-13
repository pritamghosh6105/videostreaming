import React, { useState, useEffect } from 'react';
import './ColdStartLoader.css';

const ColdStartLoader = () => {
  // Check if we already showed the loader in this tab session
  const isAlreadyShown = sessionStorage.getItem('cold-start-loader') === 'true';

  const [visible, setVisible] = useState(!isAlreadyShown);
  const [fadeOut, setFadeOut] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isAlreadyShown) {
      return;
    }

    // Disable scrolling when the loader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Show the loader for 1.8 seconds (1800ms) to allow top progress bar to complete
    const showTimer = setTimeout(() => {
      setFadeOut(true);

      // Remove from DOM after the fade-out transition completes (400ms)
      const removeTimer = setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('cold-start-loader', 'true');
        document.body.style.overflow = originalOverflow;
      }, 400);

      return () => clearTimeout(removeTimer);
    }, 1800);

    // Cleanup logic if component unmounts early
    return () => {
      clearTimeout(showTimer);
      document.body.style.overflow = originalOverflow;
    };
  }, [isAlreadyShown]);

  if (!visible) {
    return null;
  }

  return (
    <div className={`cold-start-overlay ${fadeOut ? 'fade-out' : ''}`} id="cold-start-loader">
      {/* YouTube Style Top Laser Progress Bar */}
      <div className="top-loading-bar" />

      <div className="brand-loader-container">
        {hasError ? (
          <div className="fallback-spinner" aria-label="Loading..." />
        ) : (
          <>
            {/* Cinematic Concentric Orbiting Play Icon */}
            <svg 
              className="cinematic-logo-svg"
              viewBox="0 0 200 200" 
              xmlns="http://www.w3.org/2000/svg"
              onError={() => setHasError(true)}
            >
              <defs>
                {/* Inner Ring Gradient: Pink to Blue */}
                <linearGradient id="inner-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>

                {/* Outer Ring Gradient: Purple to Pink */}
                <linearGradient id="outer-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>

                {/* Center Play Button Gradient */}
                <linearGradient id="play-button-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>

              {/* Outer Orbit Ring */}
              <circle 
                className="orbit-outer" 
                cx="100" 
                cy="100" 
                r="82" 
                fill="none" 
                stroke="url(#outer-ring-grad)" 
                strokeWidth="3.5" 
                strokeDasharray="90 35 120 40" 
                strokeLinecap="round" 
              />

              {/* Inner Orbit Ring */}
              <circle 
                className="orbit-inner" 
                cx="100" 
                cy="100" 
                r="64" 
                fill="none" 
                stroke="url(#inner-ring-grad)" 
                strokeWidth="2.5" 
                strokeDasharray="50 25 70 20" 
                strokeLinecap="round" 
              />

              {/* Center Play Button with Rounded Corners */}
              <path 
                className="play-btn-center"
                d="M87,72.5 C87,70 89.5,68.5 91.5,69.5 L129,97 C131,98.5 131,101.5 129,103 L91.5,130.5 C89.5,131.5 87,130 87,127.5 Z"
                fill="url(#play-button-grad)"
              />
            </svg>

            {/* Glowing Brand Title & Subtitle */}
            <div className="brand-text-wrapper">
              <h1 className="brand-title">
                View<span className="brand-title-gradient">Flow</span>
              </h1>
              <span className="brand-subtitle">Cinematic Streaming</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ColdStartLoader;
