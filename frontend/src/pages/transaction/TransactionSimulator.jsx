import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionApi } from '../../api/transactionApi';
import { terminalApi } from '../../api/terminalApi';
import { authorizeSchema } from '../../schemas/transactionSchemas';
import EntitySelect from '../../components/common/EntitySelect';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const fetchTerminalOptions = ({ search }) =>
  terminalApi.search(
    { tid: search || undefined, status: 'ACTIVE' },
    { size: 30 }
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return body.content ?? (Array.isArray(body) ? body : []);
  });

function TransactionSimulator() {
  const [result, setResult]       = useState(null);
  const [batchError, setBatchError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(authorizeSchema),
    defaultValues: { currency: 'INR', txnType: 'SALE' },
  });

  const onSubmit = async (data) => {
    setBatchError('');
    setSubmitting(true);
    const idempotencyKey = `auth-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    try {
      const res = await transactionApi.authorize(data, idempotencyKey);
      setResult(res.data?.data ?? res.data);
    } catch (err) {
      const msg = (err?.response?.data?.message || '').toLowerCase();
      if (msg.includes('batch')) {
        setBatchError('No open batch on this terminal. Open a batch first from the terminal detail page.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const approved = result.status === 'APPROVED';
    return (
      <div className="container-fluid p-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Link to="/transactions" className="btn btn-link text-muted text-decoration-none p-0">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <h3 className="mb-0"><i className="bi bi-credit-card me-2"></i>Transaction Result</h3>
        </div>

        <div className={`alert ${approved ? 'alert-success' : 'alert-danger'} d-flex align-items-center gap-3 mb-4`}>
          <i className={`bi ${approved ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} fs-2`}></i>
          <div>
            <div className="fw-bold fs-5">{result.status}</div>
            <div className="small">
              {approved ? 'Transaction authorized successfully' : 'Transaction was declined'}
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="text-muted text-uppercase small fw-semibold mb-3">Authorization</h6>
                <dl className="row mb-0 small">
                  <dt className="col-5 text-muted">Auth ID</dt>
                  <dd className="col-7">#{result.authId}</dd>
                  <dt className="col-5 text-muted">Auth Code</dt>
                  <dd className="col-7"><code>{result.authCode || '—'}</code></dd>
                  <dt className="col-5 text-muted">Response Code</dt>
                  <dd className="col-7"><code>{result.responseCode}</code></dd>
                  <dt className="col-5 text-muted">Amount</dt>
                  <dd className="col-7 fw-semibold">{formatCurrency(result.amount, result.currency)}</dd>
                  <dt className="col-5 text-muted">PAN</dt>
                  <dd className="col-7 font-monospace">{result.panMasked}</dd>
                  <dt className="col-5 text-muted">Time</dt>
                  <dd className="col-7">{formatDateTime(result.txnTime)}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="text-muted text-uppercase small fw-semibold mb-3">Risk & Terminal</h6>
                <dl className="row mb-0 small">
                  <dt className="col-5 text-muted">Risk Score</dt>
                  <dd className="col-7">{result.riskScore ?? '—'}</dd>
                  <dt className="col-5 text-muted">Risk Reason</dt>
                  <dd className="col-7">{result.riskReason || '—'}</dd>
                  <dt className="col-5 text-muted">TID</dt>
                  <dd className="col-7"><code>{result.tid || '—'}</code></dd>
                  <dt className="col-5 text-muted">Merchant</dt>
                  <dd className="col-7">{result.merchantName || '—'}</dd>
                  <dt className="col-5 text-muted">Network</dt>
                  <dd className="col-7">
                    <span className="badge bg-light text-dark border">{result.network}</span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <Link to="/transactions" className="btn btn-outline-secondary">
            <i className="bi bi-list me-1"></i>View Transactions List
          </Link>
          <button className="btn btn-primary" onClick={() => { setResult(null); reset(); setBatchError(''); }}>
            <i className="bi bi-plus-circle me-1"></i>Authorize Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Link to="/transactions" className="btn btn-link text-muted text-decoration-none p-0">
          <i className="bi bi-arrow-left"></i>
        </Link>
        <div>
          <h3 className="mb-0"><i className="bi bi-credit-card me-2"></i>New Transaction</h3>
          <p className="text-muted small mb-0">Simulate a POS authorization</p>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 col-lg-5">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <div className="mb-3">
                  <label className="form-label">
                    Terminal <span className="text-danger">*</span>
                  </label>
                  <Controller
                    name="terminalId"
                    control={control}
                    render={({ field }) => (
                      <EntitySelect
                        value={field.value ? String(field.value) : ''}
                        onChange={(id) => field.onChange(id ? Number(id) : null)}
                        fetchOptions={fetchTerminalOptions}
                        getOptionLabel={t =>
                          `${t.tid} — ${t.brandModel || 'Unknown'} — ${t.storeName || `Store #${t.storeId}`}`
                        }
                        getOptionId={t => t.terminalId}
                        placeholder="Select active terminal..."
                        error={errors.terminalId?.message}
                      />
                    )}
                  />
                  {errors.terminalId && (
                    <div className="text-danger small mt-1">{errors.terminalId.message}</div>
                  )}
                </div>

                <FormInput
                  label="Amount (₹)"
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 1500.00"
                  required
                  hint="Max ₹50,000 — amounts above will be declined"
                  error={errors.amount?.message}
                  {...register('amount', { valueAsNumber: true })}
                />

                <FormInput
                  label="Currency"
                  id="currency"
                  readOnly
                  {...register('currency')}
                />

                <FormInput
                  label="PAN (Masked)"
                  id="panMasked"
                  placeholder="e.g. 699006X*X*4178"
                  required
                  hint="Digits, * and X only (13–20 characters)"
                  error={errors.panMasked?.message}
                  {...register('panMasked')}
                />

                <FormSelect
                  label="Transaction Type"
                  id="txnType"
                  required
                  options={[{ value: 'SALE', label: 'SALE' }]}
                  {...register('txnType')}
                />

                {batchError && (
                  <div className="alert alert-warning d-flex gap-2 align-items-start py-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill mt-1 flex-shrink-0"></i>
                    <div className="small">{batchError}</div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Authorizing...</>
                  ) : (
                    <><i className="bi bi-send me-1"></i>Authorize Transaction</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionSimulator;
