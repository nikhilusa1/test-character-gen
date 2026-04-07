import { useCharacters } from './hooks/useCharacters'
import TopBar from './components/TopBar'
import NameBar from './components/NameBar'
import CharacterSheet from './components/CharacterSheet'

export default function App() {
  const { characters, current, createCharacter, updateCurrent, updateSheet, updateAppearance, setCurrentById } = useCharacters()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar
        characters={characters}
        currentId={current.id}
        onNew={createCharacter}
        onSelect={setCurrentById}
      />
      <NameBar character={current} onUpdate={updateCurrent} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <CharacterSheet character={current} onUpdateSheet={updateSheet} />
        <div style={{ width: 340, background: 'var(--bg-base)', color: 'var(--text-muted)', padding: 24 }}>
          Visual editor coming soon
        </div>
      </div>
    </div>
  )
}
