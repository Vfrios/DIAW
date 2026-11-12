import { useState } from 'react'

const FIELDS = [
  ['hp', 'HP'],
  ['attack', 'Ataque'],
  ['defense', 'Defesa'],
  ['specialAttack', 'Ataque Esp.'],
  ['specialDefense', 'Defesa Esp.'],
  ['speed', 'Velocidade'],
]

const EMPTY = {
  name: '', hp: 50, attack: 50, defense: 50,
  specialAttack: 50, specialDefense: 50, speed: 50, types: [],
}

export default function PokemonForm({ pokemon, allTypes, onSave, onCancel }) {
  const editing = Boolean(pokemon)
  const [form, setForm] = useState(pokemon ? { ...pokemon } : EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const toggleType = (name) =>
    setForm((f) => ({
      ...f,
      types: f.types.includes(name) ? f.types.filter((t) => t !== name) : [...f.types, name],
    }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Informe o nome do Pokémon.')
    if (form.types.length === 0) return setError('Selecione pelo menos um tipo.')
    setSaving(true)
    try {
      const payload = { ...form, name: form.name.trim() }
      FIELDS.forEach(([k]) => { payload[k] = Number(payload[k]) })
      await onSave(payload)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="overlay" onClick={onCancel}>
      <form className="modal form" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="close" onClick={onCancel} aria-label="Fechar">×</button>
        <h2>{editing ? `Editar ${pokemon.name}` : 'Novo Pokémon'}</h2>

        <label className="field">
          <span>Nome</span>
          <input value={form.name} onChange={(e) => setField('name', e.target.value)} autoFocus />
        </label>

        <div className="grid-stats">
          {FIELDS.map(([key, label]) => (
            <label className="field" key={key}>
              <span>{label}</span>
              <input
                type="number" min="1" max="255"
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
              />
            </label>
          ))}
        </div>

        <span className="field-title">Tipos</span>
        <div className="type-picker">
          {allTypes.map((t) => (
            <button
              type="button" key={t.id}
              className={`chip ${form.types.includes(t.name) ? 'on' : ''}`}
              onClick={() => toggleType(t.name)}
            >
              {t.name}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button type="button" className="btn ghost" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
