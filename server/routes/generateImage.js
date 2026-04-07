const express = require('express')
const { generateImage } = require('../lib/nvidiaClient')

const router = express.Router()

router.post('/', async (req, res) => {
  const { prompt } = req.body
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' })
  }
  try {
    const imageData = await generateImage(prompt)
    res.json({ imageData })
  } catch (err) {
    console.error('Image generation error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
