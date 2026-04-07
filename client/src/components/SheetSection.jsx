import { useAssist } from '../hooks/useAssist'
import AiSuggestion from './AiSuggestion'

export default function SheetSection({ label, field, value, onChange, character, rows = 4 }) {
  const { requestAssist, clearSuggestion, suggestion, loading, error } = useAssist()

  function handleAccept() {
    onChange(suggestion)
    clearSuggestion()
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <label>{label}</label>
        <button
          className="secondary"
          onClick={() => requestAssist({ field, character })}
          disabled={loading}
          style={{ padding: '2px 10px', fontSize: 11, borderRadius: 4 }}
        >
          {loading ? '...' : '✨ AI Assist'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        style={{ width: '100%' }}
        placeholder={`Write about ${label.toLowerCase()}...`}
      />
      {error && <p className="error-text" style={{ marginTop: 4 }}>{error}</p>}
      <AiSuggestion
        suggestion={suggestion}
        onAccept={handleAccept}
        onDismiss={clearSuggestion}
      />
    </div>
  )
}
