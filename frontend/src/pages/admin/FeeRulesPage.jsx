import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { feeRulesApi } from '../../api/feeRulesApi';
import { feeRuleSchema } from '../../schemas/feeRuleSchema';
import { toast } from '../../utils/toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import FormInput from '../../components/form/FormInput';
import FormSelect from '../../components/form/FormSelect';

const NETWORK_OPTIONS = [
  { value: '',         label: 'Any' },
  { value: 'V',        label: 'Visa (V)' },
  { value: 'M',        label: 'Mastercard (M)' },
  { value: 'U',        label: 'UnionPay (U)' },
  { value: 'LocalSim', label: 'LocalSim' },
];

const REGION_OPTIONS = [
  { value: '',     label: 'Any' },
  { value: 'NA',   label: 'NA' },
  { value: 'EU',   label: 'EU' },
  { value: 'APAC', label: 'APAC' },
  { value: 'LATAM',label: 'LATAM' },
];

const DEFAULT_VALUES = {
  cardType: '', transactionType: '',
  schemePercentage: '', interchangePercentage: '', acquirerMarkupPercentage: '',
  mccPattern: '', region: '', minAmount: '', maxAmount: '',
  network: '', priority: 100, effectiveFrom: '', effectiveTo: '',
};

function toLocalDt(iso) {
  return iso ? iso.slice(0, 16) : '';
}

