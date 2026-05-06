const MESSAGES = {
  // Auth / IAM
  INVALID_CREDENTIALS:   'Wrong username or password.',
  ACCOUNT_LOCKED:        'Your account is locked. Contact an administrator.',
  TOKEN_EXPIRED:         'Your session has expired. Please log in again.',
  UNAUTHORIZED:          'You are not authorised to perform this action.',
  FORBIDDEN:             "You don't have permission for this resource.",

  // Validation
  VALIDATION_FAILED:     'Some fields are invalid. Please review and retry.',
  DUPLICATE_RESOURCE:    'A record with these details already exists.',
  RESOURCE_NOT_FOUND:    'The requested record could not be found.',

  // Merchant
  MERCHANT_KYC_PENDING:  "This merchant's KYC must be approved before this action.",
  MERCHANT_INACTIVE:     'This merchant is inactive. Reactivate to continue.',
  MID_ALREADY_EXISTS:    'This MID is already assigned to another merchant.',

  // Terminal
  TID_ALREADY_EXISTS:    'This Terminal ID is already in use.',
  TERMINAL_INACTIVE:     'This terminal is inactive.',
  NO_OPEN_BATCH:         'No open batch for this terminal. Open a batch first.',

  // Transaction
  TXN_ALREADY_VOIDED:    'This transaction has already been voided.',
  TXN_ALREADY_REFUNDED:  'This transaction has already been refunded.',
  TXN_ALREADY_SETTLED:   'Settled transactions cannot be voided.',
  REFUND_AMOUNT_EXCEEDS: 'Refund amount cannot exceed the original.',
  RISK_BLOCKED:          'This transaction was blocked by the risk engine.',

  // Settlement
  BATCH_ALREADY_CLOSED:  'This settlement batch is already closed.',
  NOTHING_TO_SETTLE:     'No unsettled transactions for this merchant.',

  // Dispute
  DISPUTE_DEADLINE_PASSED: 'The deadline for this dispute has passed.',
  DISPUTE_ALREADY_CLOSED:  'This dispute is already closed.',

  // Reconciliation
  RECON_FILE_INVALID:        'The reconciliation file format is invalid. Check the column headers.',
  RECON_ITEM_ALREADY_RESOLVED: 'This exception has already been resolved.',

  // Infrastructure
  SERVICE_UNAVAILABLE:  'The service is temporarily unavailable. Please try again.',
  GATEWAY_TIMEOUT:      'The request timed out. Please try again.',
  INTERNAL_ERROR:       'Something went wrong on our side. Please try again.',
  NETWORK_ERROR:        'Cannot reach the server. Check your connection.',
};

const GENERIC_BACKENDS = [
  'internal server error', 'bad request', 'unauthorized', 'forbidden', 'not found',
];

export function mapError(err) {
  if (err && !err.response) {
    if (err.code === 'ECONNABORTED') return MESSAGES.GATEWAY_TIMEOUT;
    return MESSAGES.NETWORK_ERROR;
  }

  const data       = err?.response?.data;
  const code       = data?.errorCode || data?.code;
  const backendMsg = data?.message || data?.error;
  const status     = err?.response?.status;

  if (code && MESSAGES[code]) return MESSAGES[code];

  if (backendMsg && !GENERIC_BACKENDS.includes(backendMsg.toLowerCase().trim())) {
    return backendMsg;
  }

  if (status === 401) return MESSAGES.UNAUTHORIZED;
  if (status === 403) return MESSAGES.FORBIDDEN;
  if (status === 404) return MESSAGES.RESOURCE_NOT_FOUND;
  if (status === 409) return MESSAGES.DUPLICATE_RESOURCE;
  if (status === 422) return MESSAGES.VALIDATION_FAILED;
  if (status >= 500)  return MESSAGES.INTERNAL_ERROR;

  return 'Something went wrong. Please try again.';
}

export function shouldToastError(err) {
  if (err?.response?.status === 401) return false;
  if (err?.code === 'ERR_CANCELED')  return false;
  return true;
}
