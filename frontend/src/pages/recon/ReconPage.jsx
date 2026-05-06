import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reconApi } from '../../api/reconApi';
import { toBackendDateTime } from '../../utils/formatters';
import ReconSummaryPanel from '../../components/recon/ReconSummaryPanel';
import MatchRateDonut from '../../components/recon/MatchRateDonut';
import ReconFileFilters from '../../components/recon/ReconFileFilters';
import ReconFileTable from '../../components/recon/ReconFileTable';
import ReconItemFilters from '../../components/recon/ReconItemFilters';
import ReconItemTable from '../../components/recon/ReconItemTable';
import ReconExceptionFilters from '../../components/recon/ReconExceptionFilters';
import ReconExceptionTable from '../../components/recon/ReconExceptionTable';
import LoadReconFileModal from '../../components/recon/LoadReconFileModal';
import ResolveExceptionModal from '../../components/recon/ResolveExceptionModal';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 10;
const ITEM_PAGE_SIZE = 20;

function ReconPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'RECON' || user?.role === 'ADMIN';

  const [tab, setTab] = useState('files');

  const [summary, setSummary]             = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Files tab
  const [fileFilters, setFileFilters]     = useState({ source: '', fileStatus: '', fromDate: '', toDate: '' });
  const [filePage, setFilePage]           = useState(0);
  const [files, setFiles]                 = useState([]);
  const [fileTotalPages, setFileTotalPages]     = useState(0);
  const [fileTotalElements, setFileTotalElements] = useState(0);
  const [filesLoading, setFilesLoading]   = useState(false);

  // Items tab
  const [itemFilters, setItemFilters]     = useState({ matchStatus: '', source: '', reconFileId: '' });
  const [itemPage, setItemPage]           = useState(0);
  const [items, setItems]                 = useState([]);
  const [itemTotalPages, setItemTotalPages]     = useState(0);
  const [itemTotalElements, setItemTotalElements] = useState(0);
  const [itemsLoading, setItemsLoading]   = useState(false);

  // Exceptions tab
  const [excFilters, setExcFilters]       = useState({ exceptionStatus: 'OPEN', category: '' });
  const [excPage, setExcPage]             = useState(0);
  const [exceptions, setExceptions]       = useState([]);
  const [excTotalPages, setExcTotalPages]     = useState(0);
  const [excTotalElements, setExcTotalElements] = useState(0);
  const [excLoading, setExcLoading]       = useState(false);

  const [showLoadModal, setShowLoadModal]         = useState(false);
  const [resolvingException, setResolvingException] = useState(null);

  // Summary
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await reconApi.getSummary();
      setSummary(res.data?.data ?? res.data ?? null);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  // Files tab loader
  const loadFiles = useCallback(async () => {
    setFilesLoading(true);
    try {
      const search = {};
      if (fileFilters.source)      search.source     = fileFilters.source;
      if (fileFilters.fileStatus)  search.fileStatus = fileFilters.fileStatus;
      if (fileFilters.fromDate)    search.fromDate   = toBackendDateTime(fileFilters.fromDate, false);
      if (fileFilters.toDate)      search.toDate     = toBackendDateTime(fileFilters.toDate,   true);

      const pagination = { page: filePage, size: PAGE_SIZE };
      const hasFilters = Object.keys(search).length > 0;

      const res  = hasFilters
        ? await reconApi.searchFiles(search, pagination)
        : await reconApi.getFiles(pagination);
      const body = res.data?.data ?? res.data ?? {};

      setFiles(body.content ?? []);
      setFileTotalPages(body.totalPages ?? 0);
      setFileTotalElements(body.totalElements ?? 0);
    } catch {
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, [fileFilters, filePage]);

  useEffect(() => {
    if (tab !== 'files') return;
    const t = setTimeout(loadFiles, 300);
    return () => clearTimeout(t);
  }, [tab, loadFiles]);

  // Items tab loader
  const loadItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const search = {};
      if (itemFilters.matchStatus) search.matchStatus = itemFilters.matchStatus;
      if (itemFilters.source)      search.source      = itemFilters.source;
      if (itemFilters.reconFileId) search.reconFileId = itemFilters.reconFileId;

      const pagination = { page: itemPage, size: ITEM_PAGE_SIZE };
      const res  = await reconApi.searchItems(search, pagination);
      const body = res.data?.data ?? res.data ?? {};

      setItems(body.content ?? []);
      setItemTotalPages(body.totalPages ?? 0);
      setItemTotalElements(body.totalElements ?? 0);
    } catch {
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, [itemFilters, itemPage]);

  useEffect(() => {
    if (tab !== 'items') return;
    const t = setTimeout(loadItems, 300);
    return () => clearTimeout(t);
  }, [tab, loadItems]);

  // Exceptions tab loader
  const loadExceptions = useCallback(async () => {
    setExcLoading(true);
    try {
      const search = {};
      if (excFilters.exceptionStatus) search.exceptionStatus = excFilters.exceptionStatus;
      if (excFilters.category)        search.category        = excFilters.category;

      const pagination = { page: excPage, size: PAGE_SIZE };
      const hasFilters = Object.keys(search).length > 0;

      let res;
      if (hasFilters) {
        res = await reconApi.searchExceptions(search, pagination);
      } else if (excFilters.exceptionStatus === 'OPEN') {
        res = await reconApi.getOpenExceptions(pagination);
      } else {
        res = await reconApi.getExceptions(pagination);
      }

      const body = res.data?.data ?? res.data ?? {};
      setExceptions(body.content ?? []);
      setExcTotalPages(body.totalPages ?? 0);
      setExcTotalElements(body.totalElements ?? 0);
    } catch {
      setExceptions([]);
    } finally {
      setExcLoading(false);
    }
  }, [excFilters, excPage]);

  useEffect(() => {
    if (tab !== 'exceptions') return;
    const t = setTimeout(loadExceptions, 300);
    return () => clearTimeout(t);
  }, [tab, loadExceptions]);

  const handleFileFilterChange = (f) => { setFileFilters(f); setFilePage(0); };
  const handleItemFilterChange = (f) => { setItemFilters(f); setItemPage(0); };
  const handleExcFilterChange  = (f) => { setExcFilters(f);  setExcPage(0); };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="mb-1"><i className="bi bi-clipboard-check me-2"></i>Reconciliation</h3>
          <p className="text-muted small mb-0">Match switch, network, and bank records</p>
        </div>
        {canManage && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowLoadModal(true)}>
            <i className="bi bi-upload me-1"></i>Load Recon File
          </button>
        )}
      </div>

      <ReconSummaryPanel summary={summary} loading={summaryLoading} />

      {/* Match rate donut */}
      {summary && (
        <div className="card mb-4">
          <div className="card-header bg-white">
            <span className="fw-semibold small">
              <i className="bi bi-pie-chart me-2"></i>Match Rate Distribution
            </span>
          </div>
          <div className="card-body">
            <MatchRateDonut summary={summary} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {[
          { key: 'files',      label: 'Files',      badge: summary?.totalFiles,     badgeColor: 'bg-secondary' },
          { key: 'items',      label: 'Items',      badge: summary?.totalItems,     badgeColor: 'bg-secondary' },
          { key: 'exceptions', label: 'Exceptions', badge: summary?.openExceptions, badgeColor: 'bg-warning text-dark' },
        ].map(t => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.badge != null && (
                <span className={`badge ${t.badgeColor} ms-2`}>{t.badge}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Files tab */}
      {tab === 'files' && (
        <>
          <ReconFileFilters filters={fileFilters} onChange={handleFileFilterChange} />
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold small"><i className="bi bi-file-earmark-text me-2"></i>Recon Files</span>
              <span className="text-muted small">{fileTotalElements} total</span>
            </div>
            <div className="card-body p-0">
              <ReconFileTable files={files} loading={filesLoading} />
            </div>
            {fileTotalPages > 1 && (
              <div className="card-footer bg-white">
                <Pagination
                  page={filePage}
                  totalPages={fileTotalPages}
                  totalElements={fileTotalElements}
                  pageSize={PAGE_SIZE}
                  onPageChange={setFilePage}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Items tab */}
      {tab === 'items' && (
        <>
          <ReconItemFilters filters={itemFilters} onChange={handleItemFilterChange} />
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold small"><i className="bi bi-list-check me-2"></i>Recon Items</span>
              <span className="text-muted small">{itemTotalElements} total</span>
            </div>
            <div className="card-body p-0">
              <ReconItemTable items={items} loading={itemsLoading} showFileColumn />
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
        </>
      )}

      {/* Exceptions tab */}
      {tab === 'exceptions' && (
        <>
          <ReconExceptionFilters filters={excFilters} onChange={handleExcFilterChange} />
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold small"><i className="bi bi-exclamation-triangle me-2"></i>Exceptions</span>
              <span className="text-muted small">{excTotalElements} total</span>
            </div>
            <div className="card-body p-0">
              <ReconExceptionTable
                exceptions={exceptions}
                loading={excLoading}
                canResolve={canManage}
                onResolve={setResolvingException}
              />
            </div>
            {excTotalPages > 1 && (
              <div className="card-footer bg-white">
                <Pagination
                  page={excPage}
                  totalPages={excTotalPages}
                  totalElements={excTotalElements}
                  pageSize={PAGE_SIZE}
                  onPageChange={setExcPage}
                />
              </div>
            )}
          </div>
        </>
      )}

      <LoadReconFileModal
        show={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onLoaded={() => { setShowLoadModal(false); loadFiles(); loadSummary(); }}
      />

      <ResolveExceptionModal
        show={!!resolvingException}
        exception={resolvingException}
        onClose={() => setResolvingException(null)}
        onResolved={() => { setResolvingException(null); loadExceptions(); loadSummary(); }}
      />
    </div>
  );
}

export default ReconPage;
