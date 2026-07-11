# REST API Documentation

- **Base URL**: `http://localhost:5000/api/v1`
- **Headers**: JWT authenticated routes require `Authorization: Bearer <token>` header or `accessToken` cookie.

---

## 👤 Users Routing (`/api/v1/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Public | Register new channel. Accepts Multipart Form (avatar, banner, fullName, username, email, password, bio). |
| **POST** | `/login` | Public | Authenticate user. Payload: `{ emailOrUsername, password }`. Returns JWT token. |
| **GET** | `/me` | Private | Retrieve logged-in user profile. |
| **PUT** | `/profile` | Private | Update full name, bio, or email details. |
| **PATCH**| `/avatar` | Private | Update logo avatar. Accepts Multipart Form `avatar` file. |
| **PATCH**| `/banner` | Private | Update banner image. Accepts Multipart Form `banner` file. |
| **PATCH**| `/change-password` | Private | Change password. Payload: `{ oldPassword, newPassword }`. |
| **GET** | `/c/:username` | Public/Opt | Fetch channel profile details, subscriber counts, total videos. |
| **GET** | `/subscriptions`| Private | List channels the current user is subscribed to. |

---

## 📹 Videos Routing (`/api/v1/videos`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Public/Opt | Search & filter videos. Queries: `page`, `limit`, `query`, `category`, `userId`, `sortBy` (views/likes/createdAt). |
| **POST** | `/upload` | Private | Upload new video. Accepts Multipart Form (videoFile, thumbnail, title, description, category, tags, isPublished). |
| **GET** | `/:id` | Public/Opt | Fetch details of single video. Increments views. Checks likes/subscription reactions. |
| **PUT** | `/:id` | Private | Edit video metadata or update thumbnail file. |
| **DELETE**| `/:id` | Private | Delete video from storage (Cloudinary) and cleanup comments/likes. |
| **GET** | `/feed/trending`| Public | Fetch trending videos based on popularity and date. |
| **GET** | `/feed/recommended`| Public/Opt | Fetch recommendations. Uses watch history overlap or popular fallbacks. |
| **GET** | `/:id/related` | Public | Fetch related videos matching category or tags. |
| **GET** | `/history/watch`| Private | Retrieve chronological user watch history list. |
| **DELETE**| `/history/watch`| Private | Clear all items from user watch history list. |
| **DELETE**| `/history/watch/:videoId`| Private | Remove a specific video from user watch history list. |


---

## 💬 Comments Routing (`/api/v1/comments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/:videoId` | Private | Add comment or reply. Payload: `{ content, parentCommentId }`. |
| **GET** | `/:videoId` | Public/Opt | Get paginated root comments of a video. Queries: `page`, `limit`. |
| **GET** | `/replies/:commentId` | Public | Fetch all nested replies of a comment chronologically. |
| **PUT** | `/:id` | Private | Edit comment content. |
| **DELETE**| `/:id` | Private | Delete comment and recursively remove nested replies. |

---

## 👍 Likes Routing (`/api/v1/likes`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/toggle/v/:videoId`| Private | Toggle like reaction on a video. Clears dislike if present. |
| **POST** | `/toggle/d/:videoId`| Private | Toggle dislike reaction on a video. Clears like if present. |
| **POST** | `/toggle/c/:commentId`| Private | Toggle like reaction on a comment. |
| **POST** | `/toggle/dc/:commentId`| Private | Toggle dislike reaction on a comment. |
| **GET** | `/videos` | Private | Retrieve list of all videos liked by the user. |

---

## 🔔 Notifications Routing (`/api/v1/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Private | Retrieve 50 recent notifications. |
| **PATCH**| `/:id/read` | Private | Mark notification as read. |
| **PATCH**| `/read-all` | Private | Mark all unread notifications as read. |

---

## 📂 Playlists Routing (`/api/v1/playlists`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Private | Create playlist. Payload: `{ name, description, isPrivate }`. |
| **GET** | `/:id` | Public/Opt | Fetch playlist details and videos. Checks private permissions. |
| **PUT** | `/:id` | Private | Update playlist details. |
| **DELETE**| `/:id` | Private | Delete playlist. |
| **PATCH**| `/:id/add/:videoId`| Private | Add video to playlist. |
| **PATCH**| `/:id/remove/:videoId`| Private | Remove video from playlist. |
| **GET** | `/user/:userId`| Public/Opt | Get public playlists owned by a user (or private ones if owner). |

---

## ⚙️ Admin Moderation (`/api/v1/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/stats` | Admin | Get metrics: users banned, draft videos, pending tickets. |
| **GET** | `/users` | Admin | Get paginated user directory. Queries: `query` (search users). |
| **PATCH**| `/users/:id/ban`| Admin | Toggle ban/block status for a channel. |
| **GET** | `/reports` | Admin | Retrieve moderation ticket logs. Query: `status` (pending/resolved). |
| **PATCH**| `/reports/:id/status`| Admin | Update ticket status: `resolved` / `dismissed`. |
| **POST** | `/reports` | Private | Submit a report ticket on a video, comment or channel. |
