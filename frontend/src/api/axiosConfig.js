import axios from 'axios';
import { toast } from '../utils/toast';
import { mapError, shouldToastError } from '../utils/errorMapper';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST ─────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ax_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE ────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('ax_token');
      if (window.location.pathname !== '/login') {
        sessionStorage.setItem('returnTo', window.location.pathname + window.location.search);
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Auto-toast — skip when caller sets suppressToast: true in request config
    if (shouldToastError(error) && !error.config?.suppressToast) {
      toast.error(mapError(error));
    }

    return Promise.reject(error);
  }
);

export default api;