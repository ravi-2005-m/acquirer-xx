import { useState, useEffect, useCallback } from 'react';
import { reportsApi } from '../../api/reportsApi';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#0dcaf0', '#6f42c1'];

function KpiCard({ label, value, icon, variant = 'primary' }) {
  return (
    <div className="col">
      <div className={`card border-0 shadow-sm h-100`}>
        <div className="card-body d-flex align-items-center gap-3">
          <div className={`rounded-circle bg-${variant} bg-opacity-10 p-3`}>
            <i className={`bi ${icon} text-${variant} fs-5`}></i>
          </div>
          <div>
            <div className="text-muted small">{label}</div>
            <div className="fw-bold fs-5">{value ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children, loading }) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-white fw-semibold small">
        <i className={`bi ${icon} me-2`}></i>{title}
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          </div>
        ) : children}
      </div>
    </div>
  );
}

function fmt(n, decimals = 0) {
  if (n === undefined || n === null) return '—';
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: decimals });
}
function fmtCcy(n) {
  if (n === undefined || n === null) return '—';
  return '₹' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}
function pct(n) {
  if (n === undefined || n === null) return '—';
  return Number(n).toFixed(1) + '%';
}

export default function ReportsPage() {
  const [dash, setDash]       = useState(null);
  const [txn, setTxn]         = useState(null);
  const [settle, setSettle]   = useState(null);
  const [dispute, setDispute] = useState(null);
  const [risk, setRisk]       = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [d, t, s, disp, r, m] = await Promise.allSettled([
      reportsApi.getDashboardSummary(),
      reportsApi.getTransactionVolume(),
      reportsApi.getSettlementSummary(),
      reportsApi.getDisputeSummary(),
      reportsApi.getRiskSummary(),
      reportsApi.getMerchantAnalytics(),
    ]);
    setDash(d.status   === 'fulfilled' ? d.value   : {});
    setTxn(t.status    === 'fulfilled' ? t.value    : {});
    setSettle(s.status === 'fulfilled' ? s.value    : {});
    setDispute(disp.status === 'fulfilled' ? disp.value : {});
    setRisk(r.status   === 'fulfilled' ? r.value   : {});
    setMerchant(m.status === 'fulfilled' ? m.value : {});
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Chart data
  const txnBarData = txn ? [
    { name: 'Settled',   value: txn.settledTxns   ?? 0 },
    { name: 'Unsettled', value: txn.unsettledTxns ?? 0 },
  ] : [];

  const settlePieData = settle ? [
    { name: 'Ready',    value: settle.readyBatches   ?? 0 },
    { name: 'Paid',     value: settle.paidBatches    ?? 0 },
    { name: 'On Hold',  value: settle.onHoldBatches  ?? 0 },
  ] : [];

  const disputePieData = dispute ? [
    { name: 'Retrieval',      value: dispute.retrievalCount    ?? 0 },
    { name: 'Chargeback',     value: dispute.chargebackCount   ?? 0 },
    { name: 'Representment',  value: dispute.representmentCount ?? 0 },
    { name: 'Arbitration',    value: dispute.arbitrationCount  ?? 0 },
  ] : [];

  const riskBarData = risk ? [
    { name: 'Blocked',  value: risk.totalBlocked  ?? 0 },
    { name: 'Reviewed', value: risk.totalReviewed ?? 0 },
    { name: 'Allowed',  value: risk.totalAllowed  ?? 0 },
  ] : [];

  const merchantPieData = merchant ? [
    { name: 'Low',      value: merchant.lowRiskCount      ?? 0 },
    { name: 'Medium',   value: merchant.mediumRiskCount   ?? 0 },
    { name: 'High',     value: merchant.highRiskCount     ?? 0 },
    { name: 'Critical', value: merchant.criticalRiskCount ?? 0 },
  ] : [];

  const blacklistBarData = risk ? [
    { name: 'PAN',      value: risk.activePanBlacklist      ?? 0 },
    { name: 'Terminal', value: risk.activeTerminalBlacklist ?? 0 },
    { name: 'Merchant', value: risk.activeMerchantBlacklist ?? 0 },
  ] : [];

  return (
    <div className="container-fluid p-4">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="mb-1"><i className="bi bi-graph-up me-2"></i>Reports & Analytics</h3>
          <p className="text-muted small mb-0">Cross-service operational overview</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={loadAll}>
          <i className="bi bi-arrow-clockwise me-1"></i>Refresh
        </button>
      </div>

      {/* KPI Dashboard Summary */}
      <SectionCard title="Dashboard Summary" icon="bi-speedometer2" loading={loading && !dash}>
        <div className="row row-cols-2 row-cols-md-3 row-cols-xl-5 g-3">
          <KpiCard label="Total Merchants"     value={fmt(dash?.totalMerchants)}    icon="bi-shop"               variant="primary" />
          <KpiCard label="Active Merchants"    value={fmt(dash?.activeMerchants)}   icon="bi-check-circle"       variant="success" />
          <KpiCard label="Total Terminals"     value={fmt(dash?.totalTerminals)}    icon="bi-cpu"                variant="info" />
          <KpiCard label="Open Disputes"       value={fmt(dash?.openDisputes)}      icon="bi-exclamation-triangle" variant="warning" />
          <KpiCard label="Risk Events Today"   value={fmt(dash?.riskEventsToday)}   icon="bi-shield-exclamation" variant="danger" />
          <KpiCard label="Settlement Batches"  value={fmt(dash?.totalSettlementBatches)} icon="bi-cash-stack"   variant="primary" />
          <KpiCard label="Pending Settlements" value={fmt(dash?.pendingSettlements)} icon="bi-hourglass"        variant="warning" />
          <KpiCard label="Total Stores"        value={fmt(dash?.totalStores)}       icon="bi-building"           variant="secondary" />
          <KpiCard label="Risk Events Total"   value={fmt(dash?.totalRiskEvents)}   icon="bi-shield"             variant="danger" />
        </div>
      </SectionCard>

      <div className="row g-4">
        {/* Transaction Volume */}
        <div className="col-lg-6">
          <SectionCard title="Transaction Volume" icon="bi-receipt" loading={loading && !txn}>
            <div className="row g-3 mb-3">
              <div className="col-4 text-center">
                <div className="text-muted small">Total</div>
                <div className="fw-bold">{fmt(txn?.totalTxns)}</div>
              </div>
              <div className="col-4 text-center">
                <div className="text-muted small">Settled Amount</div>
                <div className="fw-bold text-success">{fmtCcy(txn?.settledAmount)}</div>
              </div>
              <div className="col-4 text-center">
                <div className="text-muted small">Total Fees</div>
                <div className="fw-bold text-warning">{fmtCcy(txn?.totalFees)}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={txnBarData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Settlement Summary */}
        <div className="col-lg-6">
          <SectionCard title="Settlement Summary" icon="bi-cash-stack" loading={loading && !settle}>
            <div className="row g-3 mb-3">
              <div className="col-4 text-center">
                <div className="text-muted small">Gross Amount</div>
                <div className="fw-bold">{fmtCcy(settle?.totalGrossAmount)}</div>
              </div>
              <div className="col-4 text-center">
                <div className="text-muted small">Net Amount</div>
                <div className="fw-bold text-success">{fmtCcy(settle?.totalNetAmount)}</div>
              </div>
              <div className="col-4 text-center">
                <div className="text-muted small">Fees</div>
                <div className="fw-bold text-warning">{fmtCcy(settle?.totalFees)}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={settlePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {settlePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Dispute Summary */}
        <div className="col-lg-6">
          <SectionCard title="Dispute Summary" icon="bi-exclamation-triangle" loading={loading && !dispute}>
            <div className="row g-3 mb-3">
              <div className="col-4 text-center">
                <div className="text-muted small">Total</div>
                <div className="fw-bold">{fmt(dispute?.totalDisputes)}</div>
              </div>
              <div className="col-4 text-center">
                <div className="text-muted small">Open</div>
                <div className="fw-bold text-danger">{fmt(dispute?.openDisputes)}</div>
              </div>
              <div className="col-4 text-center">
                <div className="text-muted small">Closed</div>
                <div className="fw-bold text-success">{fmt(dispute?.closedDisputes)}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={disputePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {disputePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Risk Summary */}
        <div className="col-lg-6">
          <SectionCard title="Risk Summary" icon="bi-shield-exclamation" loading={loading && !risk}>
            <div className="row g-3 mb-3">
              <div className="col-3 text-center">
                <div className="text-muted small">Block Rate</div>
                <div className="fw-bold text-danger">{pct(risk?.blockRate)}</div>
              </div>
              <div className="col-3 text-center">
                <div className="text-muted small">Active Rules</div>
                <div className="fw-bold">{fmt(risk?.activeRules)}</div>
              </div>
              <div className="col-3 text-center">
                <div className="text-muted small">Today Events</div>
                <div className="fw-bold text-warning">{fmt(risk?.todayRiskEvents)}</div>
              </div>
              <div className="col-3 text-center">
                <div className="text-muted small">Today Blocked</div>
                <div className="fw-bold text-danger">{fmt(risk?.todayBlocked)}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskBarData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {riskBarData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Merchant Risk Distribution */}
        <div className="col-lg-6">
          <SectionCard title="Merchant Risk Distribution" icon="bi-shop" loading={loading && !merchant}>
            <div className="row g-3 mb-3">
              <div className="col-6 text-center">
                <div className="text-muted small">Total Merchants</div>
                <div className="fw-bold">{fmt(merchant?.totalMerchants)}</div>
              </div>
              <div className="col-6 text-center">
                <div className="text-muted small">Active</div>
                <div className="fw-bold text-success">{fmt(merchant?.activeMerchants)}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={merchantPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {merchantPieData.map((_, i) => <Cell key={i} fill={[COLORS[1], COLORS[3], COLORS[2], COLORS[0]][i % 4]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Blacklist Stats */}
        <div className="col-lg-6">
          <SectionCard title="Active Blacklists" icon="bi-ban" loading={loading && !risk}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={blacklistBarData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[2]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
