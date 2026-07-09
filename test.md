# ViewFlow Premium Overhaul: Technical Specifications & Context Blueprint

This document acts as a complete visual and technical handoff for the **ViewFlow** project. Read this file to understand the architecture, branding definitions, modified files, configuration details, and pending development tasks.

---

## 🎨 1. Branding & Design System

ViewFlow has been upgraded from a generic red YouTube copy to a cinematic, ultra-modern glassmorphic video streaming platform inspired by Apple TV+, Netflix, and Prime Video.

### Color Palette (index.css)
- **Backgrounds:** Dynamic zinc light/dark transitions (`#F4F4F5` / `#09090B`).
- **Accent Colors:** Royal Violet (`#7C3AED`) and Neon Pink (`#EC4899`).
- **Gradients:** Dynamic linear overlays (`from-brand-primary to-brand-pink`).
- **Glass Card Backdrops:** Frosted cards (`.premium-glass`) with blur radius of `24px` and transparent border borders.
- **Typography:** Modern, rounded sans-serif font family **Outfit** imported from Google Fonts.

---

## 📂 2. Core Modified Components

All redesigned components utilize Tailwind CSS v4 variables mapped to dynamic CSS custom variables defined under `:root` and `.dark` blocks in [index.css](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/index.css).

1. **[Navbar.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/components/Navbar.jsx):**
   - Implements dynamic scroll heights to toggle background blur and border transparency.
   - Integrated native **SpeechRecognition Speech API** for Voice Search.
   - Added a collapsible **Discover Megamenu** dropdown.
2. **[Sidebar.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/components/Sidebar.jsx):**
   - Supports a full-sized sliding nav sidebar, a mini icon-dock layout for secondary views, and an animated mobile drawer overlay.
   - Highlighted active routes using gradient overlays and side border ticks.
3. **[VideoCard.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/components/VideoCard.jsx):**
   - Implements **Autoplay Muted Trailer Previews on Mouse Enter** (triggers custom video loop logic).
   - Restructured layout with resolution badges (4K UHD, 1080p HD) and category tags.
4. **[VideoPlayer.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/components/VideoPlayer.jsx):**
   - Upgraded customized video controllers (play, skip, volume range slider, speed selector) to match the royal violet/pink brand colors.
   - Built a keyboard shortcut modal overlay (Space to Play, M to Mute, F to Fullscreen).
5. **[AIAssistant.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/components/AIAssistant.jsx):**
   - **Forced Permanently into Dark Mode:** Appended the `.dark` class to the outermost container, locking all children (message bubbles, settings, text elements) in dark mode styles regardless of the main page theme.

---

## 📄 3. Redesigned Pages

1. **[Home.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/pages/Home.jsx):**
   - Cinematic hero trailer banner featuring a background loop video, custom volume toggle triggers, and description info.
   - Carousel cards sorted by categories, community poll containers, and a detailed site footer.
2. **[Watch.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/pages/Watch.jsx):**
   - Immersive theater layout centering the customized player.
   - Action pills (Likes/Dislikes, Add to Playlist, Share, Report) styled with frosted glass cards.
   - Sidebar related recommendations and an expandable video description panel.
3. **[Login.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/pages/Login.jsx) & [Register.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/pages/Register.jsx):**
   - Frosted glass cards backed by floating glowing backdrop spheres, interactive input focus rings, and custom files pickers.
4. **[Dashboard.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/pages/Dashboard.jsx) (Creator Studio):**
   - Features dynamic tab toggles ("My Uploads" table lists and "Analytics Charts").
   - Integrated **Recharts AreaCharts** displaying views history and monthly subscriber updates.
5. **[AdminPanel.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/pages/AdminPanel.jsx):**
   - Integrated **Recharts BarCharts** comparing user directories, public video files, and pending moderation flag tickets.
   - Added server diagnostics health metrics gauges (CPU, RAM, DB connection latencies).

---

## 🛠️ 4. Key Configuration & Troubleshooting

### Gemini AI Controller Compatibility
- **Model Specification:** The backend AI controller in [ai.controller.js](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/server/controllers/ai.controller.js) is locked to model `'gemini-2.5-flash'` to support modern credentials (`AQ.` API keys).
- **System Prompt Rules:** The system instructions direct the AI model to state its streaming scope before answering general knowledge queries.

### Media Routing & Cloudinary Fallbacks
- Components resolve relative asset paths using the `getMediaUrl` helper. It checks if URLs start with `http` (Cloudinary hosted assets) or maps them to the local uploads directory on the Node.js server.

### Local Development Ports
- **Frontend Vite Client:** Runs on `http://localhost:5173/`.
- **Backend Node Server:** Runs on `http://localhost:5000/`.

---

## 🚀 5. Next Development Tasks

If reopening this project for further updates, prioritize the following milestones:
- [x] **Subscriber Count Display Fix:** Fixed the singular formatting bug where channels with exactly `1 subscriber` displayed `1 view`. Restored the main subscriber metrics to the channel directory, channel profile pages, and Watch page, correctly rendering `1 subscriber` for single signups.
- [x] **Transparent Circle Play Button:** Redesigned the center play overlay button in [VideoPlayer.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/components/VideoPlayer.jsx) to be a transparent white circular button with a frosted glass backdrop filter (`backdrop-blur-md`).
- [x] **Related Recommendations Fallback:** Configured backend `getRelatedVideos` controller to automatically backfill sidebar recommendations with other published videos from the directory if related matches are empty.
- [x] **Removed Video Duration Badges:** Deleted duration badges from all video thumbnail components (grid, horizontal lists, and preview cards) to clean up layout cards and hide duration stamps.
- [x] **Removed Video Quality Badges:** Removed the quality/resolution badges (`1080p HD`, `4K UHD`, `4K`, `HD`) from all video card thumbnail overlays.
- [x] **Random Spotlight Hero Banner:** Configured the Home cinematic hero banner to load a random video from the site's database, reset choices on category toggles, and display a watch link button.
- [x] **Drag-to-Seek Player Seeker:** Implemented mouse-drag tracking inside [VideoPlayer.jsx](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/client/src/components/VideoPlayer.jsx) to enable dragging the player timeline seeker bar smoothly to any timestamp position.
- [x] **Concurrent Video Transitions:** Optimized transition latency by loading video details and recommendations concurrently (`Promise.all`), and adding smooth scroll-to-top viewport adjustments.
- [x] **Removed Continue Watching Prompt:** Completely disabled continue watching resume triggers and confirmation dialogs from the video player, resolving a subsequent `setHasRestoredTime` ReferenceError console crash.
- [x] **Fixed Skip Next Button:** Refactored the control bar skip button to stop event propagation (`e.stopPropagation()`), successfully navigating users to the next related video in the sidebar recommendations on click.
- [x] **Set Autoplay Disabled by Default:** Changed player `autoplay` default state to `false` to prevent automatic looping between the same two videos on completion.
- [x] **Randomized Next Video Selector:** Randomized the skip next video selection from the recommended sidebar videos list, preventing looping loops and allowing users to discover a variety of related content.
- [ ] **Profile Settings Overhaul:** Redesign the user profile management pages with premium layouts.
- [ ] **Socket.io Custom Handlers:** Optimize chat/comment notification events to broadcast real-time alerts.
- [ ] **Custom Category Management:** Add categories creation and tags editing directly inside the Admin workspace.
