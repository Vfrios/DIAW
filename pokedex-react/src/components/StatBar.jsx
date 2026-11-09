import '../css/StatBar.css'

const MAX = 255

export default function StatBar({ label, value, color }) {
  const pct = Math.min(100, (value / MAX) * 100)
  return (
    <div className="stat">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      <div className="track">
        <div className="fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
