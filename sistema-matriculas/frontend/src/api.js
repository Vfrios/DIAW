const KEY = 'matriculas.credenciais';
const BASE = import.meta.env.VITE_API_URL || `${import.meta.env.BASE_URL}api`;

export const hasCredentials = () => !!sessionStorage.getItem(KEY);
export const clearCredentials = () => sessionStorage.removeItem(KEY);
export function setCredentials(login, senha) {
  sessionStorage.setItem(KEY, btoa(unescape(encodeURIComponent(`${login}:${senha}`))));
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = sessionStorage.getItem(KEY);
  if (token) headers.Authorization = `Basic ${token}`;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.erro || (res.status === 403 ? 'Acesso negado' : `Erro ${res.status}`));
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  del: (p) => request('DELETE', p),
};
