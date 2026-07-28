# MovieQues

MovieQues is a responsive React movie-discovery app powered by TMDB, with search trends stored in Appwrite. Visitors can search and filter movies, explore detailed cast and recommendation data, and keep a personal watchlist in their browser.

## Highlights

- Debounced, cancellable movie search with shareable URL parameters
- Popular, rating, release-year and newest-first discovery controls
- Pagination with a load-more flow
- Detailed movie pages with cast, ratings, genres and similar titles
- Official trailer playback in an accessible, responsive modal
- Persistent local watchlist with no account required
- Recently viewed history stored locally in the browser
- Appwrite-backed trending searches
- Accessible links, controls, focus states and reduced-motion support
- Responsive images, lazy loading and route-level code splitting
- Friendly loading, empty, error and 404 states
- Netlify-compatible SPA deep links

## Tech stack

- React 19 and React Router
- Vite and Tailwind CSS
- TMDB API
- Appwrite
- Framer Motion

## Local setup

1. Install dependencies with `npm install`.
2. Create `.env.local` with the following values:

```env
VITE_TMDB_API_KEY=
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_COLLECTION_ID=
```

3. Run `npm run dev`.

## Quality checks

```bash
npm run lint
npm run build
```

## Deployment

The project includes `public/_redirects` so React Router detail and watchlist URLs work when opened directly on Netlify.

## Data attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
