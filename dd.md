# ViewFlow Premium: Comprehensive Test Cases & Functionality Matrix

This document defines the functional test matrix for all features, components, and fixes implemented in the **ViewFlow** Video Streaming Platform.

---

## 🔑 1. Authentication & Session Management

| Test ID | Function / Feature | Action / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **AUTH-01** | User Registration | Go to `/register`, upload a custom avatar file, enter details, and submit. | User profile is created in MongoDB; avatar is uploaded (via Cloudinary or fallback local upload). Redirects to `/login`. | **Pass** |
| **AUTH-02** | User Login | Go to `/login`, input credentials of seeded accounts (e.g. `admin` / `adminpassword123` or `cgihub` / `creatorpassword123`). | JWT cookie/token is successfully stored, and the user is redirected to the home page with an active session. | **Pass** |
| **AUTH-03** | Role-Based Access | Log in as a normal creator/user, then attempt to access `/admin`. | The system blocks access and redirects to Home or displays a permission denied warning (restricting access to Admin role). | **Pass** |
| **AUTH-04** | Session Logout | Click "Sign Out" in the user dropdown menu in the Navbar. | Clear authentication tokens/cookies, reset Auth Context, and redirect to login/home. | **Pass** |

---

## 🏠 2. Homepage & Spotlights

| Test ID | Function / Feature | Action / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **HOME-01** | Random Spotlight Hero | Load the Home page (`/`). | The main hero trailer banner dynamically loads a random video from the database as its featured banner, showing a Watch button. | **Pass** |
| **HOME-02** | Category Pill Filtering | Click different category pills (e.g. "Comedy", "Music", "Technology") in the pills bar. | The main video grid filters and updates with videos belonging to the selected category. Spotlight hero updates/resets. | **Pass** |
| **HOME-03** | Community Spotlight | Navigate to the "Community Corner" section in the homepage. | Polls are loaded. Option lists are displayed. Clicking an option records a vote and shows real-time percentage indicators. | **Pass** |
| **HOME-04** | Platform Footer Links | Scroll to the bottom of the homepage. | ViewFlow's custom footer is visible, containing styled link hubs for legal, platform directories, and developer info. | **Pass** |

---

## 🧭 3. Navigation & Sidebars

| Test ID | Function / Feature | Action / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **NAV-01** | Voice Search | Click the microphone icon in the navbar search bar. | Prompts permission for the microphone, initializes SpeechRecognition, and prints spoken phrases into the search input. | **Pass** |
| **NAV-02** | Discover Megamenu | Click the "Discover" menu trigger in the navbar. | Collapsible multi-column discover panel expands with active categorized links and trending feed options. | **Pass** |
| **NAV-03** | Dockable Sidebar | Toggle sidebar expand/collapse using the menu button. | The sidebar smoothly transitions between a full sliding drawer, an icon-only dock sidebar, and an overlay drawer on mobile. | **Pass** |
| **NAV-04** | Light Mode Contrast | Toggle theme button in navbar to change theme to Light mode. | Background transitions to `#F4F4F5` / `#FFFFFF`. All text content maps correctly to dark color `#09090B`, retaining high contrast readability. | **Pass** |

---

## 🎥 4. Video Card Previews & Player Controls

| Test ID | Function / Feature | Action / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **PLAY-01** | Hover Autoplay Preview | Move the mouse cursor over a video card thumbnail in the grid. | After a 600ms delay, the thumbnail switches to a looping muted video trailer. Moving the mouse away restores the image thumbnail. | **Pass** |
| **PLAY-02** | Removed Duration Stamps | Inspect video cards in grids and recommended rows. | Duration badges are completely removed from all thumbnail displays for a clean minimalist look. | **Pass** |
| **PLAY-03** | Removed Quality Badges | Inspect video card overlays. | No quality tags (`1080p HD`, `4K UHD`) are displayed on thumbnails. | **Pass** |
| **PLAY-04** | Transparent Play Button | Pause the custom video player in `/watch/:id`. | The center play overlay renders as a transparent white circular button with a frosted glass backdrop filter (`backdrop-blur-md`). | **Pass** |
| **PLAY-05** | Timeline Drag-to-Seek | Click and hold the mouse over the video progress seek bar, drag it left/right, and release. | The player progress seek tracker follows the mouse position fluidly and jumps to the exact seek timestamp on mouse release. | **Pass** |
| **PLAY-06** | Keyboard Shortcuts | Press `Space` to play/pause, `M` to mute/unmute, or `F` to enter/exit fullscreen. | Player responds instantly. A helper shortcut overlay screen is shown when activating shortcut options. | **Pass** |
| **PLAY-07** | Randomized Skip-Next | Click the "Skip Next" button on the custom video control bar. | Stops event propagation, picks a randomized video from the recommended sidebar list, and navigates to it without loops. | **Pass** |
| **PLAY-08** | Disabled Autoplay | Let a video play until completion (100% progress). | The video ends and pauses. Autoplay next is disabled by default to prevent loops between identical videos. | **Pass** |

