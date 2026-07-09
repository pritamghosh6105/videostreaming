import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

// Layout components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AIAssistant from './components/AIAssistant';

// Pages
import Home from './pages/Home';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Channel from './pages/Channel';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import UploadVideo from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import Subscriptions from './pages/Subscriptions';
import WatchHistory from './pages/WatchHistory';
import LikedVideos from './pages/LikedVideos';
import PlaylistDetail from './pages/PlaylistDetail';
import Channels from './pages/Channels';
import Trending from './pages/Trending';

// Setup TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppContent = () => {
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text grid-glow flex flex-col font-sans select-none overflow-x-hidden">
      {/* Premium Glass Header */}
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-grow pt-16 relative">
        {/* Floating Sidebar Navigation */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Cinematic Main Viewport */}
        <main className={`flex-grow w-full smooth-transition ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/c/:username" element={<Channel />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/upload" element={<UploadVideo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/history/watch" element={<WatchHistory />} />
            <Route path="/liked-videos" element={<LikedVideos />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/feed/trending" element={<Trending />} />
          </Routes>
        </main>
      </div>
      
      {/* Floating AI Panel */}
      <AIAssistant />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
