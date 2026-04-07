import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useAssist } from './useAssist'

beforeEach(() => {
  global.fetch = vi.fn()
})

test('starts idle', () => {
  const { result } = renderHook(() => useAssist())
  expect(result.current.loading).toBe(false)
  expect(result.current.suggestion).toBeNull()
})

test('assist calls /api/assist and sets suggestion', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ suggestion: 'She was born in a storm.' }),
  })

  const { result } = renderHook(() => useAssist())
  await act(async () => {
    await result.current.requestAssist({ field: 'backstory', character: { name: 'Aria' } })
  })

  expect(result.current.suggestion).toBe('She was born in a storm.')
})

test('clearSuggestion resets suggestion to null', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ suggestion: 'text' }),
  })

  const { result } = renderHook(() => useAssist())
  await act(async () => {
    await result.current.requestAssist({ field: 'backstory', character: {} })
  })
  act(() => result.current.clearSuggestion())
  expect(result.current.suggestion).toBeNull()
})
