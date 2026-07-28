import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchMovieBundle, getImageUrl } from "../api/tmdb.js";
import { Spinner } from "../components/Spinner.jsx";
import TrailerModal from "../components/TrailerModal.jsx";
import { useWatchlist } from "../context/WatchlistContext.jsx";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay },
  }),
};

const StarRating = ({ score }) => {
  const filled = Math.round((score / 10) * 5);
  return (
    <div className="star-rating" aria-label={`Rated ${score.toFixed(1)} out of 10`}>
      <span aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span className={index < filled ? "filled" : ""} key={index}>★</span>
        ))}
      </span>
      <strong>{score.toFixed(1)} / 10</strong>
    </div>
  );
};

const ScrollableRow = ({ label, children }) => {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    const row = scrollRef.current;
    if (!row) return;
    row.scrollBy({ left: direction === "left" ? -row.clientWidth * 0.75 : row.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <div className="scroll-wrapper">
      <button className="scroll-arrow left" onClick={() => scroll("left")} aria-label={`Scroll ${label} left`}>‹</button>
      <div className="scroll-row" ref={scrollRef}>{children}</div>
      <button className="scroll-arrow right" onClick={() => scroll("right")} aria-label={`Scroll ${label} right`}>›</button>
    </div>
  );
};

const MetaItem = ({ label, children }) => (
  <div className="meta-item">
    <span className="meta-label">{label}</span>
    <div className="meta-value">{children}</div>
  </div>
);

const MovieDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addRecentlyViewed, isSaved, toggleMovie } = useWatchlist();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadMovie = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchMovieBundle(id, controller.signal);
        setMovie(data.movie);
        setCast(data.cast);
        setSimilar(data.similar);
        setTrailer(data.trailer);
        addRecentlyViewed(data.movie);
        document.title = `${data.movie.title} | MovieQues`;
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error(requestError);
          setError("We couldn't load this movie. It may be unavailable right now.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadMovie();
    window.scrollTo(0, 0);
    return () => {
      controller.abort();
      document.title = "MovieQues";
    };
  }, [addRecentlyViewed, id, retryKey]);

  if (loading) return <Spinner fullPage label="Loading movie details..." />;

  if (error || !movie) {
    return (
      <main className="centered-page">
        <p className="eyebrow">Unable to load</p>
        <h1>The details missed their cue.</h1>
        <p className="detail-error">{error || "Movie not found."}</p>
        <div className="detail-actions">
          <button className="primary-button" onClick={() => setRetryKey((value) => value + 1)}>Try again</button>
          <Link className="secondary-button" to="/">Back to discover</Link>
        </div>
      </main>
    );
  }

  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "N/A";
  const saved = isSaved(movie.id);

  return (
    <Motion.main className="detail-page" variants={pageVariants} initial="hidden" animate="visible">
      <section className="detail-hero">
        <img
          className="detail-backdrop"
          src={getImageUrl(movie.backdrop_path, "w1280")}
          alt=""
          width="1280"
          height="720"
        />
        <div className="detail-hero-shade" />
        <button className="detail-back" onClick={() => navigate(location.key === "default" ? "/" : -1)}>
          ← Back
        </button>
        <Motion.div className="detail-hero-content" custom={0.08} variants={slideUp} initial="hidden" animate="visible">
          <p className="eyebrow">Movie details</p>
          <h1>{movie.title}</h1>
          {movie.tagline && <p className="tagline">“{movie.tagline}”</p>}
          <div className="detail-hero-actions">
            <button
              className={`detail-save ${saved ? "is-saved" : ""}`}
              onClick={() => toggleMovie(movie)}
              aria-pressed={saved}
            >
              {saved ? "✓ In your watchlist" : "+ Add to watchlist"}
            </button>
            {trailer && (
              <button className="detail-trailer" onClick={() => setIsTrailerOpen(true)}>
                <span aria-hidden="true">▶</span> Watch trailer
              </button>
            )}
          </div>
        </Motion.div>
      </section>

      <div className="detail-body">
        <Motion.section className="detail-section" custom={0.12} variants={slideUp} initial="hidden" animate="visible">
          <h2>Overview</h2>
          <p className="overview">{movie.overview || "No overview is available for this movie."}</p>
        </Motion.section>

        <Motion.section className="meta-grid" custom={0.18} variants={slideUp} initial="hidden" animate="visible" aria-label="Movie facts">
          <MetaItem label="Rating">
            <StarRating score={movie.vote_average || 0} />
            <small>{movie.vote_count?.toLocaleString() || 0} votes</small>
          </MetaItem>
          <MetaItem label="Genres">
            <div className="genre-list">{(movie.genres || []).map((genre) => <span key={genre.id}>{genre.name}</span>)}</div>
          </MetaItem>
          <MetaItem label="Runtime">{runtime}</MetaItem>
          <MetaItem label="Release date">{movie.release_date || "N/A"}</MetaItem>
          <MetaItem label="Language">{(movie.original_language || "N/A").toUpperCase()}</MetaItem>
          <MetaItem label="Status">{movie.status || "N/A"}</MetaItem>
        </Motion.section>

        {cast.length > 0 && (
          <Motion.section className="detail-section" custom={0.24} variants={slideUp} initial="hidden" animate="visible">
            <h2>Cast</h2>
            <ScrollableRow label="cast">
              {cast.map((member) => (
                <article className="cast-card" key={`${member.id}-${member.cast_id}`}>
                  <img src={getImageUrl(member.profile_path, "w185")} alt={member.name} loading="lazy" width="110" height="150" />
                  <h3>{member.name}</h3>
                  <p>{member.character || "Cast member"}</p>
                </article>
              ))}
            </ScrollableRow>
          </Motion.section>
        )}

        {similar.length > 0 && (
          <Motion.section className="detail-section" custom={0.3} variants={slideUp} initial="hidden" animate="visible">
            <h2>Similar Movies</h2>
            <ScrollableRow label="similar movies">
              {similar.map((item) => (
                <Motion.article className="similar-card" key={item.id} whileHover={{ y: -5 }}>
                  <Link to={`/movie/${item.id}`} aria-label={`View details for ${item.title}`}>
                    <img src={getImageUrl(item.poster_path, "w342")} alt={`Poster for ${item.title}`} loading="lazy" width="150" height="225" />
                    <h3>{item.title}</h3>
                    <p><span aria-hidden="true">★</span> {item.vote_average ? item.vote_average.toFixed(1) : "N/A"} · {item.release_date?.split("-")[0] || "N/A"}</p>
                  </Link>
                </Motion.article>
              ))}
            </ScrollableRow>
          </Motion.section>
        )}
      </div>
      {isTrailerOpen && trailer && (
        <TrailerModal trailer={trailer} movieTitle={movie.title} onClose={() => setIsTrailerOpen(false)} />
      )}
    </Motion.main>
  );
};

export default MovieDetailPage;
