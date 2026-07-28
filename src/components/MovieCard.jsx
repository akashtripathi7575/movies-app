import { Link } from "react-router-dom";
import { getImageUrl } from "../api/tmdb.js";
import { useWatchlist } from "../context/WatchlistContext.jsx";

export const MovieCard = ({ movie }) => {
  const { id, title, vote_average, poster_path, release_date, original_language } = movie;
  const { isSaved, toggleMovie } = useWatchlist();
  const saved = isSaved(id);

  return (
    <article className="movie-card">
      <button
        className={`save-button ${saved ? "is-saved" : ""}`}
        type="button"
        onClick={() => toggleMovie(movie)}
        aria-label={`${saved ? "Remove" : "Add"} ${title} ${saved ? "from" : "to"} watchlist`}
        aria-pressed={saved}
      >
        <span aria-hidden="true">{saved ? "✓" : "+"}</span>
      </button>
      <Link to={`/movie/${id}`} aria-label={`View details for ${title}`}>
        <div className="poster-wrap">
          <img
            src={getImageUrl(poster_path, "w342")}
            alt={`Poster for ${title}`}
            loading="lazy"
            width="342"
            height="513"
          />
        </div>
        <div className="movie-card-body">
          <h3>{title}</h3>
          <div className="content">
            <div className="rating" aria-label={`Rating ${vote_average?.toFixed(1) || "not available"}`}>
              <img src="/star.svg" alt="" aria-hidden="true" />
              <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
            </div>
            <span aria-hidden="true">•</span>
            <p className="lang">{original_language || "N/A"}</p>
            <span aria-hidden="true">•</span>
            <p className="year">{release_date ? release_date.split("-")[0] : "N/A"}</p>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default MovieCard;
