const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api');

export async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && token) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.erro || 'Erro ao comunicar com o servidor');
  return data;
}

export const authApi = {
  login: (dados) => request('/auth/login', { method: 'POST', body: dados }),
  register: (dados) => request('/auth/register', { method: 'POST', body: dados }),
  me: () => request('/auth/me'),
};

export const clientesApi = {
  listar: () => request('/clientes'),
  criar: (dados) => request('/clientes', { method: 'POST', body: dados }),
  atualizar: (id, dados) => request(`/clientes/${id}`, { method: 'PUT', body: dados }),
  excluir: (id) => request(`/clientes/${id}`, { method: 'DELETE' }),
};

export const pedidosApi = {
  listar: () => request('/pedidos'),
  buscar: (id) => request(`/pedidos/${id}`),
  criar: (dados) => request('/pedidos', { method: 'POST', body: dados }),
  atualizar: (id, dados) => request(`/pedidos/${id}`, { method: 'PUT', body: dados }),
  cancelar: (id) => request(`/pedidos/${id}/cancelar`, { method: 'POST' }),
  avaliar: (id, dados) => request(`/pedidos/${id}/avaliacao`, { method: 'POST', body: dados }),
  contratar: (id) => request(`/pedidos/${id}/contrato`, { method: 'POST' }),
  credito: (id, dados) => request(`/pedidos/${id}/credito`, { method: 'PUT', body: dados }),
};
