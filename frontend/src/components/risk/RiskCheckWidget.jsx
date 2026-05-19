import { useState } from 'react';
import { riskApi } from '../../api/riskApi';
import RiskResultBadge from './RiskResultBadge';
import { maskPan } from '../../utils/formatters';

const INITIAL = { pan: '', amount: '', terminalId: '' };

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
        panMasked: form.pan        ? maskPan(form.pan)    : undefined,
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
            <div className="col-md-4">
              <label className="form-label small mb-1">PAN</label>
              <input
                className="form-control form-control-sm font-monospace"
                placeholder="4111111111111111"
                value={form.pan}
                maxLength={19}
                onChange={e => set('pan', e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control form-control-sm"
                placeholder="0.00"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small mb-1">Terminal ID</label>
              <input
                className="form-control form-control-sm"
                placeholder="optional"
                value={form.terminalId}
                onChange={e => set('terminalId', e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary btn-sm w-100" disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-1" />Checking...</>
                  : <><i className="bi bi-search me-1" />Check Risk</>
                }
              </button>
            </div>
          </div>

          {(result || error) && (
            <div className="mt-3 pt-3 border-top d-flex align-items-center gap-3 flex-wrap">
              {result && (
                <>
                  <RiskResultBadge result={result.result} />
                  {result.score != null && (
                    <span className="small text-muted">
                      Score: <strong>{result.score}</strong>
                    </span>
                  )}
                  {result.reason && (
                    <span className="small text-muted fst-italic">{result.reason}</span>
                  )}
                </>
              )}
              {error && <span className="small text-danger">{error}</span>}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default RiskCheckWidget;
