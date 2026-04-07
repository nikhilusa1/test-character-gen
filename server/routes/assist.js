const express = require('express')
const { assist } = require('../lib/nvidiaClient')

const router = express.Router()

const FIELD_PROMPTS = {
  backstory: 'Write 2-3 sentences of backstory for this character. Focus on formative events that shaped who they are.',
  personality: "Write 2-3 sentences about this character's personality, fears, and inner conflicts.",
  relationships: "Write 2-3 sentences about the key relationships in this character's life and how those relationships affect them.",
  arc: "Write 2-3 sentences about this character's role in the story and how they change over the course of it.",
}

router.post('/', async (req, res) => {
  const { field, character } = req.body
  if (!field || typeof field !== 'string') {
    return res.status(400).json({ error: 'field is required' })
  }
  if (!character || typeof character !== 'object') {
    return res.status(400).json({ error: 'character is required' })
  }

  const fieldInstruction = FIELD_PROMPTS[field] ?? `Write 2-3 sentences about the character's ${field}.`

  const systemPrompt = `You are a creative writing assistant helping develop story characters for videogames and comics. Be vivid, specific, and avoid clichés. Return only the suggested text — no preamble, no quotes.`

  const userMessage = `Character: ${character.name || 'Unnamed'}
Traits: ${character.sheet?.personality?.traits?.join(', ') || 'none defined'}
Current backstory: ${character.sheet?.backstory || 'none'}
Current personality: ${character.sheet?.personality?.description || 'none'}

${fieldInstruction}`

  try {
    const suggestion = await assist({ systemPrompt, userMessage })
    res.json({ suggestion })
  } catch (err) {
    console.error('Assist error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
