export const getBackendUrl = () => {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem('ai_sotuvchi_backend_url');
  if (stored && stored.trim()) return stored.trim().replace(/\/+$/, '');
  return (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
};

export const setBackendUrl = (url) => {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem('ai_sotuvchi_backend_url');
  } else {
    localStorage.setItem('ai_sotuvchi_backend_url', url.trim().replace(/\/+$/, ''));
  }
};

export const apiFetch = async (path, options = {}) => {
  const base = getBackendUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = base ? `${base}${cleanPath}` : cleanPath;
  return fetch(url, options);
};

export const pingBackend = async (urlToTest) => {
  const target = (urlToTest !== undefined ? urlToTest : getBackendUrl()).trim().replace(/\/+$/, '');
  const url = target ? `${target}/api/settings` : '/api/settings';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return { ok: true, status: res.status };
    }
    return { ok: false, status: res.status, message: `Server kutilmagan javob qaytardi (${res.status})` };
  } catch (err) {
    return { ok: false, message: err.message || "Server bilan bog'lanib bo'lmadi" };
  }
};
