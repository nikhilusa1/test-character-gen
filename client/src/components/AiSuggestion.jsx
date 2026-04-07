export default function AiSuggestion({ suggestion, onAccept, onDismiss }) {
  if (!suggestion) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--accent)',
      borderRadius: 8,
      padding: '10px 12px',
      marginTop: 6,
    }}>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-primary)', marginBottom: 8 }}>
        {suggestion}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onAccept} style={{ padding: '4px 12px', fontSize: 12 }}>✓ Use this</button>
        <button onClick={onDismiss} className="secondary" style={{ padding: '4px 12px', fontSize: 12 }}>✕ Dismiss</button>
      </div>
    </div>
  )
}
