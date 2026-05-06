import { useState } from 'react';
import { merchantApi } from '../../api/merchantApi';
import EntitySelect from '../common/EntitySelect';
import DateRangePicker from '../common/DateRangePicker';

const fetchMerchantsOptions = ({ search }) =>
  (search
    ? merchantApi.search({ legalName: search }, { size: 20 })
    : merchantApi.getAll({ size: 20 })
  ).then(res => {
    const body = res.data?.data ?? res.data ?? {};
    return { content: body.content ?? (Array.isArray(body) ? body : []) };
  });

const STATUS_OPTIONS = ['PENDING', 'READY', 'ON_HOLD', 'PAID', 'FAILED'];

function BatchFilters({ filters, onChange }) {
  const [merchantObj, setMerchantObj] = useState(null);

  const set = (field, value) => onChange({ ...filters, [field]: value });

  const handleMerchantChange = (id, opt) => {
    setMerchantObj(opt);
    onChange({ ...filters, merchantId: id });
  };

  const handleDateChange = ({ fromDate, toDate }) => onChange({ ...filters, fromDate, toDate });

  const hasFilters = Object.entries(filters).some(([k, v]) => k !== 'page' && v !== '' && v != null);

  const clearAll = () => {
    setMerchantObj(null);
    onChange({ status: '', merchantId: '', minNetAmount: '', maxNetAmount: '', minTxnCount: '', fromDate: '', toDate: '' });
  };

  return (
    <div className="card mb-3">
      <div className="card-body py-2">
        <div className="row g-2 align-items-end">
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.status}
              onChange={e => set('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-3">
            <EntitySelect
              value={merchantObj ? String(merchantObj.merchantId ?? merchantObj.id ?? '') : filters.merchantId}
              onChange={handleMerchantChange}
              fetchOptions={fetchMerchantsOptions}
              getOptionLabel={m => m.businessName ?? m.legalName ?? `Merchant #${m.merchantId ?? m.id}`}
              getOptionId={m => m.merchantId ?? m.id}
              placeholder="All Merchants"
            />
          </div>

          <div className="col-6 col-md-2">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="Min Net (₹)"
              value={filters.minNetAmount}
              onChange={e => set('minNetAmount', e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="Max Net (₹)"
              value={filters.maxNetAmount}
              onChange={e => set('maxNetAmount', e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="Min Txns"
              value={filters.minTxnCount}
              onChange={e => set('minTxnCount', e.target.value)}
            />
          </div>

          {hasFilters && (
            <div className="col-auto">
              <button className="btn btn-sm btn-outline-secondary" onClick={clearAll}>
                <i className="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
          )}

          <div className="col-12 col-md-5">
            <DateRangePicker
              fromDate={filters.fromDate}
              toDate={filters.toDate}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchFilters;
