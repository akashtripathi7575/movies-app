import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "movieques-watchlist";
const RECENT_STORAGE_KEY = "movieques-recently-viewed";
const WatchlistContext = createContext(null);

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => readStorage(STORAGE_KEY));
  const [recentlyViewed, setRecentlyViewed] = useState(() => readStorage(RECENT_STORAGE_KEY));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const toggleMovie = useCallback((movie) => {
    setWatchlist((current) =>
      current.some((item) => item.id === movie.id)
        ? current.filter((item) => item.id !== movie.id)
        : [movie, ...current],
    );
  }, []);

  const addRecentlyViewed = useCallback((movie) => {
    const snapshot = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      original_language: movie.original_language,
      popularity: movie.popularity,
    };
    setRecentlyViewed((current) => [
      snapshot,
      ...current.filter((item) => item.id !== movie.id),
    ].slice(0, 8));
  }, []);

  const value = useMemo(
    () => ({
      watchlist,
      recentlyViewed,
      isSaved: (id) => watchlist.some((movie) => movie.id === id),
      toggleMovie,
      addRecentlyViewed,
    }),
    [addRecentlyViewed, recentlyViewed, toggleMovie, watchlist],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};

// The provider and its tiny companion hook intentionally live together for this small app.
// eslint-disable-next-line react-refresh/only-export-components
export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error("useWatchlist must be used inside WatchlistProvider");
  return context;
};
