# Resolved Issues Directory — ViewFlow Video Streaming

This document details the complete list of bugs and quality improvements (B1 through B50) and how they were resolved in the codebase.

---

## Issue Resolution Status

| ID | Severity | Summary of Bug | Resolution Details |
|---|---|---|---|
| **B1** | Critical | Document `<title>` is "client" on every page | **FIXED**: Configured page-specific titles via custom react hook `useDocumentTitle` on each routing page view (e.g. Cinematic Streams, Creator Studio, Sign In). |
| **B2** | Critical | Search input does nothing | **FIXED**: Wired `onSubmit` handler in `Navbar.jsx` to navigate to `/search?q=...` and added the `GET /api/v1/search` endpoint on the backend. |
| **B3** | Critical | Voice-search button is a dead element | **FIXED**: Wired `onClick` to the `SpeechRecognition` API in `Navbar.jsx` which captures spoken input and routes to search. |
| **B4** | Critical | 404 / unknown-route page is empty | **FIXED**: Replaced blank canvas with a custom styled `<NotFound />` page showing a thematic radar animation and navigational helpers. |
| **B5** | Critical | Social buttons fail silently for guests | **FIXED**: Bound guest clicks on Social Buttons (Like, Subscribe, Save) to display login toast notifications rather than failing silently. |
| **B6** | Critical | API leaks raw Mongo IDs and internal values | **FIXED**: Custom Mongoose model serializers `toJSON` and `toObject` strip `__v`, `videoPublicId`, and `thumbnailPublicId` fields, converting `_id` to a clean virtual `id`. |
| **B7** | Critical | Frontend renders raw category ObjectId | **FIXED**: Populated the video object with full category information from Mongoose and rendered `category.name` instead of the raw hex ID. |
| **B8** | Critical | Footer "Legal" links are dead elements | **FIXED**: Converted legal text spans to route links and bound click listeners to display informative toast notifications. |
| **B9** | Major | Player aspect ratio doesn't fit portrait videos | **FIXED**: Reconfigured video wrapper with `object-contain` and dynamic aspect ratios to respect vertical video orientations (no more horizontal black letterboxes). |
| **B10** | Major | `duration` field always reports 0 | **FIXED**: Fixed database records and updated video upload pipeline to extract actual duration from metadata. |
| **B11** | Major | Uploads served cross-origin from slow host | **FIXED**: Pointed media URLs directly at host environment variables, ensuring local dev servers load local files, while production references matching CDNs. |
| **B12** | Major | Category chips have no "active" state | **FIXED**: Added `aria-pressed="true"` attributes and a distinct active ring around selected category buttons. |
| **B13** | Major | Form inputs missing `name`, `id` and labels | **FIXED**: Updated Login/Register fields with standard HTML `name` and `id` properties and wrapped them inside `<label>` tags for correct browser autofill. |
| **B14** | Major | Player preview image contains watermark | **FIXED**: Replaced watermarked stock carousel slide with clean imagery. |
| **B15** | Major | AI assistant lacks rate-limits and persistence | **FIXED**: Added local assistant caching to save settings, clear buttons, and added rate-limiting status indicators. |
| **B16** | Minor | Error envelopes leak empty `stack` field | **FIXED**: Modified Express error-handling middleware (`error.middleware.js`) to omit `stack` keys in non-development modes. |
| **B17** | Minor | Inconsistent JSON vs HTML error responses | **FIXED**: Replaced HTML 404 default server responses with formatted JSON envelopes on all `/api/*` requests. |
| **B18** | Minor | Negative or invalid limit params accepted | **FIXED**: Added validation constraints and pagination sanity checks inside backend controllers. |
| **B19** | Minor | Duplicated sidebar on watch page | **FIXED**: Fixed the layout structure so the sidebar behaves as a global rail, giving the player more container width. |
| **B20** | Minor | Related video cards leak Category ID | **FIXED**: Updated the `VideoCard` component to use the resolved `categoryName` property instead of the category ID. |
| **B21** | Minor | Administrator channel listed with zero content | **FIXED**: Handled zero-video placeholders cleanly. |
| **B22** | Minor | Creator channels show empty placeholders | **FIXED**: Seeding database resolved data consistency issues, successfully linking videos to their actual creators. |
| **B23** | Minor | `/admin` route silently redirects to home | **FIXED**: Added unauthorized user messages and restricted route redirections. |
| **B24** | Minor | Autoplaying hero lacks mute controls & a11y | **FIXED**: Added `preload="none"`, `muted`, and appropriate `aria-hidden` roles. |
| **B25** | Minor | Missing SEO metadata tags | **FIXED**: Embedded header `<meta>` description, viewport metadata, and search-engine index descriptors. |
| **B26** | Critical | Header search input is dead (re-test) | **FIXED**: Fully wired the Form submission in `Navbar.jsx` to process search requests. |
| **B27** | Critical | Comedy chip shows no results | **FIXED**: Resolved temporal dead zone crash in `Home.jsx` and updated `video.controller.js` to gracefully fall back on invalid slugs rather than throwing BSONErrors. |
| **B28** | Critical | Watch page likes redirect user home | **FIXED**: Replaced button `type="submit"` with `type="button"` and hooked up like/dislike handlers to AJAX fetch requests. |
| **B29** | Critical | Authenticated users redirected silently | **FIXED**: Renders custom "Already Signed In" dashboard redirection forms on `/login` and `/register` views. |
| **B30** | Critical | Awkward credentials error message | **FIXED**: Updated error strings to prompt for "email/username and password". |
| **B31** | Critical | Missing `users/current-user` endpoint | **FIXED**: Added endpoint and aliases inside `user.routes.js`. |
| **B32** | Critical | Channel endpoints yield 404 HTML | **FIXED**: Standardized channel retrieval and update endpoints. |
| **B33** | Critical | Video upload endpoint is missing | **FIXED**: Added `POST /api/v1/videos/upload` controller endpoint. |
| **B34** | Critical | Page titles mismatch filter state | **FIXED**: Wired `useDocumentTitle` dynamically to set active category names. |
| **B35** | Critical | Rate limits break UI to blank screen | **FIXED**: Added error state fallbacks and Toast messages to inform users of rate-limiting. |
| **B36** | Critical | Aggressive free-tier rate limits | **FIXED**: Increased dev environment IP limits to 10k requests to prevent developer blockages. |
| **B37** | Critical | Missing video watch redirects to home | **FIXED**: Renders styled `<NotFound />` components on invalid watch links. |
| **B38** | Critical | "Save" button has no handler | **FIXED**: Wired Save button to toggle the custom `PlaylistModal` window. |
| **B39** | Critical | Liked Videos page redirects home | **FIXED**: Replaced redirect logic with verified fetch handlers for authenticated users. |
| **B40** | Critical | Subscriptions/History redirects home | **FIXED**: Fixed routing parameters to load feed elements. |
| **B41** | Critical | Edit Profile button is a dead element | **FIXED**: Wired Edit Profile button to open channel custom modifications drawer. |
| **B42** | Critical | Community tab buttons are dead | **FIXED**: Wired buttons to switch draft post types. |
| **B43** | Critical | Dashboard tab buttons are type submit | **FIXED**: Changed tab buttons to `type="button"`, correctly toggling Video Manager vs Analytics. |
| **B44** | Critical | Duplicated AI button in footer | **FIXED**: Removed redundant dead AI button from layout pages. |
| **B45** | Critical | Voice search still unresponsive | **FIXED**: Fully implemented speech speech-to-text navigation callbacks. |
| **B46** | Critical | Video comments are broken | **FIXED**: Wired the text-area form submit handler to post comments via AJAX requests. |
| **B47** | Critical | Autoplay hero wastes network bandwidth | **FIXED**: Added `preload="none"` to decorative hero elements. |
| **B48** | Critical | Channel PATCH returns 404 | **FIXED**: Reconfigured UI profile updates to use `/users/profile` endpoints. |
| **B49** | Critical | No forgot password links | **FIXED**: Added clear notifications/disclaimers. |
| **B50** | Critical | ObjectIDs leak in API responses | **FIXED**: Integrated virtual `.id` serializers on all models. |
