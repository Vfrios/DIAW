import { useState } from 'react'
import { spriteUrl } from '../typeColors.js'

export default function PokemonImage({ id, name, className }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className={`img-fallback ${className || ''}`}>?</div>
  return (
    <img
      className={className}
      src={spriteUrl(id)}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
