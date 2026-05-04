import { ENTITY_CONFIG, totalCount } from '../../api/globalSearchApi';
import SearchResultGroup from './SearchResultGroup';

function SearchResultsPanel({ query, results, loading, highlightIndex, flatItems, onSelect, onViewAll }) {
  if (!query || query.trim().length < 2) {
    return (
      <div className="ax-search-panel card shadow border-0">
        <div className="p-3 text-muted small">
          <i className="bi bi-info-circle me-2"></i>
          Type at least 2 characters to search across all modules.
        </div>
      </div>
    );
  }

  if (loading && !results) {
    return (
      <div className="ax-search-panel card shadow border-0">
        <div className="p-3 text-center text-muted small">
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          Searching…
        </div>
      </div>
    );
  }

  const total = totalCount(results);

  if (total === 0) {
    return (
      <div className="ax-search-panel card shadow border-0">
        <div className="p-3 text-muted small">
          <i className="bi bi-emoji-frown me-2"></i>
          No results for "<strong>{query}</strong>".
        </div>
      </div>
    );
  }

  let runningIndex = 0;

  return (
    <div className="ax-search-panel card shadow border-0">
      {ENTITY_CONFIG.map((config) => {
        const items = results?.[config.key] || [];
        if (items.length === 0) return null;
        const startIndex = runningIndex;
        runningIndex += items.length;
        return (
          <SearchResultGroup
            key={config.key}
            config={config}
            items={items}
            startIndex={startIndex}
            highlightIndex={highlightIndex}
            onSelect={onSelect}
          />
        );
      })}

      <div className="border-top p-2 text-center bg-light">
        <button type="button" className="btn btn-link btn-sm p-0 small" onClick={onViewAll}>
          View all results for "{query}" <i className="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    </div>
  );
}

export default SearchResultsPanel;
