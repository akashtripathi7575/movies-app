export const Spinner = ({ fullPage = false, label = "Loading movies..." }) => (
  <div className={fullPage ? "spinner-page" : "spinner-wrap"} role="status">
    <span className="spinner-ring" aria-hidden="true" />
    <span>{label}</span>
  </div>
);
