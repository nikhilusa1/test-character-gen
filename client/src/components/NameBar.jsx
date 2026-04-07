const MEDIA_OPTIONS = ['Videogame', 'Comic']
const GENRE_OPTIONS = ['Fantasy', 'Sci-Fi', 'Horror', 'Contemporary', 'Historical', 'Western']

export default function NameBar({ character, onUpdate }) {
  function toggleTag(tag) {
    const tags = character.tags.includes(tag)
      ? character.tags.filter(t => t !== tag)
      : [...character.tags, tag]
    onUpdate({ tags })
  }

  return (
    <div style={{
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0,
    }}>
      <input
        value={character.name}
        onChange={e => onUpdate({ name: e.target.value })}
        placeholder="Character name..."
        style={{ fontSize: 16, fontWeight: 600, width: 240 }}
      />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[...MEDIA_OPTIONS, ...GENRE_OPTIONS].map(tag => (
          <button
            key={tag}
            className="secondary"
            onClick={() => toggleTag(tag)}
            style={{
              padding: '3px 10px',
              fontSize: 12,
              borderRadius: 20,
              background: character.tags.includes(tag) ? 'var(--accent-dim)' : undefined,
              borderColor: character.tags.includes(tag) ? 'var(--accent)' : undefined,
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
