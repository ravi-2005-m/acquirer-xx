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

export function maskPan(pan) {
  if (!pan) return '—';
  const digits = pan.replace(/\D/g, '');
  if (digits.length < 4) return pan;
  return `**** **** **** ${digits.slice(-4)}`;
}

// 4111-XXXX-XXXX-1111 format (acquirer-style masking)
export function maskPAN(pan) {
  if (!pan) return '—';
  const clean = pan.replace(/\D/g, '');
  if (clean.length < 16) return pan;
  return `${clean.slice(0, 4)}-XXXX-XXXX-${clean.slice(-4)}`;
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

export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
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
