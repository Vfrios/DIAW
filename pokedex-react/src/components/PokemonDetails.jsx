import { useEffect, useState } from 'react'
import TypeBadge from './TypeBadge'
import StatBar from './StatBar'
import { getTypeColor, imageUrl, formatId } from '../utils/typeColors'
import '../css/PokemonDetails.css'

export default function PokemonDetails({ pokemon, trainers, onClose, onPrev, onNext }) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => setImgError(false), [pokemon.id])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  const types = pokemon.types.length ? pokemon.types : ['Typeless']
  const c1 = getTypeColor(types[0])
  const c2 = getTypeColor(types[1] || types[0])
  const owners = trainers.filter((t) => t.pokemon.includes(pokemon.id))
  const total =
    pokemon.hp + pokemon.attack + pokemon.defense +
    pokemon.specialAttack + pokemon.specialDefense + pokemon.speed

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ '--c1': c1, '--c2': c2 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${pokemon.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close" onClick={onClose} aria-label="Fechar">✕</button>
        <div className="top">
          <div className="info">
            <div className="id">{formatId(pokemon.id)}</div>
            <h2>{pokemon.name}</h2>
            <div className="types">
              {types.map((t) => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
          {!imgError && (
            <img src={imageUrl(pokemon.id)} alt={pokemon.name} onError={() => setImgError(true)} />
          )}
        </div>
        <div className="body">
          <h3>Atributos</h3>
          <StatBar label="HP" value={pokemon.hp} color={c1} />
          <StatBar label="Attack" value={pokemon.attack} color={c1} />
          <StatBar label="Defense" value={pokemon.defense} color={c1} />
          <StatBar label="Special Attack" value={pokemon.specialAttack} color={c1} />
          <StatBar label="Special Defense" value={pokemon.specialDefense} color={c1} />
          <StatBar label="Speed" value={pokemon.speed} color={c1} />
          <div className="total"><span>Total</span><span>{total}</span></div>

          <h3>Treinadores</h3>
          {owners.length ? (
            <div className="owners">
              {owners.map((t) => <span key={t.id}>{t.name}</span>)}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)', margin: 0 }}>Nenhum treinador possui este Pokémon.</p>
          )}

          <div className="nav">
            <button className="btn" onClick={onPrev}>← Anterior</button>
            <button className="btn" onClick={onNext}>Próximo →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
