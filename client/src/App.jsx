import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

// Cold Start Loader Component
import ColdStartLoader from './components/ColdStartLoader';

// Layout components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AIAssistant from './components/AIAssistant';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Channel from './pages/Channel';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import UploadVideo from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import Notifications from './pages/Notifications';
import Subscriptions from './pages/Subscriptions';
import WatchHistory from './pages/WatchHistory';
import LikedVideos from './pages/LikedVideos';
import PlaylistDetail from './pages/PlaylistDetail';
import Channels from './pages/Channels';
import Trending from './pages/Trending';
import NotFound from './pages/NotFound';

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
        <main className={`flex-grow w-full smooth-transition flex flex-col ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
          <div className="flex-grow flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/search" element={<Search />} />
              <Route path="/c/:username" element={<Channel />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadVideo />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute>
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history/watch"
                element={
                  <ProtectedRoute>
                    <WatchHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/liked-videos"
                element={
                  <ProtectedRoute>
                    <LikedVideos />
                  </ProtectedRoute>
                }
              />
              <Route path="/playlist/:id" element={<PlaylistDetail />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/feed/trending" element={<Trending />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
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
                <ColdStartLoader />
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
