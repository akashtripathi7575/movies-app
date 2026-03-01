import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const MovieCard = ({
  movie,
  movie: {
    id,
    title,
    vote_average,
    poster_path,
    release_date,
    original_language,
  },
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="movie-card"
      onClick={() => navigate(`/movie/${id}`)}
      style={{ cursor: "pointer", position: "relative", overflow: "hidden" }}
      whileHover={{
        scale: 1.04,
        boxShadow: "0 0 28px 6px rgba(171, 139, 255, 0.45)",
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(3,0,20,0.75) 0%, rgba(3,0,20,0.1) 60%, transparent 100%)",
          zIndex: 1,
          pointerEvents: "none",
          borderRadius: "inherit",
        }}
      />

      <img
        src={
          poster_path
            ? `https://image.tmdb.org/t/p/w500/${poster_path}`
            : "/no-movie.jpg"
        }
        alt={title}
      />

      <div className="mt-4" style={{ position: "relative", zIndex: 2 }}>
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <img src="/star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>

          <span>•</span>
          <p className="lang">{original_language}</p>
          <span>•</span>
          <p className="year">
            {release_date ? release_date.split("-")[0] : "N/A"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
