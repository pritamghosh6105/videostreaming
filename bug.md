# ViewFlow — Bug Report

Site: `https://videostreaming-swart.vercel.app/`  
Stack: React + Vite (frontend on Vercel), Express + MongoDB (API on Render at `videostreaming-9ey9.onrender.com`)

## Critical bugs

### B1. Document `<title>` is "client" on every page
The `<title>` tag in `index.html` was never updated from the Vite default. Every page — `/`, `/watch/:id`, `/channels`, `/login`, `/register`, `/feed/trending`, `/c/:id`, 404 — shows `client` as the tab title. This also breaks SEO and browser history.

### B2. Search input does nothing
Typing in the header search box and pressing **Enter** (or clicking the magnifier button) keeps the user on the same page; no navigation, no inline results, no debounced live search. The header search form has no `onSubmit` handler and the magnifier is just a styled button.

Backend confirms it: `GET /api/v1/search?q=test` returns **404** — the search endpoint doesn't exist on the API.

### B3. Voice-search button is a dead element
The microphone icon in the header (`button[title="Voice Search"]`) has no `onClick`. Clicking it does nothing — no permission prompt, no modal, no error. Dead UI.

### B4. 404 / unknown-route page is empty
Visiting any non-existent path (e.g. `/nonexistent-page-xyz`) renders the header + sidebar + footer with **a completely blank main area**. No "404 — Page not found" message, no link back home, no error UI. Users are stranded on a black canvas.

### B5. Like / Subscribe / Share buttons silently fail for guests
On `/watch/:id`:
- **Like** (`0`): click does nothing, count stays at 0, no toast, no redirect.
- **Dislike** (`0`): same.
- **Share**: click does nothing — no share sheet, no copy-link, no feedback.
- **Subscribe**: click does nothing — no "please sign in" prompt, no modal, no state change.

Comment section correctly says "Please login to leave comments" but every other gated action is a silent no-op.

### B6. API exposes raw internal data on every video object
`GET /api/v1/videos`, `…/feed/trending`, and `…/videos/:id` return the raw Mongoose document. Visible to any client:

```json
{
  "_id": "6a51064fb8a1e2b272e5223e",
  "videoFile": "/uploads/videoFile-…mp4",
  "videoPublicId": "youtube_clone/wvelhjycd0bf0yavarky",
  "thumbnailPublicId": "youtube_clone/…",
  "category": "6a354755db25074a33013902",
  "__v": 0
}
```
Issues: MongoDB `__v` and `_id` leak; Cloudinary `*PublicId` leak (lets anyone mutate the CDN assets if they ever get a signed-URL feature); `category` is a raw ObjectId, not a name.

### B7. Frontend renders the raw `category` ObjectId as visible text
Because of B6, the homepage / watch-page sidebars show strings like:
```
Pritam Ghosh
ARMY
6A354755DB25074A33013902
```
That hex string is the category ID, not a category name. Same string repeats under every video card on `/`, `/feed/trending`, and `/watch/:id` — extremely ugly, also a UX/SEO red flag.

### B8. Footer "Legal" links are not links
"Terms & Conditions", "Privacy Charter", "Cookie Settings" in the footer are `<span>` elements with hover styles — no `href`, no `onClick`. They look clickable but do nothing. On a real launch this is also a legal/compliance risk (GDPR/cookie consent).

## Major bugs

### B9. Video player container doesn't respect portrait aspect ratio
`/watch/:id` shows videos in a fixed-aspect (landscape ~16:9) frame. Vertical / portrait videos (e.g. the `H` clip, source 720×1280) get letterboxed with huge black bars on the left and right — about half the player is dead space. The `<video>` element should be allowed to render at its native ratio (e.g. `aspect-ratio: 9/16` or `object-fit: contain` inside a max-height container).

