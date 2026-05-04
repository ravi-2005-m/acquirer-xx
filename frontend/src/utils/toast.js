import { toast as t } from 'react-toastify';

const BASE = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

// Suppress identical messages fired within 1.5s (e.g. interceptor + component both fire)
const recent = new Map();
const DEDUPE_MS = 1500;

function dedupe(key) {
  const now = Date.now();
  const last = recent.get(key);
  if (last && now - last < DEDUPE_MS) return false;
  recent.set(key, now);
  if (recent.size > 50) {
    for (const [k, v] of recent) {
      if (now - v > DEDUPE_MS) recent.delete(k);
    }
  }
  return true;
}

export const toast = {
  success(msg, opts = {}) {
    if (!dedupe(`s:${msg}`)) return;
    t.success(msg, { ...BASE, ...opts });
  },
  error(msg, opts = {}) {
    if (!dedupe(`e:${msg}`)) return;
    t.error(msg, { ...BASE, autoClose: 6000, ...opts });
  },
  info(msg, opts = {}) {
    if (!dedupe(`i:${msg}`)) return;
    t.info(msg, { ...BASE, ...opts });
  },
  warning(msg, opts = {}) {
    if (!dedupe(`w:${msg}`)) return;
    t.warning(msg, { ...BASE, ...opts });
  },
  loading(msg, opts = {}) {
    return t.loading(msg, { ...BASE, autoClose: false, ...opts });
  },
  update(id, type, msg) {
    t.update(id, { render: msg, type, isLoading: false, autoClose: type === 'error' ? 6000 : 4000 });
  },
  dismiss: (id) => t.dismiss(id),
  dismissAll: () => t.dismiss(),
};
