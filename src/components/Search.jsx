const Search = ({ searchTerm, setSearchTerm }) => (
  <div className="search">
    <div>
      <img src="/search.svg" alt="" aria-hidden="true" />
      <label className="sr-only" htmlFor="movie-search">Search for movies</label>
      <input
        id="movie-search"
        type="search"
        placeholder="Search for a movie..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        autoComplete="off"
      />
      {searchTerm && (
        <button className="clear-search" type="button" onClick={() => setSearchTerm("")} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  </div>
);

export default Search;
