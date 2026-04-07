import SheetSection from './SheetSection'
import TraitPills from './TraitPills'
import { useAssist } from '../hooks/useAssist'
import AiSuggestion from './AiSuggestion'

export default function CharacterSheet({ character, onUpdateSheet }) {
  const personalityAssist = useAssist()

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '16px 18px',
      background: 'var(--bg-panel)',
      borderRight: '2px solid var(--border)',
    }}>
      <SheetSection
        label="Backstory"
        field="backstory"
        value={character.sheet.backstory}
        onChange={val => onUpdateSheet({ backstory: val })}
        character={character}
        rows={5}
      />

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <label>Personality & Psychology</label>
          <button
            className="secondary"
            onClick={() => personalityAssist.requestAssist({ field: 'personality', character })}
            disabled={personalityAssist.loading}
            style={{ padding: '2px 10px', fontSize: 11, borderRadius: 4 }}
          >
            {personalityAssist.loading ? '...' : '✨ AI Assist'}
          </button>
        </div>
        <TraitPills
          traits={character.sheet.personality.traits}
          onChange={traits => onUpdateSheet({ personality: { ...character.sheet.personality, traits } })}
        />
        <textarea
          value={character.sheet.personality.description}
          onChange={e => onUpdateSheet({ personality: { ...character.sheet.personality, description: e.target.value } })}
          rows={3}
          style={{ width: '100%' }}
          placeholder="Fears, motivations, inner conflicts..."
        />
        {personalityAssist.error && <p className="error-text" style={{ marginTop: 4 }}>{personalityAssist.error}</p>}
        <AiSuggestion
          suggestion={personalityAssist.suggestion}
          onAccept={() => {
            onUpdateSheet({ personality: { ...character.sheet.personality, description: personalityAssist.suggestion } })
            personalityAssist.clearSuggestion()
          }}
          onDismiss={personalityAssist.clearSuggestion}
        />
      </div>

      <SheetSection
        label="Relationships"
        field="relationships"
        value={character.sheet.relationships}
        onChange={val => onUpdateSheet({ relationships: val })}
        character={character}
        rows={4}
      />

      <SheetSection
        label="Role & Arc"
        field="arc"
        value={character.sheet.arc}
        onChange={val => onUpdateSheet({ arc: val })}
        character={character}
        rows={4}
      />
    </div>
  )
}
