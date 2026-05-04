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
