function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange = null,
}) {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;
  const visiblePages = computeVisiblePages(page, totalPages, 5);
  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between mt-3">
      <div className="text-muted small">
        Showing <strong>{start}</strong> to <strong>{end}</strong> of{' '}
        <strong>{totalElements}</strong> entries
      </div>

      <div className="d-flex align-items-center gap-2">
        {onPageSizeChange && (
          <div className="d-flex align-items-center small text-muted">
            Per page:
            <select
              className="form-select form-select-sm ms-2"
              style={{ width: 'auto' }}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        {totalPages > 1 && (
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${isFirstPage ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(0)}
                  disabled={isFirstPage}
                  title="First page"
                >
                  <i className="bi bi-chevron-double-left"></i>
                </button>
              </li>
              <li className={`page-item ${isFirstPage ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(page - 1)}
                  disabled={isFirstPage}
                  title="Previous page"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>

              {visiblePages.map((p) => (
                <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => onPageChange(p)}>
                    {p + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${isLastPage ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(page + 1)}
                  disabled={isLastPage}
                  title="Next page"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
              <li className={`page-item ${isLastPage ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => onPageChange(totalPages - 1)}
                  disabled={isLastPage}
                  title="Last page"
                >
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}

function computeVisiblePages(currentPage, totalPages, maxVisible) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(0, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible);

  if (end - start < maxVisible) {
    start = Math.max(0, end - maxVisible);
  }

  return Array.from({ length: end - start }, (_, i) => start + i);
}

export default Pagination;
