function buildLabel(build) {
  if (build < 30) return 'slim build'
  if (build > 70) return 'muscular build'
  return 'medium build'
}

export function buildImagePrompt(character) {
  const { name, sheet, appearance } = character
  const traits = sheet.personality.traits.join(', ')
  const buildLabel_ = buildLabel(appearance.build)

  return [
    `Portrait of ${name},`,
    traits ? `${traits} personality,` : '',
    `${appearance.outfitStyle},`,
    `${appearance.hairColor} hair,`,
    `${buildLabel_},`,
    `${appearance.eyeColor} eyes,`,
    'high quality character art, comic book style, detailed, dramatic lighting',
  ]
    .filter(Boolean)
    .join(' ')
}
