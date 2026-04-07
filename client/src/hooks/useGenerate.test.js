import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useGenerate } from './useGenerate'

beforeEach(() => {
  global.fetch = vi.fn()
})

test('starts idle', () => {
  const { result } = renderHook(() => useGenerate())
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBeNull()
})

test('generate calls /api/generate-image and returns imageData', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ imageData: 'data:image/png;base64,abc' }),
  })

  const { result } = renderHook(() => useGenerate())
  let imageData
  await act(async () => {
    imageData = await result.current.generate('Portrait of Aria')
  })

  expect(imageData).toBe('data:image/png;base64,abc')
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBeNull()
})

test('sets error on failed response', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: 'rate limited' }),
  })

  const { result } = renderHook(() => useGenerate())
  await act(async () => {
    await result.current.generate('Portrait of Aria')
  })

  expect(result.current.error).toBe('rate limited')
})
