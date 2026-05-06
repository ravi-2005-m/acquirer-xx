import { useState } from 'react';
import EntitySelect from '../common/EntitySelect';
import DateRangePicker from '../common/DateRangePicker';
import { merchantApi } from '../../api/merchantApi';

const STAGE_OPTIONS = [
  { value: 'RETRIEVAL',     label: 'Retrieval' },
  { value: 'CHARGEBACK',    label: 'Chargeback' },
  { value: 'REPRESENTMENT', label: 'Representment' },
  { value: 'ARBITRATION',   label: 'Arbitration' },
];

const STATUS_OPTIONS = [
  { value: 'OPEN',   label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
];

const fetchMerchants = ({ search }) =>
  merchantApi.search
    ? merchantApi.search({ legalName: search }, { size: 20 })
    : merchantApi.getAll({ size: 20 });

function DisputeFilters({ filters, onChange }) {
  const [merchantObj, setMerchantObj] = useState(null);

  const hasFilters = Object.values(filters).some(v => v !== '' && v != null && v !== false);

  const set = (field, value) => onChange({ ...filters, [field]: value });

  const handleMerchantChange = (opt) => {
    setMerchantObj(opt);
    onChange({ ...filters, merchantId: opt?.value ?? '' });
  };

  const clearAll = () => {
    setMerchantObj(null);
    onChange({ stage: '', status: '', reasonCode: '', merchantId: '', fromDate: '', toDate: '', deadlineExpired: false });
  };

  return (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-end">
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.stage || ''}
              onChange={e => set('stage', e.target.value)}
            >
              <option value="">All Stages</option>
              {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.status || ''}
              onChange={e => set('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Reason code"
              value={filters.reasonCode || ''}
              onChange={e => set('reasonCode', e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <EntitySelect
              value={merchantObj}
              onChange={handleMerchantChange}
              fetchOptions={fetchMerchants}
              placeholder="All Merchants"
              labelField="legalName"
              valueField="merchantId"
              size="sm"
            />
          </div>

          <div className="col-12 col-md-3">
            <DateRangePicker
              fromDate={filters.fromDate}
              toDate={filters.toDate}
              onChange={({ fromDate, toDate }) => onChange({ ...filters, fromDate, toDate })}
            />
          </div>

          <div className="col-auto">
            <div className="form-check small">
              <input
                type="checkbox"
                className="form-check-input"
                id="dl-expired"
                checked={!!filters.deadlineExpired}
                onChange={e => set('deadlineExpired', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="dl-expired">Deadline expired</label>
            </div>
          </div>

          {hasFilters && (
            <div className="col-auto">
              <button className="btn btn-sm btn-outline-secondary" onClick={clearAll}>
                <i className="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisputeFilters;
