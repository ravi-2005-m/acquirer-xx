import { useState } from 'react';
import { riskApi } from '../../api/riskApi';
import RiskResultBadge from './RiskResultBadge';
import { formatCurrency } from '../../utils/formatters';

const INITIAL = { pan: '', merchantId: '', amount: '', currency: 'USD', terminalId: '', txnType: 'PURCHASE' };

const TXN_TYPES = ['PURCHASE', 'REFUND', 'CASH_ADVANCE', 'BALANCE_INQUIRY'];

function RiskCheckWidget() {
  const [form, setForm]       = useState(INITIAL);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params = {
        amount:    parseFloat(form.amount),
        panMasked: form.pan       || undefined,
        tid:       form.terminalId || undefined,
      };
      const res  = await riskApi.checkRisk(params);
      const body = res.data?.data ?? res.data ?? {};
      setResult(body);
    } catch (err) {
      setError(err.response?.data?.message || 'Risk check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <span className="fw-semibold small">
          <i className="bi bi-radar me-2"></i>Manual Risk Check
        </span>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-2">
            <div className="col-md-3">
              <label className="form-label small mb-1">PAN / Token</label>
              <input
                className="form-control form-control-sm font-monospace"
                placeholder="4111111111111111"
                value={form.pan}
                onChange={e => set('pan', e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small mb-1">Merchant ID</label>
              <input
                className="form-control form-control-sm"
                placeholder="12345"
                value={form.merchantId}
                onChange={e => set('merchantId', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control form-control-sm"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                required
              />
            </div>
            <div className="col-md-1">
              <label className="form-label small mb-1">Currency</label>
              <input
                className="form-control form-control-sm"
                maxLength={3}
                value={form.currency}
                onChange={e => set('currency', e.target.value.toUpperCase())}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small mb-1">Txn Type</label>
              <select
                className="form-select form-select-sm"
                value={form.txnType}
                onChange={e => set('txnType', e.target.value)}
              >
                {TXN_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small mb-1">Terminal ID</label>
              <input
                className="form-control form-control-sm"
                placeholder="optional"
                value={form.terminalId}
                onChange={e => set('terminalId', e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 mt-3">
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-1" />Checking...</>
                : <><i className="bi bi-search me-1" />Check Risk</>
              }
            </button>
            {result && (
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <RiskResultBadge result={result.decision ?? result.result} />
                {result.riskScore != null && (
                  <span className="small text-muted">
                    Score: <strong>{result.riskScore}</strong>
                  </span>
                )}
                {result.triggeredRules?.length > 0 && (
                  <span className="small text-muted">
                    Rules: <strong>{result.triggeredRules.join(', ')}</strong>
                  </span>
                )}
                {result.reason && (
                  <span className="small text-muted fst-italic">{result.reason}</span>
                )}
              </div>
            )}
            {error && <span className="small text-danger">{error}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default RiskCheckWidget;