### B10. `duration` field is always 0 in the API
Every video on `/feed/trending` and `/videos/:id` returns `"duration": 0`. The player falls back to reading the actual `video.duration` from the file at runtime (you see e.g. `00:00 / 00:16`), but the value is still wrong on the listing card, in the metadata, and in any DB-backed "duration filter" / sort. A few of these clips are clearly longer than 0 s.

### B11. Local `/uploads/...` assets are loaded cross-origin from a slow Render host
The hero background video and many thumbnails are served from `https://videostreaming-9ey9.onrender.com/uploads/…` while the page itself is on Vercel. That CDN/domain split:
- Slows the largest contentful paint (hero video is on a cold free-tier dyno).
- Will break the moment the Render service idles / sleeps — Render's free plan sleeps after 15 min, and the first request can take 30–60 s. There's no warming.
- Mixed with Cloudinary URLs for newer uploads — content is split across two origins with no apparent reason.

### B12. No visual "active" state on category chips
Clicking `ALL`, `COMEDY`, `EDUCATION`, `…` on the home page changes the title to "Curated Releases: Comedy" but the chip itself has no visual selected state — there's no DOM element with `aria-pressed="true"`, no `.active` class, and inspecting the buttons shows none have a distinguishing background. Users can't tell which filter is active.

### B13. Inputs are missing `name`, `id`, and `<label for>` attributes
- Login form: email + password inputs have no `name`, no `id`, no associated `<label>`. `autofill` and password-manager support are broken.
- Register form: same problem on full name, email, username, password, bio, avatar, banner.
- Search input has no `name` either, so even native form submission is degraded.

### B14. Player thumbnail includes a watermark ("Zilli")
The hero carousel / first-frame image used in the player is a stock clip that still has a "Zilli" watermark burned in. Visible on `/` and behind the play button on `/watch/6a51064fb8a1e2b272e5223e`.

### B15. AI assistant context is wrong for unrated users
Clicking the floating AI button on a watch page opens the chat with "Context: Active Video 📺 Watching: H" and answers questions about the video. That's good, but:
- The assistant was triggered for unauthenticated users and for any random video, no rate-limiting was observed.
- The chat provides no "Sign in to save history" hint, and refreshing the page wipes the conversation with no persistence option.

## Minor / code-quality

### B16. API error envelope leaks an unused `stack` field
`{"success":false,"message":"Video not found","stack":null}` — `stack` is `null` here but the field is always emitted, which is a smell (looks like dev-mode error middleware is wired into the prod response). Same for `Invalid video ID format`.

### B17. Inconsistent error response shapes
- `GET /api/v1/videos/invalid` → JSON: `{"success":false,"message":"Invalid video ID format","stack":null}` (400).
- `GET /api/v1/videos/000000000000000000000000` → JSON 404.
- `GET /api/v1/channels/000000000000000000000000` → **HTML** "Cannot GET /api/v1/channels/…" (404 from Express default). The `/api/v1/channels/:id` route doesn't exist at all, but the frontend links to `/c/:username` and the API would need it for the channel page. Inconsistency between JSON and HTML error pages also breaks any non-React client.

### B18. API accepts negative / garbage limit and page params
`/feed/trending?limit=-1` returns `200` and the full list. `/videos?page=-1&limit=8` and `?page=abc&limit=8` were not validated — risk of bad queries hitting the DB.

### B19. Sidebar duplicated on home and watch pages
On `/watch/:id` the left-hand sidebar (Home / Channels / Trending) is rendered inside the main flex container, pushing the video and "Related Videos" sidebar into a very tight column. On a 1280-px screen the video player is only ~770 px wide. The "Related Videos" sidebar is then forced below the player on narrower screens. Layout would be cleaner if the left nav lived in a fixed rail and the watch page had its own two-column layout (player + suggestions).

### B20. Watch-page related-videos cards show the channel ID underneath the title
See B7. Each related video card shows:
```
Pritam Ghosh
ARMY
6A354755DB25074A33013902
```
That third line is the category ObjectId, not metadata. The card component is rendering a field it shouldn't.

