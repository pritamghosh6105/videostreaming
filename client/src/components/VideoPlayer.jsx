import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  HelpCircle,
  X
} from 'lucide-react';

const VideoPlayer = ({ src, thumbnail, onEnded, videoId }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => console.log('Autoplay blocked:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Format Time (e.g. 03:45)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
    }
  };

  // Handle video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      if (width && height) {
        setAspectRatio(width / height);
      }
    }
  };

  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef(null);

  // Update progress position relative to container dimensions
  const updateSeekPosition = (e) => {
    if (videoRef.current && duration && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      let clickX = e.clientX - rect.left;
      if (clickX < 0) clickX = 0;
      if (clickX > rect.width) clickX = rect.width;

      const newPercentage = clickX / rect.width;
      const newTime = newPercentage * duration;

      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateSeekPosition(e);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        updateSeekPosition(e);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Change Volume
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
      videoRef.current.muted = val === 0;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      videoRef.current.muted = nextMute;
      videoRef.current.volume = nextMute ? 0 : volume;
    }
  };

  // Change Speed
  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Track fullscreen changes (e.g. esc key press)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Show/Hide controls timer based on cursor movement
  const triggerControlsVisibility = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  };

  // Reset states and trigger autoplay when source resets
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setShowControls(true);

    if (videoRef.current && src) {
      const timer = setTimeout(() => {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log('Autoplay transition blocked:', err));
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [src]);

  // Handle ended
  const handleSkipNext = (e) => {
    e.stopPropagation();
    if (onEnded) {
      onEnded();
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onEnded && autoplay) {
      onEnded();
    }
  };

  // Shortcuts: Space to play, M to mute, F to fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement.tagName.toLowerCase();
      if (activeEl === 'input' || activeEl === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isMuted, volume, isFullscreen]);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControlsVisibility}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{ aspectRatio: aspectRatio }}
      className="relative w-full max-h-[75vh] mx-auto rounded-3xl bg-black overflow-hidden group select-none shadow-2xl border border-white/5"
    >
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full cursor-pointer object-contain"
        preload="metadata"
      />

      {/* Big Center Play/Pause indicator overlay */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity"
        >
          <div className="h-20 w-20 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 shadow-2xl transition-all duration-300">
            <Play size={32} fill="white" className="ml-1" />
          </div>
        </div>
      )}

      {/* Control Bar Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-transparent flex flex-col gap-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Seeker */}
        <div
          ref={progressRef}
          onMouseDown={handleMouseDown}
          className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2.5 transition-all group/seeker"
        >
          <div
            style={{ width: `${progressPercent}%` }}
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand-primary to-brand-pink rounded-full flex items-center justify-end"
          >
            <div className={`h-3.5 w-3.5 rounded-full bg-white shadow transition-transform origin-center absolute translate-x-1/2 ${
              isDragging ? 'scale-100' : 'scale-0 group-hover/seeker:scale-100'
            }`} />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between text-white font-semibold text-sm">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-brand-primary transition-colors cursor-pointer">
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>

            {onEnded && (
              <button onClick={handleSkipNext} className="hover:text-brand-primary transition-colors cursor-pointer" title="Play next video">
                <SkipForward size={18} fill="currentColor" />
              </button>
            )}

            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="hover:text-brand-primary transition-colors cursor-pointer">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="hidden md:inline-block w-0 group-hover/volume:w-16 h-1 rounded-full accent-brand-primary bg-white/30 transition-all duration-300 cursor-pointer"
              />
            </div>

            <span className="text-xs text-brand-muted select-none">
              {formatTime(currentTime)} <span className="mx-1 text-white/20">/</span> {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            <label className="hidden sm:flex items-center gap-1.5 cursor-pointer text-xs select-none text-brand-muted hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
                className="rounded accent-brand-primary bg-white/20 border-none h-3.5 w-3.5 cursor-pointer"
              />
              <span>Autoplay</span>
            </label>

            {/* Playback speed selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1.5 hover:text-brand-primary transition-colors text-xs border border-white/10 px-2.5 py-1 rounded-xl bg-white/5 cursor-pointer"
              >
                <Settings size={12} /> {playbackRate === 1 ? 'Normal' : `${playbackRate}x`}
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-3 w-28 rounded-2xl premium-glass text-white shadow-2xl flex flex-col overflow-hidden text-xs py-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`px-4 py-2 text-left hover:bg-brand-primary hover:text-white transition-colors cursor-pointer ${
                        playbackRate === rate ? 'text-brand-primary font-bold bg-white/5' : 'text-brand-muted'
                      }`}
                    >
                      {rate === 1 ? 'Normal' : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowShortcutsModal(true)}
              className="hidden sm:block hover:text-brand-primary transition-colors cursor-pointer"
              title="Keyboard Shortcuts"
            >
              <HelpCircle size={18} />
            </button>

            <button onClick={toggleFullscreen} className="hover:text-brand-primary transition-colors cursor-pointer">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-xs p-6 premium-glass rounded-3xl flex flex-col relative select-none">
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-brand-primary border-b border-white/5 pb-2.5 mb-4">Player Shortcuts</h3>
            <div className="flex flex-col gap-3 text-xs font-semibold text-white">
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">Play / Pause</span>
                <kbd className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 shadow text-[10px]">Space</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">Mute / Unmute</span>
                <kbd className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 shadow text-[10px]">M</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">Fullscreen Mode</span>
                <kbd className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 shadow text-[10px]">F</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
