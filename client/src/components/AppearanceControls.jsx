const HAIR_COLORS = [
  { label: 'Black', value: 'black', hex: '#1a1a1a' },
  { label: 'Brown', value: 'brown', hex: '#8B4513' },
  { label: 'Blonde', value: 'blonde', hex: '#FFD700' },
  { label: 'Silver', value: 'silver', hex: '#C0C0C0' },
  { label: 'Red', value: 'red', hex: '#CC2200' },
  { label: 'White', value: 'white', hex: '#f0f0f0' },
]

const EYE_COLORS = [
  { label: 'Brown', value: 'brown', hex: '#8B4513' },
  { label: 'Blue', value: 'blue', hex: '#4a90d9' },
  { label: 'Green', value: 'green', hex: '#2d8a4e' },
  { label: 'Grey', value: 'grey', hex: '#888888' },
  { label: 'Amber', value: 'amber', hex: '#FFB300' },
  { label: 'Violet', value: 'violet', hex: '#9b59b6' },
]

const OUTFIT_STYLES = ['Fantasy Armor', 'Street Clothes', 'Sci-Fi Suit', 'Robes', 'Casual', 'Military']

export default function AppearanceControls({ appearance, onChange }) {
  return (
    <div style={{ padding: 14, overflowY: 'auto' }}>
      <label style={{ marginBottom: 10 }}>Appearance</label>

      <div style={{ marginBottom: 14 }}>
        <label>Hair Color</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {HAIR_COLORS.map(c => (
            <div
              key={c.value}
              title={c.label}
              onClick={() => onChange({ hairColor: c.value })}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: c.hex,
                cursor: 'pointer',
                border: appearance.hairColor === c.value ? '2px solid var(--accent)' : '2px solid transparent',
                boxShadow: appearance.hairColor === c.value ? '0 0 0 1px var(--accent)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label>Eye Color</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EYE_COLORS.map(c => (
            <div
              key={c.value}
              title={c.label}
              onClick={() => onChange({ eyeColor: c.value })}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: c.hex,
                cursor: 'pointer',
                border: appearance.eyeColor === c.value ? '2px solid var(--accent)' : '2px solid transparent',
                boxShadow: appearance.eyeColor === c.value ? '0 0 0 1px var(--accent)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label>Build</label>
        <input
          type="range"
          min={0}
          max={100}
          value={appearance.build}
          onChange={e => onChange({ build: Number(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          <span>Slim</span><span>Medium</span><span>Muscular</span>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label>Outfit Style</label>
        <select
          value={appearance.outfitStyle}
          onChange={e => onChange({ outfitStyle: e.target.value })}
          style={{ width: '100%' }}
        >
          {OUTFIT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  )
}
