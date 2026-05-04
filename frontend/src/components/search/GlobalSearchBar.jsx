import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import useClickOutside from '../../hooks/useClickOutside';
import { fanOutSearch, totalCount, ENTITY_CONFIG } from '../../api/globalSearchApi';
import SearchResultsPanel from './SearchResultsPanel';

function GlobalSearchBar() {
  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [open, setOpen]                 = useState(false);
  const [highlightIndex, setHighlight]  = useState(-1);

  const debouncedQuery = useDebounce(query, 350);
  const containerRef   = useRef(null);
  const navigate       = useNavigate();

  useClickOutside(containerRef, useCallback(() => setOpen(false), []));

  useEffect(() => {
    let cancelled = false;
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    fanOutSearch(debouncedQuery)
      .then((res) => {
        if (!cancelled) {
          setResults(res);
          setHighlight(-1);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // Flat list of all result items for keyboard navigation
  const flatItems = useMemo(() => {
    if (!results) return [];
    const list = [];
    for (const config of ENTITY_CONFIG) {
      for (const item of results[config.key] || []) {
        const id  = config.idField(item);
        list.push({ url: `${config.route}/${id}` });
      }
    }
    return list;
  }, [results]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && flatItems[highlightIndex]) {
        navigate(flatItems[highlightIndex].url);
        setOpen(false);
        setQuery('');
      } else if (query.trim().length >= 2) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlight(-1);
    }
  };

  const clear = () => {
    setQuery('');
    setResults(null);
    setOpen(false);
  };

  const handleSelect = (url) => {
    navigate(url);
    setOpen(false);
    setQuery('');
  };

  const handleViewAll = () => {
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="position-relative" style={{ width: '320px', maxWidth: '100%' }}>
      <div className="input-group input-group-sm">
        <span className="input-group-text bg-white border-end-0">
          <i className="bi bi-search text-muted"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0 ps-0"
          placeholder="Search merchants, terminals, txns…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {query && (
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clear} title="Clear">
            <i className="bi bi-x"></i>
          </button>
        )}
      </div>

      {open && (
        <SearchResultsPanel
          query={debouncedQuery}
          results={results}
          loading={loading}
          highlightIndex={highlightIndex}
          flatItems={flatItems}
          onSelect={handleSelect}
          onViewAll={handleViewAll}
        />
      )}
    </div>
  );
}

export default GlobalSearchBar;
