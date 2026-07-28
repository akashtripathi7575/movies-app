const API_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const API_OPTIONS = {
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
  },
};

const fetchJson = async (path, signal) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...API_OPTIONS,
    signal,
  });
  if (!response.ok) throw new Error(`TMDB request failed with status ${response.status}`);
  return response.json();
};

const sortSearchResults = (movies, sortBy) => {
  const sorted = [...movies];
  if (sortBy === "vote_average.desc") {
    return sorted.sort((a, b) => b.vote_average - a.vote_average);
  }
  if (sortBy === "primary_release_date.desc") {
    return sorted.sort(
      (a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime(),
    );
  }
  return sorted.sort((a, b) => b.popularity - a.popularity);
};

export const getImageUrl = (path, size = "w500") =>
  path ? `${IMAGE_BASE_URL}/${size}${path}` : "/no-movie.jpg";

export const fetchMovies = async (
  { query = "", page = 1, sortBy = "popularity.desc", year = "", genre = "" },
  signal,
) => {
  const params = new URLSearchParams({ page: String(page), include_adult: "false" });
  let path = "/discover/movie";

  if (query) {
    path = "/search/movie";
    params.set("query", query);
    if (year) params.set("primary_release_year", year);
  } else {
    params.set("sort_by", sortBy);
    if (year) params.set("primary_release_year", year);
    if (genre) params.set("with_genres", genre);
    if (sortBy === "vote_average.desc") params.set("vote_count.gte", "200");
    if (sortBy === "primary_release_date.desc") {
      params.set("primary_release_date.lte", new Date().toISOString().slice(0, 10));
    }
  }

  const data = await fetchJson(`${path}?${params.toString()}`, signal);
  const sortedResults = query ? sortSearchResults(data.results || [], sortBy) : data.results || [];
  const results = query && genre
    ? sortedResults.filter((movie) => movie.genre_ids?.includes(Number(genre)))
    : sortedResults;

  return {
    ...data,
    results,
    total_pages: query && genre ? 1 : data.total_pages,
    total_results: query && genre ? results.length : data.total_results,
  };
};

export const fetchMovieGenres = async (signal) => {
  const data = await fetchJson("/genre/movie/list", signal);
  return data.genres || [];
};

export const fetchMovieBundle = async (id, signal) => {
  const movie = await fetchJson(`/movie/${id}`, signal);
  const [creditsResult, similarResult, videosResult] = await Promise.allSettled([
    fetchJson(`/movie/${id}/credits`, signal),
    fetchJson(`/movie/${id}/similar`, signal),
    fetchJson(`/movie/${id}/videos`, signal),
  ]);

  const videos = videosResult.status === "fulfilled" ? videosResult.value.results || [] : [];
  const trailer =
    videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) ||
    videos.find((video) => video.site === "YouTube" && video.type === "Trailer") ||
    videos.find((video) => video.site === "YouTube") ||
    null;

  return {
    movie,
    cast: creditsResult.status === "fulfilled" ? (creditsResult.value.cast || []).slice(0, 12) : [],
    similar:
      similarResult.status === "fulfilled"
        ? (similarResult.value.results || []).slice(0, 12)
        : [],
    trailer,
  };
};
