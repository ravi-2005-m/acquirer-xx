export const ROLES = [
  { value: 'ADMIN',        label: 'Administrator',    color: 'bg-danger',              description: 'Full system access' },
  { value: 'MERCHANT_OPS', label: 'Merchant Ops',     color: 'bg-primary',             description: 'Merchant onboarding, store management' },
  { value: 'POS_OPS',      label: 'POS Ops',          color: 'bg-info',                description: 'Terminal provisioning and management' },
  { value: 'RISK',         label: 'Risk Analyst',     color: 'bg-warning text-dark',   description: 'Review risk-flagged transactions' },
  { value: 'DISPUTES',     label: 'Disputes Analyst', color: 'bg-secondary',           description: 'Handle dispute cases' },
  { value: 'RECON',        label: 'Recon Analyst',    color: 'bg-success',             description: 'Reconciliation and settlement operations' },
];

export const getRoleConfig = (value) =>
  ROLES.find(r => r.value === value) ?? { value, label: value || 'Unknown', color: 'bg-light text-dark' };
