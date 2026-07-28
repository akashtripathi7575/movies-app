import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MovieCard } from "../components/MovieCard.jsx";
import SiteNav from "../components/SiteNav.jsx";
import { useWatchlist } from "../context/WatchlistContext.jsx";

const WatchlistPage = () => {
  const { watchlist } = useWatchlist();
  useEffect(() => {
    document.title = "Your Watchlist | MovieQues";
  }, []);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper interior-page">
        <SiteNav />
        <header className="page-header">
          <p className="eyebrow">Saved for later</p>
          <h1>Your Watchlist</h1>
          <p>Movies you want to remember, stored privately in this browser.</p>
        </header>
        {watchlist.length === 0 ? (
          <div className="state-card">
            <h2>Your watchlist is empty</h2>
            <p>Use the + button on any movie card to save it here.</p>
            <Link className="primary-button" to="/">Discover movies</Link>
          </div>
        ) : (
          <ul className="movie-grid">
            {watchlist.map((movie) => <li key={movie.id}><MovieCard movie={movie} /></li>)}
          </ul>
        )}
      </div>
    </main>
  );
};

export default WatchlistPage;
