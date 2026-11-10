// Camada de acesso à API Spring Boot (substitui o antigo pokedex-data.json).
const BASE = `${(import.meta.env.VITE_API_URL ?? import.meta.env.BASE_URL).replace(/\/$/, '')}/api`

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let message = `Erro ${res.status}`
    try {
      const body = await res.json()
      message = body.message || body.error || message
      if (body.fields) message += ': ' + Object.values(body.fields).join(', ')
    } catch { /* corpo vazio */ }
    throw new Error(message)
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  listPokemons: (name = '', type = '') => {
    const params = new URLSearchParams()
    if (name) params.set('name', name)
    if (type) params.set('type', type)
    const qs = params.toString()
    return request(`/pokemons${qs ? `?${qs}` : ''}`)
  },
  getPokemon: (id) => request(`/pokemons/${id}`),
  createPokemon: (p) => request('/pokemons', { method: 'POST', body: JSON.stringify(p) }),
  updatePokemon: (id, p) => request(`/pokemons/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  deletePokemon: (id) => request(`/pokemons/${id}`, { method: 'DELETE' }),
  listTypes: () => request('/types'),
  listTrainers: () => request('/trainers'),
}
