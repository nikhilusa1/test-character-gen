import { buildImagePrompt } from './promptBuilder'

const baseCharacter = {
  name: 'Aria',
  sheet: {
    personality: { traits: ['Stubborn', 'Loyal'], description: 'Fears abandonment.' },
    backstory: 'Born in a war-torn city.',
  },
  appearance: {
    hairColor: 'silver',
    build: 80,
    outfitStyle: 'Fantasy Armor',
    eyeColor: 'green',
  },
}

test('includes character name', () => {
  expect(buildImagePrompt(baseCharacter)).toContain('Aria')
})

test('includes traits', () => {
  expect(buildImagePrompt(baseCharacter)).toContain('Stubborn')
  expect(buildImagePrompt(baseCharacter)).toContain('Loyal')
})

test('includes appearance details', () => {
  const prompt = buildImagePrompt(baseCharacter)
  expect(prompt).toContain('silver hair')
  expect(prompt).toContain('green eyes')
  expect(prompt).toContain('Fantasy Armor')
})

test('includes muscular build label when build > 70', () => {
  expect(buildImagePrompt(baseCharacter)).toContain('muscular build')
})

test('includes slim build label when build < 30', () => {
  const slim = { ...baseCharacter, appearance: { ...baseCharacter.appearance, build: 20 } }
  expect(buildImagePrompt(slim)).toContain('slim build')
})

test('includes medium build label when build between 30 and 70', () => {
  const medium = { ...baseCharacter, appearance: { ...baseCharacter.appearance, build: 50 } }
  expect(buildImagePrompt(medium)).toContain('medium build')
})

test('always ends with quality suffix', () => {
  const prompt = buildImagePrompt(baseCharacter)
  expect(prompt).toContain('high quality character art')
})
