const REASON_MAP = {
  FRAUD:              { label: 'Fraud',             bg: 'danger' },
  NOT_RECEIVED:       { label: 'Not Received',      bg: 'warning' },
  DUPLICATE:          { label: 'Duplicate',          bg: 'info' },
  WRONG_AMOUNT:       { label: 'Wrong Amount',       bg: 'warning' },
  UNAUTHORIZED:       { label: 'Unauthorized',       bg: 'danger' },
  SUBSCRIPTION:       { label: 'Subscription',       bg: 'secondary' },
  CREDIT_NOT_ISSUED:  { label: 'Credit Not Issued',  bg: 'warning' },
  OTHER:              { label: 'Other',              bg: 'secondary' },
};

function ReasonBadge({ reason }) {
  const def = REASON_MAP[reason] ?? { label: reason ?? 'Unknown', bg: 'secondary' };
  return (
    <span className={`badge bg-${def.bg} bg-opacity-15 text-${def.bg} border border-${def.bg} border-opacity-25 small`}>
      {def.label}
    </span>
  );
}

export default ReasonBadge;
