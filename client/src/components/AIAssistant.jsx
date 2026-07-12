import React, { useState, useEffect, useRef } from 'react';
import { useLocation, matchPath, useNavigate } from 'react-router-dom';
import { Bot, Sparkles, Send, X, RotateCcw, MessageSquare, Settings, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AIAssistant = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Floating widget and adjustable states
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(384);
  const [height, setHeight] = useState(550);
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem('ai_assistant_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.avatarUrl === 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop') {
          parsed.avatarUrl = '/ai-avatar.png';
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return {
      personality: 'balanced',
      fontSize: 'medium',
      useContext: true,
      avatarUrl: '/ai-avatar.png',
    };
  });

  useEffect(() => {
    localStorage.setItem('ai_assistant_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hi there! I am your AI Assistance. 🤖\n\nI can recommend videos, suggest playlist ideas, or summarize the video you are currently watching! Ask me anything.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  // Auto-scroll messages list
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Watch video detection
  const match = matchPath({ path: '/watch/:id' }, location.pathname);
  const watchVideoId = match?.params?.id;

  // Fetch watch video metadata when route changes
  useEffect(() => {
    const fetchVideoContext = async () => {
      if (watchVideoId) {
        try {
          const res = await api.get(`/videos/${watchVideoId}`);
          const v = res.data?.data;
          if (v) {
            setCurrentVideo({
              id: v._id,
              title: v.title,
              description: v.description,
              views: v.views,
              ownerName: v.owner?.fullName || v.owner?.username || 'Creator',
              tags: v.tags || [],
            });
          }
        } catch (err) {
          console.error('AI context video fetch error:', err.message);
          setCurrentVideo(null);
        }
      } else {
        setCurrentVideo(null);
      }
    };

    fetchVideoContext();
  }, [watchVideoId]);

  // Mouse Drag-to-Resize Handler (Top-Left diagonal resize)
  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const deltaY = startY - moveEvent.clientY;
      const newWidth = Math.max(320, Math.min(640, startWidth + deltaX));
      const newHeight = Math.max(400, Math.min(850, startHeight + deltaY));
      setWidth(newWidth);
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Send message function
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue('');
    }

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build conversation history (limit to last 10 messages for token efficiency)
      const chatHistory = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-10)
        .map((m) => ({
          sender: m.sender,
          text: m.text,
        }));

      // Calculate temperature
      let temp = 0.7;
      if (aiConfig.personality === 'precise') temp = 0.2;
      else if (aiConfig.personality === 'creative') temp = 1.0;

      // Set request payload
      const payload = {
        message: text,
        history: chatHistory,
        config: { temperature: temp },
      };

      if (currentVideo && aiConfig.useContext) {
        payload.context = { video: currentVideo };
      }

      // Request to backend
      const res = await api.post('/ai/chat', payload);

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.data?.reply || 'Sorry, I encountered an issue processing that.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('AI response error:', error);
      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: '⚠️ Failed to connect to the assistant server. Please make sure the backend is running.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: 'Chat cleared! How else can I help you? 👋',
        timestamp: new Date(),
      },
    ]);
  };

  // Parsing bold text (**bold**) and markdown links ([text](url))
  const renderMessageText = (text) => {
    if (!text) return null;

    const parseInlineElements = (txt) => {
      const parseBoldText = (t) => {
        const boldRegex = /\*\*([^*]+)\*\*/g;
        const parts = [];
        let lastIdx = 0;
        let m;
        while ((m = boldRegex.exec(t)) !== null) {
          const textBefore = t.substring(lastIdx, m.index);
          if (textBefore) parts.push(textBefore);
          parts.push(<strong key={m.index} className="font-bold text-light-text dark:text-dark-text">{m[1]}</strong>);
          lastIdx = boldRegex.lastIndex; // FIXED lastIndex
        }
        const textAfter = t.substring(lastIdx);
        if (textAfter) parts.push(textAfter);
        return parts;
      };

      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(txt)) !== null) {
        const textBefore = txt.substring(lastIndex, match.index);
        if (textBefore) {
          parts.push(...parseBoldText(textBefore));
        }
        const linkText = match[1];
        const linkUrl = match[2];
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            className="text-red-500 hover:text-red-600 dark:text-youtube-lightRed hover:underline font-semibold transition-all"
            onClick={(e) => {
              if (linkUrl.startsWith('/')) {
                e.preventDefault();
                navigate(linkUrl);
              }
            }}
          >
            {linkText}
          </a>
        );
        lastIndex = linkRegex.lastIndex;
      }

      const textAfter = txt.substring(lastIndex);
      if (textAfter) {
        parts.push(...parseBoldText(textAfter));
      }

      return parts;
    };

    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const isNumbered = /^\d+\.\s/.test(line.trim());

      let cleanLine = line;
      if (isBullet) {
        cleanLine = line.trim().substring(2);
      } else if (isNumbered) {
        const matchNum = line.trim().match(/^(\d+\.\s)(.*)/);
        if (matchNum) {
          cleanLine = matchNum[2];
        }
      }

      const parsedInline = parseInlineElements(cleanLine);

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc pl-1 py-0.5 text-light-text dark:text-dark-text leading-relaxed">
            {parsedInline}
          </li>
        );
      } else if (isNumbered) {
        const num = line.trim().match(/^(\d+)\./)?.[1] || (lineIdx + 1).toString();
        return (
          <div key={lineIdx} className="flex gap-2 ml-4 py-0.5 text-light-text dark:text-dark-text leading-relaxed">
            <span className="font-semibold text-red-500 dark:text-youtube-lightRed select-none">{num}.</span>
            <span className="flex-grow">{parsedInline}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={lineIdx} className="h-2" />;
      }

      return (
        <p key={lineIdx} className="mb-1 leading-relaxed text-light-text dark:text-dark-text">
          {parsedInline}
        </p>
      );
    });
  };

  // Context-specific suggest chips
  const suggestionChips = currentVideo
    ? [
        { label: '📝 Summarize video', query: 'Summarize this video' },
        { label: '📺 Who created this?', query: 'Who created this video and how popular is it?' },
        { label: '💡 Find video suggestions', query: 'Recommend videos related to the current one' },
      ]
    : [
        { label: '🎥 Recommend videos', query: 'Recommend some top videos to watch' },
        { label: '🎵 Search music/vlogs', query: 'Find some cool vlogs or music in the database' },
        { label: '📂 How to save playlist', query: 'How do I create a playlist?' },
      ];

  const getFontSizeClass = () => {
    if (aiConfig.fontSize === 'small') return 'text-[11px]';
    if (aiConfig.fontSize === 'large') return 'text-[14px]';
    return 'text-xs';
  };

  return (
    <div className="dark fixed bottom-6 right-6 z-50 font-sans">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center h-16 w-16 transition-all duration-300 active:scale-95 group relative cursor-pointer"
          title="Open AI Assistance"
        >
          {aiConfig.avatarUrl ? (
            <img 
              src={aiConfig.avatarUrl} 
              alt="AI" 
              className="h-14 w-14 object-contain filter drop-shadow-lg group-hover:scale-115 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-brand-primary via-brand-pink to-brand-blue text-white shadow-xl animate-neon-pulse border border-white/20">
              <Bot className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          )}
          <span className="absolute top-0.5 right-0.5 flex h-4.5 w-4.5 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-gradient-to-tr from-brand-pink to-brand-primary text-[8px] font-black items-center justify-center text-white border border-white/20 shadow-md">AI</span>
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          style={{ width: `${width}px`, height: `${height}px` }}
          className="max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl border border-light-border/40 dark:border-dark-border/40 rounded-2xl shadow-2xl flex flex-col transform scale-100 origin-bottom-right relative select-none"
        >
          {/* Drag Resize Handle (Top-Left Corner) */}
          <div 
            onMouseDown={handleMouseDown}
            className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50 flex items-center justify-center group"
            title="Drag to Resize"
          >
            <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-youtube-red/40 group-hover:border-youtube-red transition-all rounded-tl-sm absolute top-1.5 left-1.5" />
          </div>

          {/* Header Banner */}
          <div className="py-2 px-3.5 rounded-t-2xl bg-gradient-to-r from-youtube-red via-red-500 to-indigo-600 text-white flex items-center justify-between shadow-md select-none">
            <div className="flex items-center gap-2 ml-1">
              <div className="p-0.5 bg-white/15 rounded-lg h-6 w-6 flex items-center justify-center overflow-hidden">
                {aiConfig.avatarUrl ? (
                  <img src={aiConfig.avatarUrl} alt="AI" className="h-full w-full object-cover rounded-md" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs tracking-wide leading-tight">AI Assistance</span>
                <span className="text-[9px] opacity-85 flex items-center gap-0.5 font-semibold leading-none mt-0.5">
                  <Sparkles className="h-2.5 w-2.5 inline" /> 
                  {showSettings ? 'Settings Panel' : (currentVideo && aiConfig.useContext ? 'Context: Active Video' : 'Ready to help')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1 hover:bg-white/20 rounded-full transition-colors active:scale-95 cursor-pointer ${showSettings ? 'bg-white/15' : ''}`}
                title={showSettings ? "Back to Chat" : "AI Settings"}
              >
                {showSettings ? <ArrowLeft className="h-3.5 w-3.5" /> : <Settings className="h-3.5 w-3.5" />}
              </button>
              {!showSettings && (
                <button
                  onClick={clearChat}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors active:scale-95 cursor-pointer"
                  title="Clear Conversation"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors active:scale-95 cursor-pointer"
                title="Close Assistant"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Settings Dashboard Panel */}
          {showSettings ? (
            <div className="flex-grow p-4 overflow-y-auto space-y-5 text-light-text dark:text-dark-text select-none">
              {/* Sizing Parameters (Width / Height) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">Layout Dimensions</h4>
                <div className="bg-light-hover/40 dark:bg-dark-hover/40 border border-light-border/30 dark:border-dark-border/30 rounded-xl p-3 space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Width</span>
                      <span className="text-youtube-red dark:text-youtube-lightRed">{width}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="320" 
                      max="640" 
                      value={width} 
                      onChange={(e) => setWidth(parseInt(e.target.value))}
                      className="w-full h-1 bg-light-border dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-youtube-red"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Height</span>
                      <span className="text-youtube-red dark:text-youtube-lightRed">{height}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="400" 
                      max="850" 
                      value={height} 
                      onChange={(e) => setHeight(parseInt(e.target.value))}
                      className="w-full h-1 bg-light-border dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-youtube-red"
                    />
                  </div>
                  <p className="text-[10px] text-light-muted dark:text-dark-muted italic">Tip: Drag the top-left corner of the window to resize it dynamically.</p>
                </div>
              </div>

              {/* AI Personality (Temperature) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">AI Personality</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['precise', 'balanced', 'creative'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAiConfig(prev => ({ ...prev, personality: type }))}
                      className={`py-2 px-1 text-[10px] font-bold rounded-xl border capitalize transition-all duration-200 active:scale-95 ${
                        aiConfig.personality === type
                          ? 'bg-gradient-to-tr from-youtube-red to-indigo-600 text-white border-transparent shadow-sm cursor-pointer'
                          : 'border-light-border/60 dark:border-dark-border/60 bg-light-hover/30 dark:bg-dark-hover/30 text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-border cursor-pointer'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-light-muted dark:text-dark-muted mt-1 leading-normal">
                  {aiConfig.personality === 'precise' && '🎯 Focuses on accuracy, facts, and direct answers (Temp: 0.2).'}
                  {aiConfig.personality === 'balanced' && '⚖️ Combines creative suggestions with factual recommendations (Temp: 0.7).'}
                  {aiConfig.personality === 'creative' && '✨ Generates imaginative suggestions, ideas, and prompts (Temp: 1.0).'}
                </p>
              </div>

              {/* Font Size Adjuster */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">Chat Font Size</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['small', 'medium', 'large'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setAiConfig(prev => ({ ...prev, fontSize: sz }))}
                      className={`py-2 px-1 text-[10px] font-bold rounded-xl border capitalize transition-all duration-200 active:scale-95 ${
                        aiConfig.fontSize === sz
                          ? 'bg-gradient-to-tr from-youtube-red to-indigo-600 text-white border-transparent shadow-sm cursor-pointer'
                          : 'border-light-border/60 dark:border-dark-border/60 bg-light-hover/30 dark:bg-dark-hover/30 text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-border cursor-pointer'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context-Aware Toggle */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">Context Settings</h4>
                <div className="flex items-center justify-between bg-light-hover/40 dark:bg-dark-hover/40 border border-light-border/30 dark:border-dark-border/30 rounded-xl p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold">Watch Page Context</span>
                    <span className="text-[10px] text-light-muted dark:text-dark-muted max-w-[200px]">Send video details to help AI summarize watch content.</span>
                  </div>
                  <button
                    onClick={() => setAiConfig(prev => ({ ...prev, useContext: !prev.useContext }))}
                    className={`w-10 h-6 rounded-full flex items-center p-0.5 transition-all duration-300 focus:outline-none cursor-pointer ${
                      aiConfig.useContext ? 'bg-gradient-to-r from-youtube-red to-indigo-600' : 'bg-light-border dark:bg-dark-border'
                    }`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-all duration-300 ${
                        aiConfig.useContext ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Avatar Image Link setting */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">Avatar Image Link</h4>
                <div className="bg-light-hover/40 dark:bg-dark-hover/40 border border-light-border/30 dark:border-dark-border/30 rounded-xl p-3">
                  <input
                    type="text"
                    placeholder="Paste image link URL..."
                    value={aiConfig.avatarUrl || ''}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-black/20 border border-light-border/30 dark:border-dark-border/30 text-light-text dark:text-white placeholder-light-muted/50 dark:placeholder-dark-muted/50 focus:outline-none focus:border-youtube-red focus:ring-1 focus:ring-youtube-red transition-all font-semibold"
                  />
                  <p className="text-[9px] text-light-muted dark:text-dark-muted mt-1.5 leading-normal">
                    Enter any public image URL (JPEG, PNG, GIF) to customize the floating AI Assistant button and greetings orb.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Active Video Header Info when watching a video and context is enabled */}
              {currentVideo && aiConfig.useContext && (
                <div className="px-4 py-2.5 bg-light-hover/60 dark:bg-dark-hover/60 border-b border-light-border/30 dark:border-dark-border/30 text-xs text-light-muted dark:text-dark-muted truncate flex items-center gap-1.5 font-medium">
                  <span>📺</span>
                  <span className="font-semibold text-light-text dark:text-dark-text">Watching:</span>
                  <span className="truncate flex-grow opacity-90">{currentVideo.title}</span>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin select-text">
                {messages.map((msg) => {
                  if (msg.id === 'welcome') {
                    return (
                      <div key={msg.id} className="flex flex-col items-center justify-center py-6 px-2 text-center select-none animate-fade-in w-full">
                        {/* Shifting Blob Mesh Orb */}
                        <div className="h-20 w-20 relative flex items-center justify-center mb-5 mt-2">
                          {aiConfig.avatarUrl ? (
                            <img 
                              src={aiConfig.avatarUrl} 
                              alt="AI" 
                              className="h-full w-full object-contain filter drop-shadow-md animate-float"
                            />
                          ) : (
                            <>
                              <div className="absolute inset-0 rounded-[50%] bg-gradient-to-tr from-brand-primary via-brand-pink to-brand-blue animate-morph-blob filter blur-xl opacity-40 scale-125" />
                              <div className="absolute inset-0 rounded-[50%] bg-gradient-to-tr from-brand-primary via-brand-pink to-brand-blue animate-morph-blob border border-white/20 shadow-xl opacity-90 flex items-center justify-center">
                                <Bot className="text-white h-7 w-7 relative z-10 animate-float" />
                              </div>
                            </>
                          )}
                        </div>

                        {/* Title text */}
                        <h2 className="text-sm font-black uppercase tracking-widest bg-gradient-to-r from-brand-primary via-brand-pink to-brand-blue bg-clip-text text-transparent animate-gradient-text">
                          Hello, I'm ViewAI
                        </h2>
                        
                        <p className="text-[10px] text-brand-muted font-bold tracking-wide mt-1 max-w-[220px]">
                          Your cinematic co-pilot is standing by.
                        </p>

                        {/* Standby Waveform */}
                        <div className="flex justify-center items-center gap-1.5 h-6 mt-4 mb-3">
                          {[0.2, 0.4, 0.6, 0.8, 0.5, 0.3].map((delay, idx) => (
                            <div
                              key={idx}
                              style={{ animationDelay: `${delay}s` }}
                              className="w-1 h-3 bg-gradient-to-t from-brand-primary to-brand-pink rounded-full animate-wave-bar"
                            />
                          ))}
                        </div>

                        {/* Inner detail info bubble */}
                        <div className="max-w-[95%] p-4 rounded-2xl bg-white/5 border border-white/5 text-left text-xs font-semibold leading-relaxed text-brand-muted mt-2 shadow-inner">
                          {renderMessageText(msg.text.replace('Hi there! I am your AI Assistance. 🤖\n\n', ''))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 leading-relaxed transition-all hover:shadow-sm ${getFontSizeClass()} ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-tr from-brand-primary via-brand-pink to-brand-blue text-white shadow-md font-medium rounded-tr-none'
                            : 'bg-light-hover/70 dark:bg-dark-hover/70 border border-light-border/40 dark:border-dark-border/40 text-light-text dark:text-dark-text rounded-tl-none'
                        }`}
                      >
                        <div>{renderMessageText(msg.text)}</div>
                        <span
                          className={`block text-[9px] mt-1.5 text-right font-medium ${
                            msg.sender === 'user' ? 'text-white/70' : 'text-light-muted dark:text-dark-muted'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Loading Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-light-hover/70 dark:bg-dark-hover/70 border border-light-border/40 dark:border-dark-border/40 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5 shadow-sm">
                      <span className="h-2 w-2 bg-light-muted dark:bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-2 w-2 bg-light-muted dark:bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-2 w-2 bg-light-muted dark:bg-dark-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestion Chips */}
              <div className="px-4 py-3 flex flex-wrap gap-1.5 border-t border-light-border/30 dark:border-dark-border/30 bg-light-bg/50 dark:bg-dark-bg/20">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.query)}
                    disabled={isLoading}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-light-border/60 dark:border-dark-border/60 bg-white dark:bg-dark-hover text-light-text dark:text-dark-text hover:text-youtube-red dark:hover:text-youtube-lightRed hover:border-youtube-red/40 dark:hover:border-youtube-lightRed/40 hover:bg-youtube-red/5 dark:hover:bg-youtube-lightRed/5 transition-all duration-200 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 disabled:scale-100"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 border-t border-light-border/40 dark:border-dark-border/40 bg-white dark:bg-dark-card rounded-b-2xl flex flex-col gap-2">
                {!isAuthenticated && (
                  <div className="text-[10px] text-brand-pink font-bold bg-brand-pink/5 px-3 py-1.5 rounded-lg border border-brand-pink/10 self-stretch text-center">
                    Guest Mode: Requests are rate-limited. Please sign in to experience full features.
                  </div>
                )}
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask the AI assistance..."
                    disabled={isLoading}
                    className="flex-grow bg-light-hover/50 dark:bg-dark-hover/50 border border-light-border/60 dark:border-dark-border/60 rounded-full px-4 py-2.5 text-xs text-light-text dark:text-dark-text focus:outline-none focus:border-youtube-red/60 dark:focus:border-youtube-lightRed/60 focus:ring-2 focus:ring-youtube-red/10 dark:focus:ring-youtube-lightRed/10 transition-all duration-200 placeholder:text-light-muted/70 dark:placeholder:text-dark-muted/70 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2.5 rounded-full bg-gradient-to-tr from-youtube-red to-indigo-600 text-white hover:opacity-95 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-sm flex items-center justify-center shrink-0 border border-white/5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
