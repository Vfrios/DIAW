import { typeColor } from '../typeColors.js'

export default function TypeBadge({ type }) {
  return (
    <span className="type-badge" style={{ background: typeColor(type) }}>
      {type}
    </span>
  )
}
