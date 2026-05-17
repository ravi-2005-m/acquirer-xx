import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { riskApi } from '../../api/riskApi';
import { toBackendDateTime } from '../../utils/formatters';
import RiskSummaryPanel from '../../components/risk/RiskSummaryPanel';
import RiskCheckWidget from '../../components/risk/RiskCheckWidget';
import EventFilters from '../../components/risk/EventFilters';
import EventTable from '../../components/risk/EventTable';
import RuleTable from '../../components/risk/RuleTable';
import CreateRuleModal from '../../components/risk/CreateRuleModal';
import BlacklistTable from '../../components/risk/BlacklistTable';
import AddBlacklistModal from '../../components/risk/AddBlacklistModal';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';

const EVENT_PAGE_SIZE = 20;
const BL_PAGE_SIZE    = 20;

function RiskPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'RISK' || user?.role === 'ADMIN';

  const [tab, setTab] = useState('events');

  const [summary, setSummary]               = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Events tab
  const [eventFilters, setEventFilters] = useState({ pan: '', result: '', fromDate: '', toDate: '' });
  const [eventPage, setEventPage]       = useState(0);
  const [events, setEvents]             = useState([]);
  const [eventTotalPages, setEventTotalPages]       = useState(0);
  const [eventTotalElements, setEventTotalElements] = useState(0);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Rules tab
  const [rules, setRules]           = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [deactivatingRule, setDeactivatingRule] = useState(null);

  // Blacklist tab
  const [blFilters, setBlFilters]   = useState({});
  const [blPage, setBlPage]         = useState(0);
  const [blacklist, setBlacklist]   = useState([]);
  const [blTotalPages, setBlTotalPages]       = useState(0);
  const [blTotalElements, setBlTotalElements] = useState(0);
  const [blLoading, setBlLoading]   = useState(false);
  const [showAddBl, setShowAddBl]   = useState(false);
  const [removingEntry, setRemovingEntry] = useState(null);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res  = await riskApi.getSummary();
      setSummary(res.data?.data ?? res.data ?? null);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  // Events loader
  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const hasFilters = Object.values(eventFilters).some(v => v !== '');
      let res;
      if (hasFilters) {
        const search = {};
        if (eventFilters.pan)      search.pan      = eventFilters.pan;
        if (eventFilters.result)   search.result   = eventFilters.result;
        if (eventFilters.fromDate) search.fromDate = toBackendDateTime(eventFilters.fromDate, false);
        if (eventFilters.toDate)   search.toDate   = toBackendDateTime(eventFilters.toDate,   true);
        res = await riskApi.searchEvents(search, { page: eventPage, size: EVENT_PAGE_SIZE });
      } else {
        res = await riskApi.getEvents({ page: eventPage, size: EVENT_PAGE_SIZE });
      }
      const body = res.data?.data ?? res.data ?? {};
      setEvents(body.content ?? []);
      setEventTotalPages(body.totalPages ?? 0);
      setEventTotalElements(body.totalElements ?? 0);
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [eventFilters, eventPage]);

  useEffect(() => {
    if (tab !== 'events') return;
    const t = setTimeout(loadEvents, 300);
    return () => clearTimeout(t);
  }, [tab, loadEvents]);

  // Rules loader
  const loadRules = useCallback(async () => {
    setRulesLoading(true);
    try {
      const res  = await riskApi.getRules();
      const body = res.data?.data ?? res.data ?? {};
      setRules(Array.isArray(body) ? body : (body.content ?? []));
    } catch {
      setRules([]);
    } finally {
      setRulesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab !== 'rules') return;
    loadRules();
  }, [tab, loadRules]);

  // Blacklist loader
  const loadBlacklist = useCallback(async () => {
    setBlLoading(true);
    try {
      const res  = await riskApi.getBlacklist({ page: blPage, size: BL_PAGE_SIZE });
      const body = res.data?.data ?? res.data ?? {};
      setBlacklist(body.content ?? []);
      setBlTotalPages(body.totalPages ?? 0);
      setBlTotalElements(body.totalElements ?? 0);
    } catch {
      setBlacklist([]);
    } finally {
      setBlLoading(false);
    }
  }, [blPage]);

  useEffect(() => {
    if (tab !== 'blacklist') return;
    loadBlacklist();
  }, [tab, loadBlacklist]);

  const handleDeactivateRule = async () => {
    if (!deactivatingRule) return;
    try {
      await riskApi.deactivateRule(deactivatingRule.ruleId);
      setDeactivatingRule(null);
      loadRules();
      loadSummary();
    } catch {
      // keep modal open on failure
    }
  };

  const handleRemoveBlacklist = async () => {
    if (!removingEntry) return;
    try {
      await riskApi.removeBlacklist(removingEntry.blacklistId ?? removingEntry.id);
      setRemovingEntry(null);
      loadBlacklist();
      loadSummary();
    } catch {
      // keep modal open on failure
    }
  };

  const handleEventFilterChange = (f) => { setEventFilters(f); setEventPage(0); };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h3 className="mb-1"><i className="bi bi-shield-exclamation me-2"></i>Risk &amp; Fraud</h3>
          <p className="text-muted small mb-0">Rule engine decisions, event history, and blacklist management</p>
        </div>
      </div>

      <RiskSummaryPanel summary={summary} loading={summaryLoading} />

      <RiskCheckWidget />

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {[
          { key: 'events',    label: 'Events',    icon: 'bi-activity' },
          { key: 'rules',     label: 'Rules',     icon: 'bi-sliders' },
          { key: 'blacklist', label: 'Blacklist',  icon: 'bi-ban' },
        ].map(t => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <i className={`bi ${t.icon} me-1`}></i>{t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Events tab */}
      {tab === 'events' && (
        <>
          <EventFilters filters={eventFilters} onChange={handleEventFilterChange} />
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold small"><i className="bi bi-activity me-2"></i>Risk Events</span>
              <span className="text-muted small">{eventTotalElements} total</span>
            </div>
            <div className="card-body p-0">
              <EventTable events={events} loading={eventsLoading} />
            </div>
            {eventTotalPages > 1 && (
              <div className="card-footer bg-white">
                <Pagination
                  page={eventPage}
                  totalPages={eventTotalPages}
                  totalElements={eventTotalElements}
                  pageSize={EVENT_PAGE_SIZE}
                  onPageChange={setEventPage}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Rules tab */}
      {tab === 'rules' && (
        <>
          {canManage && (
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreateRule(true)}>
                <i className="bi bi-plus me-1"></i>Create Rule
              </button>
            </div>
          )}
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold small"><i className="bi bi-sliders me-2"></i>Risk Rules</span>
              <span className="text-muted small">{rules.length} total</span>
            </div>
            <div className="card-body p-0">
              <RuleTable
                rules={rules}
                loading={rulesLoading}
                canManage={canManage}
                onDeactivate={setDeactivatingRule}
              />
            </div>
          </div>
        </>
      )}

      {/* Blacklist tab */}
      {tab === 'blacklist' && (
        <>
          {canManage && (
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-danger btn-sm" onClick={() => setShowAddBl(true)}>
                <i className="bi bi-ban me-1"></i>Add to Blacklist
              </button>
            </div>
          )}
          <div className="card">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold small"><i className="bi bi-ban me-2"></i>Blacklist</span>
              <span className="text-muted small">{blTotalElements} total</span>
            </div>
            <div className="card-body p-0">
              <BlacklistTable
                entries={blacklist}
                loading={blLoading}
                canManage={canManage}
                onRemove={setRemovingEntry}
              />
            </div>
            {blTotalPages > 1 && (
              <div className="card-footer bg-white">
                <Pagination
                  page={blPage}
                  totalPages={blTotalPages}
                  totalElements={blTotalElements}
                  pageSize={BL_PAGE_SIZE}
                  onPageChange={setBlPage}
                />
              </div>
            )}
          </div>
        </>
      )}

      <CreateRuleModal
        show={showCreateRule}
        onClose={() => setShowCreateRule(false)}
        onCreated={() => { setShowCreateRule(false); loadRules(); loadSummary(); }}
      />

      <AddBlacklistModal
        show={showAddBl}
        onClose={() => setShowAddBl(false)}
        onAdded={() => { setShowAddBl(false); loadBlacklist(); loadSummary(); }}
      />

      <ConfirmModal
        show={!!deactivatingRule}
        title="Deactivate Rule"
        message={`Deactivate rule "${deactivatingRule?.name}"? It will no longer evaluate transactions.`}
        confirmLabel="Deactivate"
        confirmVariant="warning"
        onConfirm={handleDeactivateRule}
        onClose={() => setDeactivatingRule(null)}
      />

      <ConfirmModal
        show={!!removingEntry}
        title="Remove Blacklist Entry"
        message={`Remove blacklist entry for "${removingEntry?.value}"? This will re-allow this ${removingEntry?.entryType?.toLowerCase() || 'value'} in future transactions.`}
        confirmLabel="Remove"
        confirmVariant="danger"
        onConfirm={handleRemoveBlacklist}
        onClose={() => setRemovingEntry(null)}
      />
    </div>
  );
}

export default RiskPage;
