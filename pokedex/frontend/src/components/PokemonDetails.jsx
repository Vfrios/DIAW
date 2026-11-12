import PokemonImage from './PokemonImage.jsx'
import TypeBadge from './TypeBadge.jsx'
import { typeColor } from '../typeColors.js'

const STATS = [
  ['HP', 'hp'],
  ['Ataque', 'attack'],
  ['Defesa', 'defense'],
  ['Ataque Esp.', 'specialAttack'],
  ['Defesa Esp.', 'specialDefense'],
  ['Velocidade', 'speed'],
]
const MAX_STAT = 255

export default function PokemonDetails({ pokemon, trainers, onClose, onEdit, onDelete }) {
  const accent = typeColor(pokemon.types[0])
  const owners = trainers.filter((t) => t.pokemonIds.includes(pokemon.id))
  const total = STATS.reduce((sum, [, k]) => sum + pokemon[k], 0)

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ '--accent': accent }}>
        <button className="close" onClick={onClose} aria-label="Fechar">×</button>

        <div className="details-head">
          <PokemonImage id={pokemon.id} name={pokemon.name} className="details-img" />
          <div>
            <span className="card-id">#{String(pokemon.id).padStart(3, '0')}</span>
            <h2>{pokemon.name}</h2>
            <div className="badges">
              {pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        </div>

        <h4>Atributos</h4>
        <div className="stats">
          {STATS.map(([label, key]) => (
            <div className="stat" key={key}>
              <span className="stat-label">{label}</span>
              <span className="stat-value">{pokemon[key]}</span>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${Math.min(100, (pokemon[key] / MAX_STAT) * 100)}%` }} />
              </div>
            </div>
          ))}
          <div className="stat total">
            <span className="stat-label">Total</span>
            <span className="stat-value">{total}</span>
          </div>
        </div>

        {owners.length > 0 && (
          <>
            <h4>Treinadores</h4>
            <p className="owners">{owners.map((t) => t.name).join(', ')}</p>
          </>
        )}

        <div className="actions">
          <button className="btn" onClick={() => onEdit(pokemon)}>✏️ Editar</button>
          <button className="btn danger" onClick={() => onDelete(pokemon)}>🗑️ Excluir</button>
        </div>
      </div>
    </div>
  )
}
