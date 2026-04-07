import { useCharacters } from './hooks/useCharacters'
import TopBar from './components/TopBar'
import NameBar from './components/NameBar'
import CharacterSheet from './components/CharacterSheet'
import VisualEditor from './components/VisualEditor'

export default function App() {
  const { characters, current, createCharacter, updateCurrent, updateSheet, updateAppearance, setCurrentById } = useCharacters()

  function handleUpdateImage(imageData) {
    updateCurrent({ imageData })
  }

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
        <VisualEditor
          character={current}
          onUpdateAppearance={updateAppearance}
          onUpdateImage={handleUpdateImage}
        />
      </div>
    </div>
  )
}
