import PortraitArea from './PortraitArea'
import AppearanceControls from './AppearanceControls'
import { useGenerate } from '../hooks/useGenerate'
import { buildImagePrompt } from '../utils/promptBuilder'

export default function VisualEditor({ character, onUpdateAppearance, onUpdateImage }) {
  const { generate, loading, error } = useGenerate()

  async function handleGenerate() {
    const prompt = buildImagePrompt(character)
    const imageData = await generate(prompt)
    if (imageData) onUpdateImage(imageData)
  }

  return (
    <div style={{
      width: 340,
      flexShrink: 0,
      background: 'var(--bg-panel)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <PortraitArea
        imageData={character.imageData}
        loading={loading}
        error={error}
        onGenerate={handleGenerate}
      />
      <AppearanceControls
        appearance={character.appearance}
        onChange={onUpdateAppearance}
      />
      <div style={{ padding: '0 14px 14px' }}>
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%' }}>
          Apply & Regenerate
        </button>
      </div>
    </div>
  )
}
