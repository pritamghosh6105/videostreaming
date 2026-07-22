# ViewFlow - Full-Stack Video Streaming Platform

ViewFlow is a full-stack, production-ready Video Streaming Platform. It features user authentication, media upload, streaming, watch history, subscriptions, comments, likes, custom playlists, creators dashboards, custom video player with Fisher-Yates Shuffle Queue autoplay, and admin moderation utilities.

---

## 🚀 Tech Stack
- **Frontend**: React.js + Vite, Tailwind CSS, Lucide Icons, Axios, HTML5 Custom Video Player, Context APIs.
- **Backend**: Node.js, Express.js (MVC architecture), Mongoose, JWT auth, Multer, Morgan logger, Express-rate-limit.
- **Media Hosting**: Cloudinary (videos & images) with local file storage fallbacks for instant development.
- **Database**: MongoDB (Atlas) database management.

---

## ✨ Key Features & Enhancements
- **Fisher-Yates Shuffle Queue Autoplay**: Seamlessly plays next candidate videos without repeating any video until all candidate recommendations are played.
- **Previous Video Navigation & Session Stack**: `SkipBack` control and keyboard shortcut (`P`) to navigate back through exact watched history.
- **Optimized Video Player**: Pre-buffering (`preload="auto"`), instant source switching, keyboard shortcuts (`Space`, `M`, `F`, `P`, `N`), playback speed control, and custom controls.
- **High-Performance Backend**: Parallelized DB read operations with `Promise.all` and asynchronous non-blocking view count & watch history updates.

---

## 📂 Folder Structure

```text
├── client/                     # Frontend Vite-React App
│   ├── src/
│   │   ├── components/         # Reusable Components (Navbar, Player, VideoCard, etc.)
│   │   ├── context/            # Auth, Theme, Toast, Notification Contexts
│   │   ├── pages/              # Pages (Home, Watch, Channel, Dashboard, etc.)
│   │   ├── services/           # API config (Axios client)
│   │   ├── App.jsx             # Main Router structure
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Custom styles & design tokens
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Backend API Server
│   ├── config/                 # DB & Cloudinary initializers
│   ├── controllers/            # API controller business logic
│   ├── middlewares/            # Token verify, Multer parsing, Error handling
│   ├── models/                 # Mongoose schemas (Users, Videos, Comments, etc.)
│   ├── routes/                 # Express REST endpoint maps
│   ├── scripts/                # Database seeder scripts
│   ├── .env.example            # Environment variables template
│   ├── app.js                  # App route mounting and middlewares
│   └── index.js                # Server entry point
```

---

## ⚡ Quick Start (Local Development)

### 1. Database Setup
Ensure you have a MongoDB instance running locally (typically `mongodb://127.0.0.1:27017/videostreaming`) or a MongoDB Atlas connection URI string.

### 2. Configure Environment Variables
Navigate to the `server` directory and configure `.env`:
```bash
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_token_signature
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```
> [!NOTE]
> If Cloudinary credentials are not configured or are left as placeholders, the server automatically falls back to storing uploaded videos and thumbnails locally in `server/public/uploads`!

### 3. Install & Seed Sample Data
Inside `server/` directory:
```bash
# Install dependencies
npm install

# Seed Categories, Admin and Sample Videos
npm run seed

# Start server in development mode
npm run dev
```

### 4. Run Frontend Client
Open a separate terminal window at the root:
```bash
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛡️ Default Seed Credentials
Running `npm run seed` sets up these testing credentials:
- **Admin Channel**:
  - **Username**: `admin`
  - **Password**: `adminpassword123`
- **Creator Channel**:
  - **Username**: `cgihub`
  - **Password**: `creatorpassword123`

---

## 📚 API & Deployment Documentation
- Detailed API endpoints are documented in [API.md](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/API.md).
- Production deployment instructions are in [deployment_guide.md](file:///e:/drive/Pritam/OneDrive/Desktop/video%20streaming/deployment_guide.md).
