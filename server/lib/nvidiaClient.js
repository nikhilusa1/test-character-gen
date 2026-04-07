const apiKey = process.env.NVIDIA_API_KEY
const OpenAI = require('openai')

const llmClient = new OpenAI({
  apiKey,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})

async function generateImage(prompt) {
  const response = await fetch(
    'https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: 5,
        sampler: 'K_DPM_2_ANCESTRAL',
        seed: 0,
        steps: 25,
        style_preset: 'comic-book',
      }),
    }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`NVIDIA image API error ${response.status}: ${body}`)
  }

  const data = await response.json()
  const b64 = data.artifacts?.[0]?.base64
  if (!b64) throw new Error('No image data in NVIDIA response')
  return `data:image/png;base64,${b64}`
}

async function assist({ systemPrompt, userMessage }) {
  const completion = await llmClient.chat.completions.create({
    model: 'meta/llama-3.1-70b-instruct',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 300,
    temperature: 0.8,
  })
  return completion.choices[0].message.content.trim()
}

module.exports = { generateImage, assist }
