export default function PortraitArea({ imageData, loading, error, onGenerate }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: '1px solid var(--border)',
      position: 'relative',
      minHeight: 220,
      background: 'var(--bg-base)',
    }}>
      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎨</div>
          <p>Generating portrait...</p>
        </div>
      )}
      {!loading && error && (
        <div style={{ textAlign: 'center' }}>
          <p className="error-text" style={{ marginBottom: 8 }}>{error}</p>
          <button onClick={onGenerate}>Retry</button>
        </div>
      )}
      {!loading && !error && imageData && (
        <img
          src={imageData}
          alt="Character portrait"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      )}
      {!loading && !error && !imageData && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎨</div>
          <p style={{ fontSize: 13 }}>Fill in the character sheet,<br />then generate a portrait</p>
        </div>
      )}
      <button
        onClick={onGenerate}
        disabled={loading}
        style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 12, padding: '4px 12px' }}
      >
        {imageData ? '↻ Regenerate' : '✨ Generate'}
      </button>
    </div>
  )
}
