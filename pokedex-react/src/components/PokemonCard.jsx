import { useState } from 'react'
import TypeBadge from './TypeBadge'
import { getTypeColor, imageUrl, formatId } from '../utils/typeColors'
import '../css/PokemonCard.css'

export default function PokemonCard({ pokemon, isFavorite, onSelect, onToggleFavorite }) {
  const [imgError, setImgError] = useState(false)
  const types = pokemon.types.length ? pokemon.types : ['Typeless']
  const c1 = getTypeColor(types[0])
  const c2 = getTypeColor(types[1] || types[0])

  return (
    <div className="card-wrap">
      <button
        className="fav-btn"
        onClick={() => onToggleFavorite(pokemon.id)}
        aria-label={isFavorite ? `Remover ${pokemon.name} dos favoritos` : `Favoritar ${pokemon.name}`}
        aria-pressed={isFavorite}
      >
        {isFavorite ? '★' : '☆'}
      </button>
      <button
        className="card"
        style={{ '--c1': c1, '--c2': c2, width: '100%' }}
        onClick={() => onSelect(pokemon)}
      >
        <span className="id">{formatId(pokemon.id)}</span>
        <div className="art">
          {imgError ? (
            <span className="fallback">?</span>
          ) : (
            <img
              src={imageUrl(pokemon.id)}
              alt={pokemon.name}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <h3>{pokemon.name}</h3>
        <div className="types">
          {types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
        <ul className="stats">
          <li><b>{pokemon.hp}</b>HP</li>
          <li><b>{pokemon.attack}</b>Ataque</li>
          <li><b>{pokemon.defense}</b>Defesa</li>
          <li><b>{pokemon.specialAttack}</b>Atq. Esp.</li>
          <li><b>{pokemon.specialDefense}</b>Def. Esp.</li>
          <li><b>{pokemon.speed}</b>Veloc.</li>
        </ul>
      </button>
    </div>
  )
}
