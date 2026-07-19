import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Upload, FileVideo, Image, X } from 'lucide-react';

import useDocumentTitle from '../hooks/useDocumentTitle';

const UploadVideo = () => {
  useDocumentTitle('Upload Cinematic Video');
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [categories, setCategories] = useState([]);
  
  // Form values
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Status states
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      alert('Please select a video file to upload.');
      return;
    }
    if (!thumbnailFile) {
      alert('Please select a thumbnail file.');
      return;
    }
    if (!category) {
      alert('Please choose a category.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatusMessage('Uploading assets to server...');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('isPublished', isPublished);
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnailFile);

    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 0, // Disable timeout for large file uploads & Cloudinary transcoding
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
          if (percentCompleted === 100) {
            setStatusMessage('Assets uploaded. Cloudinary processing & transcoding media, please wait...');
          }
        },
      });

      setStatusMessage('Upload completed successfully!');
      alert('Video uploaded successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Upload Error:', err);
      setStatusMessage('');
      alert(err.response?.data?.message || 'File upload failed. Ensure files are not excessively large.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full max-w-2xl mx-auto min-h-screen select-none relative">
      <div className="border-b border-light-border dark:border-dark-border pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-light-text dark:text-dark-text tracking-wide uppercase flex items-center gap-2">
            <Upload size={24} className="text-youtube-red" /> Upload Stream Content
          </h1>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
            Add video files, custom overlays/thumbnails, and categorizations to sync with your subscribers.
          </p>
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-light-hover dark:hover:bg-dark-hover text-light-text dark:text-dark-text cursor-pointer transition-colors border border-light-border dark:border-dark-border shadow-sm flex items-center justify-center shrink-0"
          title="Go Back"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleUploadSubmit} className="flex flex-col gap-5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border p-6 rounded-3xl shadow-sm">
        {/* Row 1: File Upload selections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Video Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Video File</span>
            <label className="flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg cursor-pointer hover:bg-light-hover dark:hover:bg-dark-hover transition-colors relative">
              <input
                type="file"
                accept="video/*"
                required
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="hidden"
              />
              {videoFile ? (
                <div className="flex flex-col items-center p-4 text-center">
                  <FileVideo size={36} className="text-youtube-red mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-light-text dark:text-dark-text truncate w-40">{videoFile.name}</span>
                  <span className="text-[10px] text-light-muted mt-0.5">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-light-muted">
                  <Upload size={28} />
                  <span className="text-xs font-bold mt-2">Choose Video</span>
                  <span className="text-[10px] mt-0.5">MP4, WEBM formats</span>
                </div>
              )}
            </label>
          </div>

          {/* Thumbnail Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Thumbnail Image</span>
            <label className="flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg cursor-pointer hover:bg-light-hover dark:hover:bg-dark-hover transition-colors relative">
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setThumbnailFile(e.target.files[0])}
                className="hidden"
              />
              {thumbnailFile ? (
                <div className="flex flex-col items-center p-4 text-center">
                  <Image size={36} className="text-emerald-500 mb-2 animate-pulse" />
                  <span className="text-xs font-bold text-light-text dark:text-dark-text truncate w-40">{thumbnailFile.name}</span>
                  <span className="text-[10px] text-light-muted mt-0.5">{(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-light-muted">
                  <Image size={28} />
                  <span className="text-xs font-bold mt-2">Choose Thumbnail</span>
                  <span className="text-[10px] mt-0.5">PNG, JPG cover art</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Video Title</label>
          <input
            type="text"
            required
            placeholder="Introduce your video..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Video Description</label>
          <textarea
            required
            placeholder="Share details about the stream content..."
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red resize-none"
          />
        </div>

        {/* Row 2: Category and Visibility options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Visibility Mode</label>
            <select
              value={isPublished}
              onChange={(e) => setIsPublished(e.target.value === 'true')}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red"
            >
              <option value="true">Public (Go Live immediately)</option>
              <option value="false">Private (Save to draft first)</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">Tags (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. animation, cgi, movie, blender"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-light-border bg-light-bg text-light-text dark:border-dark-border dark:bg-dark-bg dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-youtube-red"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || !category}
          className="w-full py-3 bg-youtube-red hover:bg-youtube-darkRed text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          Publish Content
        </button>
      </form>

      {/* Upload Loader Progress Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white p-6">
          <div className="w-full max-w-sm flex flex-col items-center text-center gap-4">
            <div className="relative flex items-center justify-center">
              {/* Spinner */}
              <div className="h-20 w-20 rounded-full border-4 border-white/20 border-t-youtube-red animate-spin" />
              <span className="absolute text-sm font-bold">{progress}%</span>
            </div>

            <div className="flex flex-col gap-1 w-full mt-2">
              <span className="text-sm font-extrabold tracking-wide uppercase">Publishing Video</span>
              
              {/* Progress Slider */}
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-1">
                <div style={{ width: `${progress}%` }} className="h-full bg-youtube-red transition-all duration-300" />
              </div>

              <span className="text-xs text-white/60 leading-relaxed mt-2 italic px-4 select-none">
                {statusMessage}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadVideo;
