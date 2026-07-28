import { NavLink } from "react-router-dom";
import { useWatchlist } from "../context/WatchlistContext.jsx";

const SiteNav = () => {
  const { watchlist } = useWatchlist();
  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <NavLink className="brand" to="/" aria-label="MovieQues home">
        <span aria-hidden="true">🎬</span> MovieQues
      </NavLink>
      <div className="nav-links">
        <NavLink to="/">Discover</NavLink>
        <NavLink to="/watchlist">
          Watchlist <span className="watchlist-count">{watchlist.length}</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default SiteNav;
