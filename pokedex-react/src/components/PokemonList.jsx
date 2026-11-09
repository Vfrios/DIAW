import PokemonCard from './PokemonCard'
import '../css/PokemonList.css'

export default function PokemonList({ pokemon, favorites, onSelect, onToggleFavorite }) {
  return (
    <div className="grid">
      {pokemon.map((p) => (
        <PokemonCard
          key={p.id}
          pokemon={p}
          isFavorite={favorites.includes(p.id)}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
