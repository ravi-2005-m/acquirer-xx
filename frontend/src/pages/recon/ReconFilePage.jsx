import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reconApi } from '../../api/reconApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import StatusBadge from '../../components/StatusBadge';
import ReconItemFilters from '../../components/recon/ReconItemFilters';
import ReconItemTable from '../../components/recon/ReconItemTable';
import Pagination from '../../components/Pagination';
import { formatDate, formatDateTime, formatNumber } from '../../utils/formatters';

const SOURCE_BADGE = { SWITCH: 'bg-primary', NETWORK: 'bg-info', BANK: 'bg-success' };
const ITEM_PAGE_SIZE = 20;

function ReconFilePage() {
  const { id }       = useParams();
  const location     = useLocation();
  const { user }     = useAuth();

  const [file, setFile]                     = useState(location.state?.file || null);
  const [fileLoading, setFileLoading]       = useState(!location.state?.file);
  const [fileError, setFileError]           = useState(null);

  const [itemFilters, setItemFilters]       = useState({ matchStatus: '' });
  const [itemPage, setItemPage]             = useState(0);
  const [items, setItems]                   = useState([]);
  const [itemTotalPages, setItemTotalPages] = useState(0);
  const [itemTotalElements, setItemTotalElements] = useState(0);
  const [itemsLoading, setItemsLoading]     = useState(true);

  const fetchFile = useCallback(async () => {
    if (file) return;
    setFileLoading(true);
    setFileError(null);
    try {
      const res  = await reconApi.getFiles({ size: 100 });
      const body = res.data?.data ?? res.data ?? {};
      const found = (body.content ?? []).find(f => String(f.reconFileId) === String(id));
      if (!found) throw new Error('not found');
      setFile(found);
    } catch {
      setFileError('Recon file not found or service unavailable.');
    } finally {
      setFileLoading(false);
    }
  }, [id, file]);

  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const search = {};
      if (itemFilters.matchStatus) search.matchStatus = itemFilters.matchStatus;

      const pagination = { page: itemPage, size: ITEM_PAGE_SIZE };
      const res  = await reconApi.getFileItems(id, pagination);
      const body = res.data?.data ?? res.data ?? {};
      const content = body.content ?? [];

      const filtered = itemFilters.matchStatus
        ? content.filter(it => it.matchStatus === itemFilters.matchStatus)
        : content;

      setItems(filtered);
      setItemTotalPages(body.totalPages ?? 0);
      setItemTotalElements(body.totalElements ?? 0);
    } catch {
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, [id, itemFilters, itemPage]);

  useEffect(() => { fetchFile(); }, [fetchFile]);
  useEffect(() => {
    const t = setTimeout(fetchItems, 200);
    return () => clearTimeout(t);
  }, [fetchItems]);

  const handleItemFilterChange = (f) => { setItemFilters(f); setItemPage(0); };

  if (fileLoading) {
    return <div className="container-fluid p-4"><LoadingSpinner text="Loading recon file..." /></div>;
  }

  if (fileError || !file) {
    return (
      <div className="container-fluid p-4">
        <ErrorAlert error={fileError || 'File not found'} title="Failed to load recon file" />
        <Link to="/reconciliation" className="btn btn-outline-secondary mt-2">
          <i className="bi bi-arrow-left me-1"></i>Back to Reconciliation
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex align-items-start mb-3">
        <Link to="/reconciliation" className="btn btn-link text-muted text-decoration-none p-0 me-2 mt-1" title="Back">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div className="flex-grow-1">
          <h3 className="mb-1">
            <i className="bi bi-file-earmark-text me-2"></i>
            Recon File #{file.reconFileId}
          </h3>
          <div className="d-flex flex-wrap gap-2 align-items-center text-muted small">
            <span className={`badge ${SOURCE_BADGE[file.source] || 'bg-secondary'}`}>{file.source}</span>
            <span>·</span>
            <span>{formatDate(file.fileDate)}</span>
            <span>·</span>
            <span>{formatNumber(file.rowCount)} rows</span>
          </div>
        </div>
        <div className="ms-3">
          <StatusBadge status={file.status} />
        </div>
      </div>

      {/* File metadata */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3 small">
            <div className="col-6 col-md-3">
              <div className="text-muted mb-1">File ID</div>
              <div className="font-monospace fw-semibold">#{file.reconFileId}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted mb-1">Source</div>
              <span className={`badge ${SOURCE_BADGE[file.source] || 'bg-secondary'}`}>{file.source}</span>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted mb-1">File Date</div>
              <div>{formatDate(file.fileDate)}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted mb-1">Loaded At</div>
              <div>{formatDateTime(file.loadedAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <ReconItemFilters filters={itemFilters} onChange={handleItemFilterChange} fileScope />

      <div className="card">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold small">
            <i className="bi bi-list-check me-2"></i>Items
          </span>
          <span className="text-muted small">{itemTotalElements} total</span>
        </div>
        <div className="card-body p-0">
          <ReconItemTable items={items} loading={itemsLoading} />
        </div>
        {itemTotalPages > 1 && (
          <div className="card-footer bg-white">
            <Pagination
              page={itemPage}
              totalPages={itemTotalPages}
              totalElements={itemTotalElements}
              pageSize={ITEM_PAGE_SIZE}
              onPageChange={setItemPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ReconFilePage;
