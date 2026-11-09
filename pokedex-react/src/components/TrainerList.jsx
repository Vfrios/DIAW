import { imageUrl } from '../utils/typeColors'
import '../css/TrainerList.css'

const MAX_BADGES = 9

export default function TrainerList({ trainers, pokemon, onSelect }) {
  const byId = Object.fromEntries(pokemon.map((p) => [p.id, p]))

  return (
    <div className="trainers">
      {trainers.map((t) => {
        // agrupa repetidos (ex.: Koga tem 3 Venonat)
        const counts = t.pokemon.reduce((acc, id) => {
          acc[id] = (acc[id] || 0) + 1
          return acc
        }, {})
        return (
          <article className="trainer" key={t.id}>
            <h3>{t.name}</h3>
            <div className="badges" aria-label={`${t.badges} insígnias`}>
              {Array.from({ length: MAX_BADGES }, (_, i) => (
                <span key={i} className={`dot ${i < t.badges ? 'on' : ''}`} />
              ))}
              <span>&nbsp;{t.badges} insígnias</span>
            </div>
            {t.pokemon.length ? (
              <ul>
                {Object.entries(counts).map(([id, qty]) => {
                  const p = byId[id]
                  return (
                    <li key={id}>
                      <button onClick={() => onSelect(p)}>
                        <img src={imageUrl(p.id)} alt="" loading="lazy" />
                        {p.name}
                        {qty > 1 && <span className="qty">×{qty}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="none">Nenhum Pokémon.</p>
            )}
          </article>
        )
      })}
    </div>
  )
}
