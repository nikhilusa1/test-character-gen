import { useCharacters } from './hooks/useCharacters'
import TopBar from './components/TopBar'
import NameBar from './components/NameBar'

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
        <div style={{ color: 'var(--text-muted)', padding: 24 }}>Panels coming soon</div>
      </div>
    </div>
  )
}
