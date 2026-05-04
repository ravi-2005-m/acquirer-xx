import { useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { formatCurrency, formatDate, maskPan } from '../../utils/formatters';

function ComponentsDemo() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConfirming(false);
    setShowConfirm(false);
  };

  return (
    <div className="container-fluid p-4">
      <h3 className="mb-4">Components Library Demo</h3>

      <div className="card mb-3">
        <div className="card-body">
          <h6>LoadingSpinner</h6>
          <div className="border rounded p-2 mb-2">
            <LoadingSpinner text="Loading merchants..." />
          </div>
          <div className="border rounded p-2">
            <LoadingSpinner size="sm" text="Saving..." />
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h6>ErrorAlert</h6>
          <ErrorAlert error="Failed to fetch merchants" onRetry={() => alert('Retry!')} />
          <ErrorAlert
            error={{ response: { data: { message: 'Backend says: Database busy' } } }}
            title="Server Error"
            dismissible
            onDismiss={() => alert('Dismissed!')}
          />
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h6>StatusBadge</h6>
          <div className="d-flex flex-wrap gap-2">
            <StatusBadge status="ACTIVE" />
            <StatusBadge status="INACTIVE" />
            <StatusBadge status="PENDING" />
            <StatusBadge status="SUSPENDED" />
            <StatusBadge status="COMPLETED" />
            <StatusBadge status="FAILED" />
            <StatusBadge status="PROCESSING" />
            <StatusBadge status="CANCELLED" />
            <StatusBadge status="UNKNOWN_STATUS" />
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h6>EmptyState</h6>
          <EmptyState
            icon="bi-people"
            title="No merchants yet"
            message="Add your first merchant to get started."
            actionLabel="Add Merchant"
            onAction={() => alert('Add merchant clicked!')}
          />
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h6>Formatters</h6>
          <table className="table table-sm">
            <tbody>
              <tr>
                <td>formatCurrency(1234.56)</td>
                <td>{formatCurrency(1234.56)}</td>
              </tr>
              <tr>
                <td>formatDate('2026-04-28T10:30:00')</td>
                <td>{formatDate('2026-04-28T10:30:00')}</td>
              </tr>
              <tr>
                <td>maskPan('4532123456789012')</td>
                <td>{maskPan('4532123456789012')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <h6>Pagination (page = {page}, pageSize = {pageSize})</h6>
          <Pagination
            page={page}
            totalPages={10}
            totalElements={200}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h6>ConfirmModal</h6>
          <button onClick={() => setShowConfirm(true)} className="btn btn-danger">
            <i className="bi bi-trash me-1"></i>
            Delete Merchant
          </button>
          <ConfirmModal
            show={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={handleConfirm}
            title="Delete Merchant"
            message="This action cannot be undone. The merchant and all related data will be removed."
            confirmLabel="Delete"
            loading={confirming}
          />
        </div>
      </div>
    </div>
  );
}

export default ComponentsDemo;
