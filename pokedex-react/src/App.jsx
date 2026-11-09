import { useState, useEffect, useMemo, useCallback } from 'react'
import data from './data/pokedex-data.json'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import TypeFilter from './components/TypeFilter'
import PokemonList from './components/PokemonList'
import PokemonDetails from './components/PokemonDetails'
import TrainerList from './components/TrainerList'
import './css/App.css'

const SORTS = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Nome' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Attack' },
  { value: 'defense', label: 'Defense' },
  { value: 'specialAttack', label: 'Special Attack' },
  { value: 'specialDefense', label: 'Special Defense' },
  { value: 'speed', label: 'Speed' },
]

const loadFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem('pokedex-favorites')) || []
  } catch {
    return []
  }
}

export default function App() {
  const [tab, setTab] = useState('pokedex')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState('id')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [favorites, setFavorites] = useState(loadFavorites)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    localStorage.setItem('pokedex-favorites', JSON.stringify(favorites))
  }, [favorites])

  // estado derivado: lista filtrada e ordenada
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase().replace('#', '')
    const list = data.pokemon.filter((p) => {
      const matchSearch =
        !q || p.name.toLowerCase().includes(q) || String(p.id) === q || String(p.id).padStart(3, '0').includes(q)
      const matchType = !typeFilter || p.types.includes(typeFilter)
      const matchFav = !onlyFavorites || favorites.includes(p.id)
      return matchSearch && matchType && matchFav
    })
    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'id') return a.id - b.id
      return b[sortBy] - a[sortBy] || a.id - b.id
    })
  }, [search, typeFilter, sortBy, onlyFavorites, favorites])

  const toggleFavorite = (id) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
    setOnlyFavorites(false)
  }

  const randomPokemon = () => {
    const p = data.pokemon[Math.floor(Math.random() * data.pokemon.length)]
    setSelected(p)
  }

  const step = useCallback((dir) => {
    setSelected((cur) => {
      if (!cur) return cur
      const n = data.pokemon.length
      const idx = (cur.id - 1 + dir + n) % n
      return data.pokemon[idx]
    })
  }, [])
  const close = useCallback(() => setSelected(null), [])
  const prev = useCallback(() => step(-1), [step])
  const next = useCallback(() => step(1), [step])

  return (
    <div className="app">
      <Header total={data.pokemon.length} favorites={favorites.length} />

      <nav className="tabs">
        <button className={`tab ${tab === 'pokedex' ? 'active' : ''}`} onClick={() => setTab('pokedex')}>
          Pokédex
        </button>
        <button className={`tab ${tab === 'trainers' ? 'active' : ''}`} onClick={() => setTab('trainers')}>
          Treinadores
        </button>
      </nav>

      {tab === 'pokedex' ? (
        <main>
          <section className="toolbar">
            <div className="toolbar-row">
              <SearchBar value={search} onChange={setSearch} />
              <select
                className="select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar por"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    Ordenar: {s.label}
                  </option>
                ))}
              </select>
              <button
                className={`btn ${onlyFavorites ? 'active' : ''}`}
                onClick={() => setOnlyFavorites((v) => !v)}
                aria-pressed={onlyFavorites}
              >
                ★ Favoritos
              </button>
              <button className="btn" onClick={randomPokemon}>🎲 Aleatório</button>
            </div>
            <TypeFilter types={data.types} selected={typeFilter} onSelect={setTypeFilter} />
          </section>

          <p className="results-info">
            {visible.length} de {data.pokemon.length} Pokémon
          </p>

          {visible.length ? (
            <PokemonList
              pokemon={visible}
              favorites={favorites}
              onSelect={setSelected}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <div className="empty">
              <strong>Nenhum Pokémon encontrado</strong>
              Tente outro nome, ID ou tipo.
              <br />
              <button onClick={clearFilters}>Limpar filtros</button>
            </div>
          )}
        </main>
      ) : (
        <main>
          <TrainerList trainers={data.trainers} pokemon={data.pokemon} onSelect={setSelected} />
        </main>
      )}

      {selected && (
        <PokemonDetails
          pokemon={selected}
          trainers={data.trainers}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  )
}
