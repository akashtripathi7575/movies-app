import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ── Animation variants ──────────────────────────────────────────────────────
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", delay },
  }),
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const IMG_BASE = "https://image.tmdb.org/t/p/";

const StarRating = ({ score }) => {
  const filled = Math.round((score / 10) * 5);
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{ color: i < filled ? "#f5c518" : "#555", fontSize: 20 }}
        >
          ★
        </span>
      ))}
      <span style={{ color: "#ccc", marginLeft: 8, fontSize: 15 }}>
        {score.toFixed(1)} / 10
      </span>
    </div>
  );
};

// ── Scrollable Row with Arrow Buttons ────────────────────────────────────────
const ScrollableRow = ({ children }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div style={styles.scrollWrapper}>
      <button
        onClick={() => scroll("left")}
        style={{ ...styles.arrowBtn, left: -18 }}
        aria-label="Scroll left"
      >
        ‹
      </button>
      <div ref={scrollRef} style={styles.scrollRow}>
        {children}
      </div>
      <button
        onClick={() => scroll("right")}
        style={{ ...styles.arrowBtn, right: -18 }}
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const MovieDetailPage = ({ apiOptions, apiBaseUrl }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [detailRes, creditsRes, similarRes] = await Promise.all([
          fetch(`${apiBaseUrl}/movie/${id}`, apiOptions),
          fetch(`${apiBaseUrl}/movie/${id}/credits`, apiOptions),
          fetch(`${apiBaseUrl}/movie/${id}/similar`, apiOptions),
        ]);

        if (!detailRes.ok) throw new Error("Movie not found");

        const [detail, credits, similarData] = await Promise.all([
          detailRes.json(),
          creditsRes.json(),
          similarRes.json(),
        ]);

        setMovie(detail);
        setCast((credits.cast || []).slice(0, 12));
        setSimilar((similarData.results || []).slice(0, 12));
      } catch (err) {
        setError("Failed to load movie details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: "#a8b5db", marginTop: 20 }}>Loading…</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={styles.loadingWrap}>
        <p style={{ color: "#ef4444" }}>{error || "Movie not found."}</p>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `${IMG_BASE}original${movie.backdrop_path}`
    : null;

  const runtimeFormatted = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "N/A";

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={styles.page}
    >
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        {backdropUrl ? (
          <img src={backdropUrl} alt={movie.title} style={styles.backdrop} />
        ) : (
          <div style={{ ...styles.backdrop, background: "#0f0d23" }} />
        )}
        {/* gradient fade-out at bottom */}
        <div style={styles.backdropGradient} />

        {/* Back button */}
        <button style={styles.backBtnHero} onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Title overlay on banner */}
        <motion.div
          custom={0.1}
          variants={slideUp}
          initial="hidden"
          animate="visible"
          style={styles.heroText}
        >
          <h1 style={styles.heroTitle}>{movie.title}</h1>
          {movie.tagline && <p style={styles.tagline}>"{movie.tagline}"</p>}
        </motion.div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div style={styles.body}>
        {/* ── Overview ─────────────────────────────────────────── */}
        <motion.section
          custom={0.15}
          variants={slideUp}
          initial="hidden"
          animate="visible"
          style={styles.section}
        >
          <h2 style={styles.sectionTitle}>Overview</h2>
          <p style={styles.overview}>
            {movie.overview || "No overview available."}
          </p>
        </motion.section>

        {/* ── Meta grid ────────────────────────────────────────── */}
        <motion.section
          custom={0.25}
          variants={slideUp}
          initial="hidden"
          animate="visible"
          style={styles.metaGrid}
        >
          <MetaItem label="Rating">
            <StarRating score={movie.vote_average || 0} />
            <span style={{ color: "#9ca4ab", fontSize: 13, marginTop: 4 }}>
              {movie.vote_count?.toLocaleString()} votes
            </span>
          </MetaItem>
          <MetaItem label="Genres">
            <div style={styles.genreWrap}>
              {(movie.genres || []).map((g) => (
                <span key={g.id} style={styles.genrePill}>
                  {g.name}
                </span>
              ))}
            </div>
          </MetaItem>
          <MetaItem label="Runtime">{runtimeFormatted}</MetaItem>
          <MetaItem label="Release Date">
            {movie.release_date || "N/A"}
          </MetaItem>
          <MetaItem label="Language">
            {(movie.original_language || "N/A").toUpperCase()}
          </MetaItem>
          <MetaItem label="Status">{movie.status || "N/A"}</MetaItem>
        </motion.section>

        {/* ── Cast ─────────────────────────────────────────────── */}
        {cast.length > 0 && (
          <motion.section
            custom={0.35}
            variants={slideUp}
            initial="hidden"
            animate="visible"
            style={styles.section}
          >
            <h2 style={styles.sectionTitle}>Cast</h2>
            <ScrollableRow>
              {cast.map((member) => (
                <div key={member.id} style={styles.castCard}>
                  <img
                    src={
                      member.profile_path
                        ? `${IMG_BASE}w185${member.profile_path}`
                        : "/no-movie.jpg"
                    }
                    alt={member.name}
                    style={styles.castImg}
                  />
                  <p style={styles.castName}>{member.name}</p>
                  <p style={styles.castChar}>{member.character}</p>
                </div>
              ))}
            </ScrollableRow>
          </motion.section>
        )}

        {/* ── Similar Movies ────────────────────────────────────── */}
        {similar.length > 0 && (
          <motion.section
            custom={0.45}
            variants={slideUp}
            initial="hidden"
            animate="visible"
            style={styles.section}
          >
            <h2 style={styles.sectionTitle}>Similar Movies</h2>
            <ScrollableRow>
              {similar.map((m) => (
                <motion.div
                  key={m.id}
                  style={styles.similarCard}
                  onClick={() => navigate(`/movie/${m.id}`)}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 22px 4px rgba(171,139,255,0.45)",
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <img
                    src={
                      m.poster_path
                        ? `${IMG_BASE}w342${m.poster_path}`
                        : "/no-movie.jpg"
                    }
                    alt={m.title}
                    style={styles.similarImg}
                  />
                  <p style={styles.similarTitle}>{m.title}</p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 4,
                    }}
                  >
                    <span style={{ color: "#f5c518", fontSize: 13 }}>★</span>
                    <span style={{ color: "#9ca4ab", fontSize: 13 }}>
                      {m.vote_average ? m.vote_average.toFixed(1) : "N/A"}
                    </span>
                    <span style={{ color: "#9ca4ab", fontSize: 13 }}>•</span>
                    <span style={{ color: "#9ca4ab", fontSize: 13 }}>
                      {m.release_date ? m.release_date.split("-")[0] : "N/A"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </ScrollableRow>
          </motion.section>
        )}
      </div>
    </motion.div>
  );
};

// ── Small helper component ───────────────────────────────────────────────────
const MetaItem = ({ label, children }) => (
  <div style={styles.metaItem}>
    <span style={styles.metaLabel}>{label}</span>
    <div style={styles.metaValue}>{children}</div>
  </div>
);

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#030014",
    color: "#fff",
    fontFamily: "DM Sans, sans-serif",
  },
  loadingWrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#030014",
  },
  spinner: {
    width: 48,
    height: 48,
    border: "4px solid rgba(171,139,255,0.2)",
    borderTop: "4px solid #AB8BFF",
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
  },
  backdrop: {
    width: "100%",
    height: "clamp(320px, 55vw, 620px)",
    objectFit: "cover",
    display: "block",
  },
  backdropGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
    background: "linear-gradient(to bottom, transparent 0%, #030014 100%)",
    pointerEvents: "none",
  },
  backBtnHero: {
    position: "absolute",
    top: 20,
    left: 24,
    background: "rgba(15,13,35,0.75)",
    border: "1px solid rgba(171,139,255,0.4)",
    color: "#cecefb",
    padding: "8px 18px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.03em",
    backdropFilter: "blur(8px)",
    zIndex: 10,
    transition: "background 0.2s",
  },
  backBtn: {
    background: "rgba(15,13,35,0.9)",
    border: "1px solid rgba(171,139,255,0.4)",
    color: "#cecefb",
    padding: "10px 24px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 15,
    marginTop: 16,
  },
  heroText: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    padding: "0 clamp(16px, 5vw, 80px)",
    zIndex: 5,
  },
  heroTitle: {
    fontSize: "clamp(28px, 5vw, 56px)",
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.15,
    textShadow: "0 2px 24px rgba(0,0,0,0.7)",
    margin: 0,
  },
  tagline: {
    color: "#a8b5db",
    fontStyle: "italic",
    fontSize: "clamp(14px, 2vw, 18px)",
    marginTop: 8,
  },
  body: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px clamp(16px, 5vw, 60px) 80px",
  },
  section: {
    marginBottom: 52,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "2px solid rgba(171,139,255,0.25)",
  },
  overview: {
    color: "#a8b5db",
    fontSize: 16,
    lineHeight: 1.8,
    maxWidth: 860,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 20,
    marginBottom: 52,
    background: "rgba(15,13,35,0.7)",
    border: "1px solid rgba(171,139,255,0.15)",
    borderRadius: 16,
    padding: 28,
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  metaLabel: {
    color: "#AB8BFF",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  metaValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: 500,
    display: "flex",
    flexDirection: "column",
  },
  genreWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  genrePill: {
    background: "rgba(171,139,255,0.18)",
    border: "1px solid rgba(171,139,255,0.4)",
    color: "#D6C7FF",
    fontSize: 12,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 999,
  },
  scrollWrapper: {
    position: "relative",
  },
  arrowBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid rgba(171,139,255,0.5)",
    background: "rgba(15,13,35,0.85)",
    color: "#D6C7FF",
    fontSize: 24,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(6px)",
    transition: "background 0.2s, box-shadow 0.2s",
    boxShadow: "0 0 12px rgba(171,139,255,0.25)",
    lineHeight: 1,
  },
  scrollRow: {
    display: "flex",
    gap: 16,
    overflowX: "auto",
    paddingBottom: 12,
    paddingLeft: 8,
    paddingRight: 8,
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  castCard: {
    flexShrink: 0,
    width: 120,
    textAlign: "center",
  },
  castImg: {
    width: 110,
    height: 150,
    objectFit: "cover",
    borderRadius: 10,
    border: "2px solid rgba(171,139,255,0.25)",
    marginBottom: 8,
    display: "block",
    margin: "0 auto 8px",
  },
  castName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.3,
    margin: "4px 0 2px",
  },
  castChar: {
    color: "#9ca4ab",
    fontSize: 11,
    lineHeight: 1.3,
  },
  similarCard: {
    flexShrink: 0,
    width: 150,
    background: "#0f0d23",
    borderRadius: 12,
    padding: 10,
    cursor: "pointer",
    border: "1px solid rgba(171,139,255,0.12)",
    overflow: "hidden",
  },
  similarImg: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 8,
    display: "block",
  },
  similarTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    marginTop: 8,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
};

// inject keyframe for spinner
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  if (!document.head.querySelector("[data-spin]")) {
    style.setAttribute("data-spin", "1");
    document.head.appendChild(style);
  }
}

export default MovieDetailPage;