function buildPayload(data) {
  return {
    cardType:                 data.cardType,
    transactionType:          data.transactionType,
    schemePercentage:         data.schemePercentage,
    interchangePercentage:    data.interchangePercentage,
    acquirerMarkupPercentage: data.acquirerMarkupPercentage,
    mccPattern:  data.mccPattern  || null,
    region:      data.region      || null,
    network:     data.network     || null,
    minAmount:   data.minAmount   ?? null,
    maxAmount:   data.maxAmount   ?? null,
    priority:    data.priority,
    effectiveFrom: data.effectiveFrom ? `${data.effectiveFrom}:00` : null,
    effectiveTo:   data.effectiveTo   ? `${data.effectiveTo}:00`   : null,
  };
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function FeeRuleModal({ show, editRule, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(feeRuleSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!show) return;
    if (editRule) {
      reset({
        cardType:                editRule.cardType                ?? '',
        transactionType:         editRule.transactionType         ?? '',
        schemePercentage:        editRule.schemePercentage        ?? '',
        interchangePercentage:   editRule.interchangePercentage   ?? '',
        acquirerMarkupPercentage: editRule.acquirerMarkupPercentage ?? '',
        mccPattern:  editRule.mccPattern  ?? '',
        region:      editRule.region      ?? '',
        minAmount:   editRule.minAmount   ?? '',
        maxAmount:   editRule.maxAmount   ?? '',
        network:     editRule.network     ?? '',
        priority:    editRule.priority    ?? 100,
        effectiveFrom: toLocalDt(editRule.effectiveFrom),
        effectiveTo:   toLocalDt(editRule.effectiveTo),
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [show, editRule, reset]);

  const onSubmit = async (data) => {
    const payload = buildPayload(data);
    try {
      if (editRule) {
        await feeRulesApi.update(editRule.feeRuleId, payload);
        toast.success('Fee rule updated');
      } else {
        await feeRulesApi.create(payload);
        toast.success('Fee rule created');
      }
      onSaved();
    } catch {
      // interceptor handles error toast
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title fw-semibold">
                <i className="bi bi-percent me-2"></i>
                {editRule ? `Edit Rule #${editRule.feeRuleId}` : 'New Fee Rule'}
              </h6>
              <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-md-6">
                    <FormInput
                      id="fr-cardType"
                      label="Card Type"
                      required
                      placeholder="e.g. CREDIT, DEBIT"
                      error={errors.cardType?.message}
                      disabled={isSubmitting}
                      {...register('cardType')}
                    />
                  </div>
                  <div className="col-md-6">
                    <FormInput
                      id="fr-txnType"
                      label="Transaction Type"
                      required
                      placeholder="e.g. SALE, REFUND"
                      error={errors.transactionType?.message}
                      disabled={isSubmitting}
                      {...register('transactionType')}
                    />
                  </div>

                  <div className="col-md-4">
                    <FormInput
                      id="fr-scheme"
                      label="Scheme %"
                      type="number"
                      step="0.0001"
                      min="0"
                      required
                      error={errors.schemePercentage?.message}
                      disabled={isSubmitting}
                      {...register('schemePercentage', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-md-4">
                    <FormInput
                      id="fr-interchange"
                      label="Interchange %"
                      type="number"
                      step="0.0001"
                      min="0"
                      required
                      error={errors.interchangePercentage?.message}
                      disabled={isSubmitting}
                      {...register('interchangePercentage', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-md-4">
                    <FormInput
                      id="fr-markup"
                      label="Acquirer Markup %"
                      type="number"
                      step="0.0001"
                      min="0"
                      required
                      error={errors.acquirerMarkupPercentage?.message}
                      disabled={isSubmitting}
                      {...register('acquirerMarkupPercentage', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="col-md-4">
                    <FormSelect
                      id="fr-network"
                      label="Network"
                      options={NETWORK_OPTIONS}
                      error={errors.network?.message}
                      disabled={isSubmitting}
                      {...register('network')}
                    />
                  </div>
                  <div className="col-md-4">
                    <FormSelect
                      id="fr-region"
                      label="Region"
                      options={REGION_OPTIONS}
                      error={errors.region?.message}
                      disabled={isSubmitting}
                      {...register('region')}
                    />
                  </div>
                  <div className="col-md-4">
                    <FormInput
                      id="fr-mcc"
                      label="MCC Pattern"
                      placeholder="e.g. 5411 or 54*"
                      hint="Exact or wildcard prefix (54*)"
                      error={errors.mccPattern?.message}
                      disabled={isSubmitting}
                      {...register('mccPattern')}
                    />
                  </div>

                  <div className="col-md-4">
                    <FormInput
                      id="fr-minAmount"
                      label="Min Amount"
                      type="number"
                      step="0.01"
                      min="0"
                      error={errors.minAmount?.message}
                      disabled={isSubmitting}
                      {...register('minAmount', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-md-4">
                    <FormInput
                      id="fr-maxAmount"
                      label="Max Amount"
                      type="number"
                      step="0.01"
                      min="0"
                      error={errors.maxAmount?.message}
                      disabled={isSubmitting}
                      {...register('maxAmount', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-md-4">
                    <FormInput
                      id="fr-priority"
                      label="Priority"
                      type="number"
                      min="1"
                      max="999"
                      hint="1 = highest priority"
                      error={errors.priority?.message}
                      disabled={isSubmitting}
                      {...register('priority', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="col-md-6">
                    <FormInput
                      id="fr-effectiveFrom"
                      label="Effective From"
                      type="datetime-local"
                      error={errors.effectiveFrom?.message}
                      disabled={isSubmitting}
                      {...register('effectiveFrom')}
                    />
                  </div>
                  <div className="col-md-6">
                    <FormInput
                      id="fr-effectiveTo"
                      label="Effective To"
                      type="datetime-local"
                      error={errors.effectiveTo?.message}
                      disabled={isSubmitting}
                      {...register('effectiveTo')}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Saving…</>
                  ) : editRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function FeeRulesPage() {
  const [rules, setRules]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRule, setEditRule]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await feeRulesApi.getAll();
      const data = res.data?.data ?? res.data ?? [];
      setRules(Array.isArray(data) ? data : []);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditRule(null); setModalOpen(true); };
  const openEdit   = (r) => { setEditRule(r);   setModalOpen(true); };
  const closeModal = () => setModalOpen(false);
  const onSaved    = () => { closeModal(); load(); };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="mb-1"><i className="bi bi-percent me-2"></i>Fee Rules</h3>
          <p className="text-muted small mb-0">
            {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <i className="bi bi-plus-circle me-1"></i>New Rule
        </button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4"><LoadingSpinner text="Loading fee rules…" /></div>
          ) : rules.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-percent fs-1 d-block mb-2 opacity-25"></i>
              <p className="mb-1">No fee rules configured yet.</p>
              <button className="btn btn-outline-primary btn-sm mt-2" onClick={openCreate}>
                Create the first rule
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 70 }}>Priority</th>
                    <th>Card Type</th>
                    <th>Txn Type</th>
                    <th>Network</th>
                    <th>Region</th>
                    <th>MCC</th>
                    <th>Scheme %</th>
                    <th>Interchange %</th>
                    <th>Markup %</th>
                    <th>Amount Range</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[...rules]
                    .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))
                    .map(r => (
                      <tr key={r.feeRuleId}>
                        <td>
                          <span className="badge bg-secondary">{r.priority ?? 100}</span>
                        </td>
                        <td className="fw-medium">{r.cardType}</td>
                        <td>{r.transactionType}</td>
                        <td>{r.network || <span className="text-muted">—</span>}</td>
                        <td>{r.region  || <span className="text-muted">—</span>}</td>
                        <td>
                          {r.mccPattern
                            ? <code className="small">{r.mccPattern}</code>
                            : <span className="text-muted">—</span>
                          }
                        </td>
                        <td>{r.schemePercentage}%</td>
                        <td>{r.interchangePercentage}%</td>
                        <td>{r.acquirerMarkupPercentage}%</td>
                        <td className="small text-muted">
                          {r.minAmount != null || r.maxAmount != null
                            ? `${r.minAmount ?? 0} – ${r.maxAmount ?? '∞'}`
                            : '—'}
                        </td>
                        <td>
                          <span className={`badge ${r.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-link btn-sm p-0 text-muted"
                            title="Edit rule"
                            onClick={() => openEdit(r)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <FeeRuleModal
        show={modalOpen}
        editRule={editRule}
        onClose={closeModal}
        onSaved={onSaved}
      />
    </div>
  );
}

export default FeeRulesPage;
