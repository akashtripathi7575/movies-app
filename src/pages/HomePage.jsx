import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DiscoveryControls from "../components/DiscoveryControls.jsx";
import { MovieCard } from "../components/MovieCard.jsx";
import Search from "../components/Search.jsx";
import SiteNav from "../components/SiteNav.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { fetchMovieGenres, fetchMovies } from "../api/tmdb.js";
import { getTrendingMovies, updateSearchCount } from "../appwrite.js";
import { useWatchlist } from "../context/WatchlistContext.jsx";

const HomePage = () => {
  const { recentlyViewed, removeRecentlyViewed } = useWatchlist();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popularity.desc");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [genre, setGenre] = useState(searchParams.get("genre") || "");
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const activeRequest = useRef(null);
  const previousSearchMode = useRef(false);
  const normalizedSearchTerm = searchTerm.trim();
  const isSearchMode = normalizedSearchTerm.length > 0;
  const isSearchPending = normalizedSearchTerm !== debouncedSearchTerm;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 500);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (isSearchMode && !previousSearchMode.current) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
    previousSearchMode.current = isSearchMode;
  }, [isSearchMode]);

  useEffect(() => {
    document.title = "MovieQues — Find your next movie";
  }, []);

  useEffect(() => {
    const params = {};
    if (debouncedSearchTerm) params.q = debouncedSearchTerm;
    if (sortBy !== "popularity.desc") params.sort = sortBy;
    if (year) params.year = year;
    if (genre) params.genre = genre;
    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, genre, sortBy, year, setSearchParams]);

  useEffect(() => {
    getTrendingMovies().then(setTrendingMovies);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchMovieGenres(controller.signal).then(setGenres).catch((requestError) => {
      if (requestError.name !== "AbortError") console.error(requestError);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current?.abort();
    activeRequest.current = controller;

    const loadFirstPage = async () => {
      setIsLoading(true);
      setError("");
      setPage(1);
      try {
        const data = await fetchMovies(
          { query: debouncedSearchTerm, page: 1, sortBy, year, genre },
          controller.signal,
        );
        setMovies(data.results);
        setTotalPages(Math.min(data.total_pages || 1, 500));
        setTotalResults(data.total_results || 0);
        if (debouncedSearchTerm && data.results.length > 0) {
          void updateSearchCount(debouncedSearchTerm, data.results[0]);
        }
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error(requestError);
          setError("We couldn't load movies right now. Please try again.");
          setMovies([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadFirstPage();
    return () => controller.abort();
  }, [debouncedSearchTerm, genre, sortBy, year, retryKey]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    setError("");
    try {
      const data = await fetchMovies({ query: debouncedSearchTerm, page: nextPage, sortBy, year, genre });
      setMovies((current) => [...current, ...data.results]);
      setPage(nextPage);
    } catch (requestError) {
      console.error(requestError);
      setError("We couldn't load more movies. Please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [debouncedSearchTerm, genre, page, sortBy, year]);

  const surpriseMe = useCallback(() => {
    if (movies.length === 0) return;
    const viewedIds = new Set(recentlyViewed.map((movie) => movie.id));
    const unseenMovies = movies.filter((movie) => !viewedIds.has(movie.id));
    const pool = unseenMovies.length > 0 ? unseenMovies : movies;
    const selectedMovie = pool[Math.floor(Math.random() * pool.length)];
    navigate(`/movie/${selectedMovie.id}`);
  }, [movies, navigate, recentlyViewed]);

  const selectedGenre = genres.find((item) => String(item.id) === genre);
  const resultsTitle = normalizedSearchTerm
    ? `Results for “${normalizedSearchTerm}”`
    : selectedGenre
      ? `${selectedGenre.name} Movies`
      : "Discover Movies";

  return (
    <main className={isSearchMode ? "search-mode" : ""}>
      <div className="pattern" />
      <div className="wrapper">
        <SiteNav />
        <header className="hero">
          <img src="/hero.png" alt="Classic movie posters" width="768" height="512" />
          <p className="eyebrow">Your next movie starts here</p>
          <h1>
            Find <span className="text-gradient">Movies</span> You&apos;ll Enjoy Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {!isSearchMode && trendingMovies.length > 0 && (
          <section className="trending" aria-labelledby="trending-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Popular on MovieQues</p>
                <h2 id="trending-heading">Trending Searches</h2>
              </div>
              <p>What visitors are searching for most.</p>
            </div>
            <ol>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <span>{index + 1}</span>
                  <Link
                    to={`/movie/${movie.movie_id}`}
                    aria-label={`Open ${movie.searchTerm || `trending movie ${index + 1}`}`}
                    title={movie.searchTerm || undefined}
                  >
                    <img src={movie.poster_url || "/no-movie.jpg"} alt="" loading="lazy" width="127" height="163" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {!isSearchMode && recentlyViewed.length > 0 && (
          <section className="recently-viewed" aria-labelledby="recent-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Pick up where you left off</p>
                <h2 id="recent-heading">Recently Viewed</h2>
              </div>
              <p>Stored only in this browser.</p>
            </div>
            <ul className="recent-grid">
              {recentlyViewed.map((movie) => (
                <li key={movie.id}>
                  <MovieCard movie={movie} genres={genres} onRemove={removeRecentlyViewed} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies" aria-labelledby="movies-heading">
          <div className="movies-toolbar">
            <div>
              <p className="eyebrow">Browse the collection</p>
              <h2 id="movies-heading">{resultsTitle}</h2>
              {!isLoading && !isSearchPending && !error && (
                <p className="result-count">{totalResults.toLocaleString()} movies found</p>
              )}
            </div>
            <div className="controls-stack">
              <DiscoveryControls
                sortBy={sortBy}
                setSortBy={setSortBy}
                year={year}
                setYear={setYear}
                genre={genre}
                setGenre={setGenre}
                genres={genres}
              />
              <button
                className="surprise-button"
                onClick={surpriseMe}
                disabled={isLoading || isSearchPending || movies.length === 0}
              >
                <span aria-hidden="true">🎲</span> Surprise Me
              </button>
            </div>
          </div>

          {isLoading || isSearchPending ? (
            <Spinner label={isSearchPending ? "Searching movies..." : "Loading movies..."} />
          ) : error && movies.length === 0 ? (
            <div className="state-card" role="alert">
              <h3>Something interrupted the show</h3>
              <p>{error}</p>
              <button className="primary-button" onClick={() => setRetryKey((value) => value + 1)}>Try again</button>
            </div>
          ) : movies.length === 0 ? (
            <div className="state-card">
              <h3>No movies found</h3>
              <p>Try a shorter title, another year, or clear the search.</p>
              <button className="secondary-button" onClick={() => { setSearchTerm(""); setYear(""); setGenre(""); }}>Clear filters</button>
            </div>
          ) : (
            <>
              <ul className="movie-grid">
                {movies.map((movie) => <li key={movie.id}><MovieCard movie={movie} genres={genres} /></li>)}
              </ul>
              {error && <p className="inline-error" role="alert">{error}</p>}
              {page < totalPages && (
                <button className="load-more" onClick={loadMore} disabled={isLoadingMore}>
                  {isLoadingMore ? "Loading more..." : "Load more movies"}
                </button>
              )}
            </>
          )}
        </section>

        <footer>
          <p>Built with React, TMDB and Appwrite.</p>
          <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </footer>
      </div>
    </main>
  );
};

export default HomePage;
