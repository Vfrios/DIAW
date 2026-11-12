import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import PokemonCard from './components/PokemonCard.jsx'
import PokemonDetails from './components/PokemonDetails.jsx'
import PokemonForm from './components/PokemonForm.jsx'

export default function App() {
  const [pokemons, setPokemons] = useState([])
  const [types, setTypes] = useState([])
  const [trainers, setTrainers] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [formState, setFormState] = useState(null) // null = fechado | { pokemon } (pokemon null = novo)

  // Tipos e treinadores são carregados uma vez
  useEffect(() => {
    api.listTypes().then(setTypes).catch(() => {})
    api.listTrainers().then(setTrainers).catch(() => {})
  }, [])

  // Pokémon: busca na API (filtros de nome e tipo feitos no backend, com debounce)
  const loadPokemons = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setPokemons(await api.listPokemons(search.trim(), typeFilter))
    } catch (e) {
      setError(`Não foi possível carregar os Pokémon. Verifique se o backend está rodando. (${e.message})`)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    const t = setTimeout(loadPokemons, 250)
    return () => clearTimeout(t)
  }, [loadPokemons])

  const filterTypes = useMemo(() => types.filter((t) => t.name !== 'Typeless'), [types])

  const handleSave = async (data) => {
    const editing = formState?.pokemon
    const saved = editing ? await api.updatePokemon(editing.id, data) : await api.createPokemon(data)
    setFormState(null)
    setSelected(editing ? saved : null)
    await loadPokemons()
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Excluir ${p.name} da Pokédex?`)) return
    try {
      await api.deletePokemon(p.id)
      setSelected(null)
      await loadPokemons()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>Pokédex</h1>
        <div className="controls">
          <input
            className="search"
            type="search"
            placeholder="🔎 Pesquisar Pokémon…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Todos os tipos</option>
            {filterTypes.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <button className="btn primary" onClick={() => setFormState({ pokemon: null })}>
            ➕ Novo Pokémon
          </button>
        </div>
      </header>

      <main>
        {error && <p className="error banner">{error}</p>}
        {!error && !loading && (
          <p className="count">{pokemons.length} Pokémon encontrado{pokemons.length === 1 ? '' : 's'}</p>
        )}
        {loading && <p className="count">Carregando…</p>}

        <div className="grid">
          {pokemons.map((p) => <PokemonCard key={p.id} pokemon={p} onOpen={setSelected} />)}
        </div>

        {!loading && !error && pokemons.length === 0 && (
          <p className="empty">Nenhum Pokémon encontrado.</p>
        )}
      </main>

      {selected && (
        <PokemonDetails
          pokemon={selected}
          trainers={trainers}
          onClose={() => setSelected(null)}
          onEdit={(p) => setFormState({ pokemon: p })}
          onDelete={handleDelete}
        />
      )}

      {formState && (
        <PokemonForm
          pokemon={formState.pokemon}
          allTypes={filterTypes}
          onSave={handleSave}
          onCancel={() => setFormState(null)}
        />
      )}
    </div>
  )
}
