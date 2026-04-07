import { useState, useEffect } from 'react'

const STORAGE_KEY = 'character-studio-characters'

function newCharacter() {
  return {
    id: crypto.randomUUID(),
    name: '',
    tags: [],
    sheet: {
      backstory: '',
      personality: { traits: [], description: '' },
      relationships: '',
      arc: '',
    },
    appearance: {
      hairColor: 'black',
      build: 40,
      outfitStyle: 'Fantasy Armor',
      eyeColor: 'brown',
    },
    imageData: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}
  return [newCharacter()]
}

export function useCharacters() {
  const [{ characters, currentId }, setState] = useState(() => {
    const chars = load()
    return { characters: chars, currentId: chars[0].id }
  })

  const setCharacters = (value) => {
    setState(prev => ({
      ...prev,
      characters: typeof value === 'function' ? value(prev.characters) : value
    }))
  }

  const setCurrentId = (value) => {
    setState(prev => ({
      ...prev,
      currentId: typeof value === 'function' ? value(prev.currentId) : value
    }))
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
  }, [characters])

  const current = characters.find(c => c.id === currentId) ?? characters[0]

  function updateCharacter(id, changes) {
    setCharacters(prev =>
      prev.map(c => c.id === id ? { ...c, ...changes, updatedAt: new Date().toISOString() } : c)
    )
  }

  function createCharacter() {
    const c = newCharacter()
    setCharacters(prev => [...prev, c])
    setCurrentId(c.id)
  }

  function updateCurrent(changes) {
    updateCharacter(currentId, changes)
  }

  function updateSheet(sheetChanges) {
    updateCurrent({ sheet: { ...current.sheet, ...sheetChanges } })
  }

  function updateAppearance(appearanceChanges) {
    updateCurrent({ appearance: { ...current.appearance, ...appearanceChanges } })
  }

  function setCurrentById(id) {
    if (characters.some(c => c.id === id)) setCurrentId(id)
  }

  return { characters, current, createCharacter, updateCurrent, updateSheet, updateAppearance, setCurrentById }
}
