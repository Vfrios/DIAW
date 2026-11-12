import PokemonImage from './PokemonImage.jsx'
import TypeBadge from './TypeBadge.jsx'
import { typeColor } from '../typeColors.js'

export default function PokemonCard({ pokemon, onOpen }) {
  const main = pokemon.types[0]
  return (
    <button
      className="card"
      onClick={() => onOpen(pokemon)}
      style={{ '--accent': typeColor(main) }}
    >
      <span className="card-id">#{String(pokemon.id).padStart(3, '0')}</span>
      <PokemonImage id={pokemon.id} name={pokemon.name} className="card-img" />
      <h3>{pokemon.name}</h3>
      <div className="badges">
        {pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}
      </div>
    </button>
  )
}
