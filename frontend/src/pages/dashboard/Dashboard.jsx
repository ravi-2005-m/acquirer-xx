import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard';
import QuickActions from '../../components/dashboard/QuickActions';
import {
  fetchMerchantStats,
  fetchTransactionStats,
  fetchTerminalStats,
  fetchDisputeStats,
  fetchSettlementStats,
  fetchReconStats,
} from '../../api/statsApi';

const INIT = { loading: true, error: false, data: null };

function extract(data, ...keys) {
  if (!data) return null;
  for (const key of keys) {
    if (data[key] != null) return data[key];
  }
  return null;
}

function Dashboard() {
  const { user } = useAuth();

  const [merchants,    setMerchants]    = useState(INIT);
  const [transactions, setTransactions] = useState(INIT);
  const [terminals,    setTerminals]    = useState(INIT);
  const [disputes,     setDisputes]     = useState(INIT);
  const [settlements,  setSettlements]  = useState(INIT);
  const [recon,        setRecon]        = useState(INIT);

  const load = useCallback((fetcher, setter) => {
    setter(INIT);
    fetcher()
      .then(data => setter({ loading: false, error: false, data }))
      .catch(() => setter({ loading: false, error: true, data: null }));
  }, []);

  const fetchAll = useCallback(() => {
    load(fetchMerchantStats,    setMerchants);
    load(fetchTransactionStats, setTransactions);
    load(fetchTerminalStats,    setTerminals);
    load(fetchDisputeStats,     setDisputes);
    load(fetchSettlementStats,  setSettlements);
    load(fetchReconStats,       setRecon);
  }, [load]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-4">
        <h4 className="mb-1">
          <i className="bi bi-speedometer2 me-2 text-primary"></i>
          Welcome, {user?.fullName || user?.username}
          <span className="badge bg-secondary text-uppercase ms-2 fs-6 fw-normal align-middle">
            {user?.role}
          </span>
        </h4>
        <p className="text-muted small mb-0">Today: {today}</p>
      </div>

      {/* Stats grid — 6 independent cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <StatsCard
            icon="bi-people"
            label="Merchants"
            color="primary"
            loading={merchants.loading}
            error={merchants.error ? 'Service unavailable' : null}
            value={extract(merchants.data, 'totalMerchants', 'total', 'count')}
            subtitle={extract(merchants.data, 'activeMerchants', 'active') != null
              ? `${Number(extract(merchants.data, 'activeMerchants', 'active')).toLocaleString()} active`
              : null}
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <StatsCard
            icon="bi-receipt"
            label="Transactions"
            color="success"
            loading={transactions.loading}
            error={transactions.error ? 'Service unavailable' : null}
            value={extract(transactions.data, 'totalTransactions', 'total', 'count')}
            subtitle={extract(transactions.data, 'today', 'todayCount') != null
              ? `${Number(extract(transactions.data, 'today', 'todayCount')).toLocaleString()} today`
              : null}
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <StatsCard
            icon="bi-printer"
            label="POS Terminals"
            color="info"
            loading={terminals.loading}
            error={terminals.error ? 'Service unavailable' : null}
            value={extract(terminals.data, 'totalTerminals', 'total', 'count')}
            subtitle={extract(terminals.data, 'activeTerminals', 'active') != null
              ? `${Number(extract(terminals.data, 'activeTerminals', 'active')).toLocaleString()} active`
              : null}
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <StatsCard
            icon="bi-chat-left-text"
            label="Active Disputes"
            color="warning"
            loading={disputes.loading}
            error={disputes.error ? 'Service unavailable' : null}
            value={extract(disputes.data, 'openDisputes', 'active', 'count')}
            subtitle={extract(disputes.data, 'totalDisputes', 'total') != null
              ? `${Number(extract(disputes.data, 'totalDisputes', 'total')).toLocaleString()} total`
              : null}
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <StatsCard
            icon="bi-bank"
            label="Pending Settlements"
            color="primary"
            loading={settlements.loading}
            error={settlements.error ? 'Service unavailable' : null}
            value={extract(settlements.data, 'readyBatches', 'pendingCount', 'count')}
            subtitle={extract(settlements.data, 'totalBatches', 'total') != null
              ? `${Number(extract(settlements.data, 'totalBatches', 'total')).toLocaleString()} this month`
              : null}
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <StatsCard
            icon="bi-clipboard-check"
            label="Recon Alerts"
            color="danger"
            loading={recon.loading}
            error={recon.error ? 'Service unavailable' : null}
            value={extract(recon.data, 'openExceptions', 'alertCount', 'alerts')}
            subtitle={extract(recon.data, 'matchedItems', 'matched') != null
              ? `${Number(extract(recon.data, 'matchedItems', 'matched')).toLocaleString()} matched`
              : null}
          />
        </div>
      </div>

      {/* Role-filtered quick actions + refresh */}
      <QuickActions onRefresh={fetchAll} />
    </div>
  );
}

export default Dashboard;
