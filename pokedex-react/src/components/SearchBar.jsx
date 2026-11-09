import '../css/SearchBar.css'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pesquisar Pokémon por nome ou ID..."
        aria-label="Pesquisar Pokémon"
      />
      {value && (
        <button className="clear" onClick={() => onChange('')} aria-label="Limpar pesquisa">
          ✕
        </button>
      )}
    </div>
  )
}
