import SearchResultItem from './SearchResultItem';

function SearchResultGroup({ config, items, startIndex, highlightIndex, onSelect }) {
  return (
    <div>
      <div className="px-3 py-1 bg-light border-bottom d-flex align-items-center gap-2">
        <i className={`bi ${config.icon} small text-muted`}></i>
        <span className="small text-muted fw-semibold text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}>
          {config.label}
        </span>
        <span className="badge bg-secondary ms-auto" style={{ fontSize: '0.6rem' }}>{items.length}</span>
      </div>
      <ul className="mb-0 p-0">
        {items.map((item, i) => {
          const id  = config.idField(item);
          const url = `${config.route}/${id}`;
          return (
            <SearchResultItem
              key={`${config.key}-${id ?? i}`}
              entityKey={config.key}
              item={item}
              url={url}
              highlighted={startIndex + i === highlightIndex}
              onSelect={onSelect}
            />
          );
        })}
      </ul>
    </div>
  );
}

export default SearchResultGroup;