---

## 🎬 5. Watch Page & Engagement

| Test ID | Function / Feature | Action / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **WATCH-01** | Concurrency Load | Click a video to open `/watch/:id`. | Video details, comments, and recommendations are loaded concurrently using `Promise.all` for minimal latency. Scroll resets to top. | **Pass** |
| **WATCH-02** | Likes / Dislikes | Click the Like or Dislike buttons below the player. | The counter updates in real time. Active states toggle active background gradients. | **Pass** |
| **WATCH-03** | Playlist Management | Click the "Add to Playlist" action pill button. | Toggles a modal listing custom playlists. Selecting a playlist adds the video; option is provided to create a new playlist. | **Pass** |
| **WATCH-04** | Related Recommendations | View the sidebar list in `/watch/:id`. | Shows related videos. If the backend return list is empty, a fallback controller backfills recommended slots with general database uploads. | **Pass** |
| **WATCH-05** | Subscriber Count Format | Inspect channel sub text on Watch page or Channel profile. | Channels with exactly 1 subscriber display `1 subscriber` instead of incorrectly formatting to `1 view`. | **Pass** |
| **WATCH-06** | Comment Section | Post a comment under the video. | Comment is added instantly to the feed, and the video owner/admins are shown a trash delete trigger. | **Pass** |
| **WATCH-07** | Flag / Report System | Click "Report" action pill under the video or comments. | Submits a moderation ticket to the database flag logs (visible inside the Admin moderation dashboard). | **Pass** |

---

## 🤖 6. AI Assistant Panel

| Test ID | Function / Feature | Action / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **AI-01** | Permanent Dark Mode | Toggle the main platform theme between Light and Dark mode. | The AI Assistant side panel container and its child components (bubbles, inputs, settings) remain styled under dark mode styles. | **Pass** |
| **AI-02** | Controller Model Check | Ask a question inside the AI chat input. | The backend invokes the `gemini-2.5-flash` model, ensuring compatibility with `AQ.` API keys, and responses are streamed smoothly. | **Pass** |
| **AI-03** | Scope Restriction Rules | Ask the AI general knowledge questions (e.g. "What is the capital of France?"). | The AI agent first declares its primary video streaming scope before providing brief answers, adhering to system prompts. | **Pass** |

---

## 📊 7. Creator Studio Dashboard

| Test ID | Function / Feature | Action / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **DASH-01** | Studio Tab Switcher | Log in as a creator, go to `/dashboard`, and switch tabs between Uploads, Analytics, and Playlists. | Tabs render content smoothly. Uploads table displays status, playlists tab shows custom lists, and charts display stats. | **Pass** |
| **DASH-02** | Recharts AreaCharts | Click "Analytics" tab on the dashboard. | Displays a premium curved Recharts AreaChart graphing weekly view metrics and monthly subscriber trajectories. | **Pass** |
| **DASH-03** | Upload Custom Media | Click "Upload Video" button, select video files/thumbnails, fill title/tags/category, and submit. | Shows upload progress loader, uploads assets, registers schema entries, and appends to the My Uploads table. | **Pass** |

---

## 🛡️ 8. Admin Moderation Panel

| Test ID | Function / Feature | Action / Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **ADMIN-01** | Moderation Dashboard | Log in as admin and navigate to `/admin`. | Renders the primary dashboard page showing system health diagnostics gauges (CPU, RAM, DB latency) and metrics summary. | **Pass** |
| **ADMIN-02** | Recharts BarCharts | Inspect Admin panel metrics charts. | Recharts BarCharts display comparison metrics for total user directories, registered video files, and pending flag tickets. | **Pass** |
| **ADMIN-03** | Ticket Actions | Go to "Moderation Flags" tab, select a ticket, and click Dismiss or Delete. | Performs database operation to delete the reported item or dismiss the report ticket, updating the list immediately. | **Pass** |
