export default function TopBar({ characters, currentId, onNew, onSelect }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderBottom: '1px solid var(--border)',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0,
    }}>
      <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>⚔️ Character Studio</span>
      <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button onClick={onNew}>+ New Character</button>
        <select
          value={currentId}
          onChange={e => onSelect(e.target.value)}
          style={{ minWidth: 160 }}
        >
          {characters.map(c => (
            <option key={c.id} value={c.id}>
              {c.name || 'Unnamed Character'}
            </option>
          ))}
        </select>
      </span>
    </div>
  )
}
