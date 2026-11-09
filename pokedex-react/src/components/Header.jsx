import '../css/Header.css'

export default function Header({ total, favorites }) {
  return (
    <header className="header">
      <div className="lens" aria-hidden="true" />
      <div>
        <h1>Pokédex</h1>
        <p>Primeira geração · 151 Pokémon</p>
      </div>
      <div className="spacer" />
      <div className="counter">
        <b>{total}</b>
        Pokémon · {favorites} favoritos
      </div>
    </header>
  )
}
