import { formatDateTime } from '../../utils/formatters';

const STAGES = [
  { key: 'OPEN',             label: 'Open' },
  { key: 'EVIDENCE_REVIEW',  label: 'Evidence Review' },
  { key: 'PRE_ARBITRATION',  label: 'Pre-Arbitration' },
  { key: 'ARBITRATION',      label: 'Arbitration' },
  { key: 'RESOLVED',         label: 'Resolved' },
  { key: 'CLOSED',           label: 'Closed' },
];

const TERMINAL_STATES = new Set(['ACCEPTED', 'REJECTED', 'WON', 'LOST']);

function stageIndex(status) {
  if (!status) return -1;
  if (TERMINAL_STATES.has(status)) return STAGES.length - 1;
  return STAGES.findIndex(s => s.key === status);
}

function DisputeStageTimeline({ currentStatus, stages = [] }) {
  const current = stageIndex(currentStatus);

  const stageTime = (key) => {
    const hit = stages.find(s => s.stage === key || s.status === key);
    return hit?.enteredAt ?? hit?.createdAt ?? null;
  };

  return (
    <div className="d-flex align-items-start gap-0 overflow-auto py-2">
      {STAGES.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        const pending = i > current;

        const dotColor = done ? 'bg-success' : active ? 'bg-primary' : 'bg-secondary opacity-25';
        const lineColor = done ? 'bg-success' : 'bg-secondary opacity-25';

        return (
          <div key={s.key} className="d-flex align-items-start flex-shrink-0" style={{ minWidth: '120px' }}>
            <div className="d-flex flex-column align-items-center" style={{ width: '100%' }}>
              <div className="d-flex align-items-center w-100">
                {i > 0 && <div className={`flex-grow-1 ${lineColor}`} style={{ height: '2px' }}></div>}
                <div
                  className={`rounded-circle ${dotColor} d-flex align-items-center justify-content-center`}
                  style={{ width: '20px', height: '20px', flexShrink: 0 }}
                >
                  {done && <i className="bi bi-check text-white" style={{ fontSize: '0.65rem' }}></i>}
                  {active && <i className="bi bi-circle-fill text-white" style={{ fontSize: '0.45rem' }}></i>}
                </div>
                {i < STAGES.length - 1 && <div className={`flex-grow-1 ${lineColor}`} style={{ height: '2px' }}></div>}
              </div>
              <div className="text-center mt-1 px-1">
                <div className={`small fw-semibold ${active ? 'text-primary' : done ? 'text-success' : 'text-muted'}`}
                  style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                  {s.label}
                </div>
                {stageTime(s.key) && (
                  <div className="text-muted" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                    {formatDateTime(stageTime(s.key))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DisputeStageTimeline;
