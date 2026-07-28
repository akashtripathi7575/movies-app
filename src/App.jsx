import { lazy, Suspense } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { Spinner } from "./components/Spinner.jsx";
import { WatchlistProvider } from "./context/WatchlistContext.jsx";
import HomePage from "./pages/HomePage.jsx";

const MovieDetailPage = lazy(() => import("./pages/MovieDetailPage.jsx"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage.jsx"));

const NotFoundPage = () => (
  <main className="centered-page">
    <p className="eyebrow">404</p>
    <h1>That page left the cinema.</h1>
    <Link className="primary-button" to="/">Back to discover</Link>
  </main>
);

const App = () => (
  <WatchlistProvider>
    <Suspense fallback={<Spinner fullPage label="Loading page..." />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </WatchlistProvider>
);

export default App;
