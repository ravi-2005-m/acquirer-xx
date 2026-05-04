import { useState, useEffect, useRef } from 'react';
import EntitySelect from '../common/EntitySelect';
import DateRangePicker from '../common/DateRangePicker';
import { merchantApi } from '../../api/merchantApi';

const STATUS_OPTIONS = [
  { value: 'OPEN',            label: 'Open' },
  { value: 'EVIDENCE_REVIEW', label: 'Evidence Review' },
  { value: 'PRE_ARBITRATION', label: 'Pre-Arbitration' },
  { value: 'ARBITRATION',     label: 'Arbitration' },
  { value: 'ACCEPTED',        label: 'Accepted' },
  { value: 'REJECTED',        label: 'Rejected' },
  { value: 'WON',             label: 'Won' },
  { value: 'LOST',            label: 'Lost' },
  { value: 'RESOLVED',        label: 'Resolved' },
  { value: 'CLOSED',          label: 'Closed' },
];

const REASON_OPTIONS = [
  { value: 'FRAUD',             label: 'Fraud' },
  { value: 'NOT_RECEIVED',      label: 'Not Received' },
  { value: 'DUPLICATE',         label: 'Duplicate' },
  { value: 'WRONG_AMOUNT',      label: 'Wrong Amount' },
  { value: 'UNAUTHORIZED',      label: 'Unauthorized' },
  { value: 'SUBSCRIPTION',      label: 'Subscription' },
  { value: 'CREDIT_NOT_ISSUED', label: 'Credit Not Issued' },
  { value: 'OTHER',             label: 'Other' },
];

const NETWORK_OPTIONS = ['VISA', 'MASTERCARD', 'AMEX', 'RUPAY'];

const fetchMerchants = ({ search }) =>
  merchantApi.search
    ? merchantApi.search({ name: search }, { size: 20 })
    : merchantApi.getAll({ name: search, size: 20 });

function DisputeFilters({ filters, onChange }) {
  const [merchantObj, setMerchantObj] = useState(null);

  const hasFilters = Object.values(filters).some(v => v !== '' && v != null);

  const set = (field, value) => onChange({ ...filters, [field]: value });

  const handleMerchantChange = (opt) => {
    setMerchantObj(opt);
    onChange({ ...filters, merchantId: opt?.value ?? '' });
  };

  const clearAll = () => {
    setMerchantObj(null);
    onChange({ search: '', status: '', reason: '', network: '', merchantId: '', fromDate: '', toDate: '' });
  };

  return (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-3">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search dispute ID, txn ref..."
              value={filters.search}
              onChange={e => set('search', e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.status}
              onChange={e => set('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.reason}
              onChange={e => set('reason', e.target.value)}
            >
              <option value="">All Reasons</option>
              {REASON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.network}
              onChange={e => set('network', e.target.value)}
            >
              <option value="">All Networks</option>
              {NETWORK_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <EntitySelect
              value={merchantObj}
              onChange={handleMerchantChange}
              fetchOptions={fetchMerchants}
              placeholder="All Merchants"
              labelField="name"
              valueField="merchantId"
              size="sm"
            />
          </div>

          <div className="col-12 col-md-5">
            <DateRangePicker
              fromDate={filters.fromDate}
              toDate={filters.toDate}
              onChange={(from, to) => onChange({ ...filters, fromDate: from, toDate: to })}
            />
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
