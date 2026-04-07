import { useState } from 'react'

export default function TraitPills({ traits, onChange }) {
  const [input, setInput] = useState('')

  function addTrait() {
    const trimmed = input.trim()
    if (!trimmed || traits.includes(trimmed)) return
    onChange([...traits, trimmed])
    setInput('')
  }

  function removeTrait(trait) {
    onChange(traits.filter(t => t !== trait))
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {traits.map(trait => (
          <span
            key={trait}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent)',
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {trait}
            <span
              onClick={() => removeTrait(trait)}
              style={{ cursor: 'pointer', opacity: 0.6, fontSize: 14, lineHeight: 1 }}
            >×</span>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTrait()}
          placeholder="Add trait..."
          style={{ flex: 1 }}
        />
        <button onClick={addTrait} style={{ padding: '6px 12px' }}>+</button>
      </div>
    </div>
  )
}
