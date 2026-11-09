import { getTypeColor } from '../utils/typeColors'
import '../css/TypeFilter.css'

export default function TypeFilter({ types, selected, onSelect }) {
  return (
    <div className="type-filter" role="group" aria-label="Filtrar por tipo">
      <button
        className={`type-chip all ${selected === '' ? 'active' : ''}`}
        onClick={() => onSelect('')}
      >
        Todos
      </button>
      {types.map((t) => (
        <button
          key={t}
          className={`type-chip ${selected === t ? 'active' : ''}`}
          style={{ '--chip': getTypeColor(t) }}
          onClick={() => onSelect(selected === t ? '' : t)}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
