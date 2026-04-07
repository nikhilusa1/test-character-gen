import { useState } from 'react'

export function useGenerate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function generate(prompt) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Image generation failed')
        return null
      }
      return data.imageData
    } catch (err) {
      setError('Network error — check your connection')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { generate, loading, error }
}
