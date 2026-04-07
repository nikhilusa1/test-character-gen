import { useState } from 'react'

export function useAssist() {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [error, setError] = useState(null)

  async function requestAssist({ field, character }) {
    setLoading(true)
    setError(null)
    setSuggestion(null)
    try {
      const res = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, character }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'AI assist failed')
        return
      }
      setSuggestion(data.suggestion)
    } catch (err) {
      setError('Network error — check your connection')
    } finally {
      setLoading(false)
    }
  }

  function clearSuggestion() {
    setSuggestion(null)
    setError(null)
  }

  return { requestAssist, clearSuggestion, suggestion, loading, error }
}
