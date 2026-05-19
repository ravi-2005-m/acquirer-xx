export function formatCurrency(amount, currency = 'INR') {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
}

// Display a PAN safely. If already masked by the backend (contains * or X),
// show as-is. For raw digits (13–19), apply first-6 / middle-masked / last-4
// which matches the backend MaskingUtil format.
export function maskPan(pan) {
  if (!pan) return '—';
  const clean = pan.replace(/[\s-]/g, '');
  if (clean.includes('*') || clean.includes('X')) return clean;
  const digits = clean.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return clean || '—';
  const first6 = digits.slice(0, 6);
  const last4  = digits.slice(-4);
  const stars  = '*'.repeat(digits.length - 10);
  return `${first6}${stars}${last4}`;
}

// Indian Rupee with optional compact notation (₹2.45 L, ₹3.12 Cr)
export function formatINR(amount, options = {}) {
  if (amount === null || amount === undefined) return '—';
  const { compact = false } = options;
  if (compact) {
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
    if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(2)} L`;
    if (amount >= 1_000)      return `₹${(amount / 1_000).toFixed(2)} K`;
  }
  return formatCurrency(amount, 'INR');
}

// Convert a "YYYY-MM-DD" date string (from <input type="date">) to an ISO
// LocalDateTime string the backend can deserialize. `endOfDay=true` extends
// the time to 23:59:59 so toDate filters are inclusive of the entire day.
// Returns null for empty/invalid input.
export function toBackendDateTime(value, endOfDay = false) {
  if (!value) return null;
  // Already a full datetime (e.g. 2026-05-06T12:34:56) — pass through.
  if (typeof value === 'string' && value.includes('T')) return value;
  // Date-only "YYYY-MM-DD" — append start- or end-of-day time.
  return endOfDay ? `${value}T23:59:59` : `${value}T00:00:00`;
}