### B21. Owner "Site Administrator" channel has 0 subscribers and 0 videos but is listed in the directory
A demo / seed channel with no content still appears in the public `/channels` page. Either hide empty channels by default or surface a "no uploads yet" message that's styled like the placeholder for the other empty channels (CGI Animators Hub, Daily Vlogger, etc. all show the same).

### B22. Empty channel pages render the same "This channel hasn't uploaded any videos yet" placeholder
Several channels (CGI Animators Hub, Daily Vlogger, Pritam Ghosh, dftttsd) all share the empty-state UI, but at least one of them ("Pritam Ghosh" — the most-viewed video on the site is by this channel) clearly *does* have videos. So either the channel resolution is wrong or the videos are mis-attributed. Worth verifying that `/c/:username` resolves to the right channel.

### B23. `/admin` route silently redirects to `/`
No 404, no "forbidden" page — the URL just becomes `/`. Not a security issue (nothing's exposed) but it's a poor UX for someone who types it in or follows a stale bookmark.

### B24. Hero video plays without sound toggle, no captions, no `prefers-reduced-motion` respect
The home-page hero has an autoplaying background video. There's no:
- Mute/unmute control visible (the small `🔇` button only appears in the play page).
- `prefers-reduced-motion: reduce` media query to disable autoplay for users who've opted out.
- `aria-hidden` / `aria-label` on the decorative video.

### B25. Page-title and meta description are missing/empty for SEO
- No `<meta name="description">`.
- No `<meta property="og:title">`, `og:description`, `og:image`, `twitter:card`, etc.
- `<title>client</title>` (B1) means the home page won't rank for "ViewFlow video streaming" and won't preview nicely in Slack/Twitter.

## What works

- Hero carousel, trending feed, related videos, channel page, and category filter all render without console errors and the network panel shows no failed requests during normal browsing.
- Video playback works — autoplay is correctly blocked until user interaction, `<video>` element reports `readyState: 4`, `error: null`, plays fine when the center play button is clicked.
- The ViewAI chat (floating bottom-right) is the most polished feature — it loads in <1 s, accepts a message, sends it to the Gemini backend, and returns a coherent answer that mentions the current video's title, description, and owner.
- Routing (React Router) is stable: `/watch/:id`, `/c/:username`, `/channels`, `/feed/trending`, `/login`, `/register` all resolve and render the right view.
- All images load (no broken images, no 404s in the network log).

## Suggested fix priority

1. B1, B4, B2, B3, B5 (visible-to-every-user breakage)
2. B6, B7, B20 (data leak visible on the home page)
3. B9, B12, B19 (player + layout)
4. B10, B11, B14 (data integrity / asset hygiene)
5. Everything in the "minor" section

---

# Round 2 (re-test) — 2026-07-11

Account used: `testuser_bug_hunt` / `Test User` / `yellowculture792@mail.bu.app` (registered during this round via `/register`).

## Fixes confirmed

- **B1 FIXED** — `<title>` is now route-specific: `Cinematic Streams | ViewFlow`, `Gan | ViewFlow`, `Trending Cinematic Video Releases | ViewFlow`, `Create Channel | ViewFlow`, `Creator Dashboard | ViewFlow`, `404 Page Not Found | ViewFlow`, `Upload Cinematic Video | ViewFlow`.
- **B4 FIXED** — 404 page now shows "LOST IN THE STREAM" headline, an animated radar icon, and "GO BACK" / "RETURN HOME" buttons.
- **B6 PARTIALLY FIXED** — `category` is now an object (`{_id, name, slug}`) instead of a raw ObjectId. Still leaks MongoDB `_id` and `__v` on every video and `createdAt`/`updatedAt` on the category object.
- **B7 FIXED** — category is rendered as a name (`COMEDY`, `MUSIC`, `ENTERTAINMENT`, etc.), not the ObjectId hex.
- **B9 FIXED** — `<video>` now uses `object-contain` and an inline `style="aspect-ratio: 0.562061 / 1"` so portrait content is no longer letterboxed.
- **B10 FIXED** — `duration` is now a real number (`12`, `17` seconds).
- **B12 FIXED** — active category chip has `aria-pressed="true"` and a distinct background ring.
- **B13 FIXED** — login, register, and search inputs all have `name` and `id` attributes and visible `<label>`s.

## New / remaining bugs

### B26. Search API exists but the header search input is still dead
`GET /api/v1/search?q=` now returns `200` with `{videos, channels}`, so the backend was added — but the header `<input>` still has no `onSubmit`, no debounced live-search, and pressing Enter / clicking the magnifier keeps the user on the same page. The fix is one short-circuit away from being useful. (B2 reopened, with API fix noted.)

### B27. Comedy category filter shows "No media entries found in this category"
On `/`, clicking the COMEDY chip reloads with the correct title `Curated Releases: Comedy` but renders "No media entries found in this category." However, the same `Comedy` category **does** have videos — the watch page for one of them shows a `COMEDY` tag. The home filter is querying the wrong endpoint or using a different ID for the same category.

### B28. Watch page silently redirects to home on Like / Dislike click
On `/watch/:id`, the Like and Dislike buttons are `<button type="submit">`. Clicking either navigates the browser away from the watch page (back to `/`), losing the user's play position. They should be `type="button"` and call the like/dislike endpoint via JS, with a debounce.

### B29. Authenticated user is silently redirected from `/login` and `/register` back to `/` with no message
Once logged in, navigating to `/login` or `/register` just becomes `/` — no "you're already signed in" prompt and no "go to your dashboard" CTA. Compare to standard practice (e.g. YouTube).

### B30. Login error message is awkward: "Please enter credentials and password"
On `/login`, when fields are blank, the toast says "Please enter credentials and password" — "credentials" already means email + password, so the word "and password" is redundant and confusing. Should be e.g. "Please enter your email and password."

### B31. Missing `GET /api/v1/users/current-user` (and inconsistent user endpoints)
- `GET /api/v1/users/me` → 200 (works).
- `GET /api/v1/users/current-user` → 404 HTML ("Cannot GET …"). Likely a typo somewhere in the codebase.
- `GET /api/v1/users/:username` → 404 HTML.
The only user endpoint that exists is `/users/me`. Resolving a user by username or fetching a "current user" canonical name both 404.

### B32. Channel routes are all 404 HTML
- `GET /api/v1/channels/me` → 404 HTML.
- `PATCH /api/v1/channels/me` → 404 HTML (so a user cannot update their own channel from any UI, including "Edit Profile" — see B41).
- `GET /api/v1/channels/:username` → 404 HTML.
- `GET /api/v1/channels` → 404 HTML.
The Channels sidebar link works (it points at `/channels` which renders a page), but every channel-by-username fetch is silently 404. The channel page must be calling a different endpoint, but most calls into the channels resource return Express's default HTML 404, which is a CORS-incompatible response for any non-browser client.

### B33. `POST /api/v1/videos` is 404 — the upload flow has no backend endpoint
The `/upload` page renders a full form (Title, Description, Category, Visibility, Tags, file pickers), and `POST https://videostreaming-9ey9.onrender.com/api/v1/videos` returns 404 HTML. Clicking **Publish Content** will POST against a non-existent route — silent failure, no video is created, no error is shown to the user.

### B34. Page titles don't reflect category filters
Clicking COMEDY updates the heading to "Curated Releases: Comedy" but `<title>` is still `Cinematic Streams | ViewFlow` (B25 territory). Users browsing filtered views can't distinguish tabs in the browser.

### B35. Home page silently breaks to a fully empty state when the API is rate-limited
Hitting the IP-level rate limit (B36) returns 429 from the homepage fetch. The page then renders header + sidebar + footer + "ALL" chip and **nothing else** — no hero, no trending, no community posts, no recommended. No error banner, no retry button. Indistinguishable from a brand-new empty site.

### B36. Aggressive, opaque, IP-level rate limit on the Render free tier
`429 Too many requests from this IP, please try again after 15 minutes` after a normal session of API probing. No `Retry-After` header, no `X-RateLimit-Remaining` / `X-RateLimit-Reset`, no way to know when it lifts. On a free-tier Render dyno, the IP is shared across many users — meaning one user's browsing session can effectively lock out everyone on that node for 15 minutes. This will be a production incident in any non-trivial traffic window.

### B37. Deleted/missing video `/watch/<bad-id>` silently redirects to `/` instead of showing "video not found"
Visiting `/watch/000000000000000000000000` (deleted ID) or any other unknown id redirects to `/` and serves the home page. The 404 component (B4, now fixed) is only reached when the *route* doesn't match — but a watch URL with a *valid shape but invalid id* silently 404s to home. Should use the same "LOST IN THE STREAM" 404 UI for missing videos.

### B38. "Save" button on watch page is wired to nothing
On `/watch/:id`, clicking **Save** does nothing visible: no toast, no modal, no library list update, no auth gate for guests, no error. The button has no handler, so the user can't tell if a video was saved to a watch-later list, a playlist, or a favourites collection.

### B39. `/liked-videos` route silently redirects to `/` for authenticated users
The sidebar Library → Liked Videos link points at `/liked-videos`. Even when logged in, navigating there lands on the home page. The route appears to be unwired or the component always redirects when its data fetch is empty.

### B40. `/history/watch` and `/subscriptions` routes silently redirect to `/` for authenticated users
Same as B39 — the sidebar links exist, the routes exist on the client, but a logged-in user is redirected home on click. Watch history and subscriptions are the only ways to come back to content on a video site, and both are dead.

### B41. Edit Profile button on the channel page is a dead element
On `/c/:username` (own channel), the **Edit Profile** button is a plain `<button>` with no `onClick`. Clicking does nothing — no modal, no navigation, no toast. Compare to the **Manage Content** link next to it, which correctly goes to `/dashboard`.

### B42. Channel-page Community tab post buttons are dead
On `/c/:username` (own channel) → **Community** tab, three buttons appear: **Text Post**, **Photo Post**, **Create Poll**. None open a modal, none navigate, none do anything. Channel owners have no way to create a community post from the UI.

### B43. Dashboard `My Uploads` and `Analytics Charts` tab buttons are `type="submit"` outside a form
On `/dashboard`, **My Uploads** and **Analytics Charts** are `<button type="submit">` with no parent `<form>`. They don't navigate and don't swap the panel content. (Compare to the **Videos / Playlists / Community / About** tabs on the channel page, which work as expected.) Result: a creator can only see "MANAGER: VIDEOS (0)" with no way to see analytics or filter uploads.

### B44. Floating `AI` button in the footer is `type="submit"` and a duplicate of the proper ViewAI widget
The footer has a floating `AI` button that's `type="submit"` with no form parent and no onClick. It doesn't open the ViewAI chat; only the lower-right ViewAI widget does. The footer button looks like a quick action and is misleading.

### B45. Voice-search button (B3) is still dead
The microphone button in the header still has no `onClick`. No permission prompt, no modal, no error.

### B46. Watch-page comment system is broken end-to-end
- **UI**: typing in the "Add a public comment…" textarea and clicking **Comment** does nothing. The text remains in the textarea, the count stays at "0 Comments", no toast, no error.
- **Network**: the click fires no `fetch` / XHR — confirmed by network event capture.
- **API**: `POST /api/v1/comments/:videoId` works and returns `201` with the new comment when called directly. The frontend is not calling it.
- The only way to add a comment to a video is to call the API manually with a token. End-user comment posting is 100% non-functional.

### B47. The `<video>` element loads without `preload="metadata"` on the home hero, wasting bandwidth
Hero/carousel video files begin downloading on the home page even when the user has not expressed any intent to play them. Suggest `preload="none"` for the hero and `preload="metadata"` for thumbnails on the home page.

### B48. `PATCH /api/v1/channels/me` and `GET /api/v1/channels/me` are 404 — no way to update a channel from the UI
Combined with B41 (Edit Profile button is a dead element) and B33 (no upload endpoint), **a registered user cannot upload a video, edit their channel, or post in a community tab.** The creator flow is blocked end-to-end:
- `Edit Profile` → no handler.
- `Manage Content` → `/dashboard` renders but `My Uploads` / `Analytics Charts` tabs don't work (B43).
- `Upload Video` → `/upload` renders a form but the `POST /api/v1/videos` endpoint is 404 (B33).
- Community `Text Post` / `Photo Post` / `Create Poll` → no handlers (B42).

### B49. Login page exposes no "forgot password" or "resend verification" path
There's only a "New to ViewFlow? Create account" link. No way to recover a forgotten password and no way to re-send the verification email (assuming email verification exists server-side; **the registration flow does not appear to send a verification email at all** — the test user was registered successfully but `yellowculture792@mail.bu.app` never received a message during the test, suggesting the flow is either intentionally skipped or broken).

### B50. `ObjectId` and `__v` still leak on every video object (B6 follow-up)
After the round-1 partial fix, the API still returns:
```json
{
  "_id": "6a5212e69ea46c2e66e6feb2",
  "videoFile": "…",
  "videoPublicId": "youtube_clone/…",
  "thumbnailPublicId": "youtube_clone/…",
  "__v": 0,
  "category": { "_id": "6a354755db25074a33013902", "name": "Comedy", "slug": "comedy", "createdAt": "…", "updatedAt": "…", "__v": 0 },
  "owner": { "_id": "6a4f9b…", "username": "…", "fullName": "…", "avatar": "…", "createdAt": "…", "updatedAt": "…", "__v": 0 }
}
```
The MongoDB `_id` and `__v` should be stripped at the serializer, `*PublicId` should not be sent to clients, and `category` / `owner` should expose `id` instead of `_id`.

## Round-2 re-test: previously reported minor bugs

- **B14 (Zilli watermark)**: not re-investigated in this round (player tests focused on aspect ratio and controls).
- **B15 (AI context)**: ViewAI widget still loads fast and mentions the active video. **Still missing**: rate-limit, persistence, sign-in hint.
- **B18 (negative limit / page params)**: not re-investigated in this round.
- **B21–B22 (empty channels)**: not re-investigated — only the test user's own empty channel (`/c/testuser_bug_hunt`) was visited, and the placeholder is consistent with the report.
- **B24 (hero video a11y)**: still no `aria-label`, no mute control, no `prefers-reduced-motion` handling.
- **B25 (SEO meta)**: still no `<meta name="description">`, `og:title`, `og:image`, `twitter:card`.

## Round-2 what-works addendum
- Registration succeeds; user is auto-logged in and the JWT is persisted to `localStorage.token`.
- Category filter URLs update correctly.
- Like count increments from `1 → 2` after a successful API call.
- Community-post upvote increments from `1 → 2`.
- XSS attempts in community comments (`<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`) are escaped, not executed.
- The 404 page is now styled and on-brand.
- Per-route `<title>` tags are correct.
- The player respects portrait aspect ratio (B9 fix confirmed visually).

## Round-2 suggested priority (in addition to the round-1 list)
1. **B46, B33, B48** — comment posting, video upload, and the entire creator flow are broken.
2. **B36** — the IP-level rate limit is a production-time bomb.
3. **B32, B31** — channel and user endpoints 404'ing as HTML will break every non-React client.
4. **B39, B40, B37** — `/liked-videos`, `/history/watch`, `/subscriptions`, and unknown-video 404s are all silently redirecting to home and look like broken links.
5. **B28, B38, B41, B42, B43, B44, B45** — buttons that look interactive but are dead elements.
6. **B27, B34** — category filter data and titles.
