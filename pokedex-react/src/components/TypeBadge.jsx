import { getTypeColor } from '../utils/typeColors'
import '../css/TypeBadge.css'

export default function TypeBadge({ type }) {
  return (
    <span className="badge" style={{ background: getTypeColor(type) }}>
      {type}
    </span>
  )
}
