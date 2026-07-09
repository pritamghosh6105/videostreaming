# Production Deployment Guide

This guide details steps to deploy the Video Streaming Platform in production.

---

## 1. 🗄️ Database Setup (MongoDB Atlas)

1. Sign up/Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **Shared Cluster** (Free tier).
3. Under **Network Access**, add IP address `0.0.0.0/0` to allow connections from deployment platforms like Render.
4. Under **Database Access**, create a user with read/write privileges.
5. Click **Connect** -> **Connect your application**, and copy the connection string. Replace `<password>` with your user's password.
   - Example: `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/videostreaming?retryWrites=true&w=majority`

---

## 2. ☁️ Media Storage Setup (Cloudinary)

1. Sign up for a free account on [Cloudinary](https://cloudinary.com).
2. From the **Dashboard** page, copy your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. These variables must be configured on your backend to enable production uploading. If they are absent, the application will fallback to local storage (which doesn't persist across Render restarts).

---

## 3. 🖥️ Backend Deployment (Render)

1. Create a free account on [Render](https://render.com).
2. Click **New +** -> **Web Service** and link your GitHub/GitLab repository.
3. Configure the service settings:
   - **Name**: `viewflow-backend`
   - **Runtime**: `Node`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Expand the **Advanced** section and add **Environment Variables**:
   - `PORT`: `5000`
   - `MONGODB_URI`: *[Your MongoDB connection string]*
   - `JWT_SECRET`: *[A secure random string]*
   - `CLOUDINARY_CLOUD_NAME`: *[Cloud Name]*
   - `CLOUDINARY_API_KEY`: *[API Key]*
   - `CLOUDINARY_API_SECRET`: *[API Secret]*
   - `FRONTEND_URL`: *[Your Vercel deployment URL e.g. https://viewflow.vercel.app]*
   - `NODE_ENV`: `production`
5. Click **Deploy Web Service**. Once deployed, copy your service URL (e.g. `https://viewflow-backend.onrender.com`).

---

## 4. 🌐 Frontend Deployment (Vercel / Netlify)

1. Create an account on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Click **Add New** -> **Project** and import your Git repository.
3. Configure project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL`: *[Your Render backend URL with suffix /api/v1]*
     - Example: `https://viewflow-backend.onrender.com/api/v1`
5. Click **Deploy**. Vercel/Netlify will build and assign a production URL to your application.
6. Remember to copy this Vercel/Netlify URL and update the `FRONTEND_URL` environment variable in Render backend settings to allow CORS requests.

> [!NOTE]
> We have pre-configured `client/vercel.json` and `client/public/_redirects` in this repository. This ensures that client-side SPA routing (React Router) works seamlessly upon deployment and prevents `404 Not Found` errors when refreshing nested paths like `/watch/:id` or `/c/:username`.

