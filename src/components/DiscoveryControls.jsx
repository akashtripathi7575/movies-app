const SORT_OPTIONS = [
  ["popularity.desc", "Most popular"],
  ["vote_average.desc", "Highest rated"],
  ["primary_release_date.desc", "Newest first"],
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 25 }, (_, index) => currentYear - index);

const DiscoveryControls = ({ sortBy, setSortBy, year, setYear, genre, setGenre, genres }) => (
  <div className="discovery-controls" aria-label="Movie filters">
    <label>
      <span>Genre</span>
      <select value={genre} onChange={(event) => setGenre(event.target.value)}>
        <option value="">All genres</option>
        {genres.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
      </select>
    </label>
    <label>
      <span>Sort by</span>
      <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
        {SORT_OPTIONS.map(([value, label]) => (
          <option value={value} key={value}>{label}</option>
        ))}
      </select>
    </label>
    <label>
      <span>Release year</span>
      <select value={year} onChange={(event) => setYear(event.target.value)}>
        <option value="">Any year</option>
        {years.map((value) => <option value={value} key={value}>{value}</option>)}
      </select>
    </label>
  </div>
);

export default DiscoveryControls;
