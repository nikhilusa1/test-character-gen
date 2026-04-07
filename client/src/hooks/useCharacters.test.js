import { renderHook, act } from '@testing-library/react'
import { useCharacters } from './useCharacters'

beforeEach(() => localStorage.clear())

test('starts with one blank character', () => {
  const { result } = renderHook(() => useCharacters())
  expect(result.current.characters).toHaveLength(1)
  expect(result.current.current.name).toBe('')
})

test('createCharacter adds a new blank character and selects it', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.createCharacter())
  expect(result.current.characters).toHaveLength(2)
})

test('updateCurrent merges changes into the current character', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.updateCurrent({ name: 'Aria' }))
  expect(result.current.current.name).toBe('Aria')
})

test('updateSheet merges changes into sheet', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.updateSheet({ backstory: 'Born in a storm.' }))
  expect(result.current.current.sheet.backstory).toBe('Born in a storm.')
})

test('updateAppearance merges changes into appearance', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.updateAppearance({ hairColor: 'red' }))
  expect(result.current.current.appearance.hairColor).toBe('red')
})

test('setCurrentById switches active character', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.createCharacter())
  const secondId = result.current.characters[1].id
  act(() => result.current.setCurrentById(secondId))
  expect(result.current.current.id).toBe(secondId)
})

test('persists to localStorage', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.updateCurrent({ name: 'Zora' }))
  const stored = JSON.parse(localStorage.getItem('character-studio-characters'))
  expect(stored[0].name).toBe('Zora')
})
