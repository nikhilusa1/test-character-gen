# Character Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal web app with a split-panel UI for creating deep story characters — character sheet on the left, AI-generated portrait with appearance controls on the right — powered by NVIDIA build.nvidia.com endpoints.

**Architecture:** React (Vite) frontend communicates with a thin Node/Express backend proxy that holds the NVIDIA API key. The frontend stores all character data as JSON in localStorage. Image data is stored as base64 strings.

**Tech Stack:** React 18, Vite, Node 20, Express 4, `openai` SDK (for NVIDIA LLM, OpenAI-compatible), `node-fetch` (for NVIDIA image API), `concurrently` (run client + server together), Vitest + React Testing Library (frontend tests), Jest + Supertest (backend tests)

---

## File Map

```
/
├── package.json                        # root: workspace scripts (dev, test)
├── .gitignore
├── .env                                # NVIDIA_API_KEY (never committed)
├── .env.example
│
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                    # React entry point
│       ├── App.jsx                     # root state + layout
│       ├── components/
│       │   ├── TopBar.jsx              # app name, New Character, My Characters dropdown
│       │   ├── NameBar.jsx             # character name input + tag pills
│       │   ├── CharacterSheet.jsx      # left panel: four sections
│       │   ├── SheetSection.jsx        # reusable section wrapper (label + textarea + AI Assist)
│       │   ├── TraitPills.jsx          # add/remove trait pills for personality
│       │   ├── AiSuggestion.jsx        # inline suggestion box (replace / dismiss)
│       │   ├── VisualEditor.jsx        # right panel container
│       │   ├── PortraitArea.jsx        # image display, generate button, loading/error states
│       │   └── AppearanceControls.jsx  # hair swatches, build slider, outfit dropdown, eye swatches
│       ├── hooks/
│       │   ├── useCharacters.js        # localStorage CRUD for character list
│       │   ├── useGenerate.js          # calls /api/generate-image
│       │   └── useAssist.js            # calls /api/assist
│       └── utils/
│           └── promptBuilder.js        # builds SDXL prompt string from character data
│
└── server/
    ├── package.json
    ├── index.js                        # Express entry point, mounts routes
    ├── routes/
    │   ├── generateImage.js            # POST /api/generate-image
    │   └── assist.js                   # POST /api/assist
    ├── lib/
    │   └── nvidiaClient.js             # NVIDIA API calls (image + LLM)
    └── __tests__/
        ├── generateImage.test.js
        └── assist.test.js
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `.gitignore`
- Create: `.env.example`
- Create: `client/package.json`
- Create: `client/index.html`
- Create: `client/vite.config.js`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`
- Create: `server/package.json`
- Create: `server/index.js`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "character-studio",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "test": "npm test --prefix server && npm test --prefix client"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: Create .gitignore**

```
node_modules/
.env
dist/
.superpowers/
```

- [ ] **Step 3: Create .env.example**

```
NVIDIA_API_KEY=nvapi-your-key-here
```

- [ ] **Step 4: Create .env with the real API key**

```
NVIDIA_API_KEY=nvapi-your-key-here
```

- [ ] **Step 5: Create client/package.json**

```json
{
  "name": "character-studio-client",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^15.0.6",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.0.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 6: Create client/vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
```

- [ ] **Step 7: Create client/src/setupTests.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 8: Create client/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Character Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Create client/src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 10: Create client/src/App.jsx (skeleton)**

```jsx
export default function App() {
  return <div>Character Studio</div>
}
```

- [ ] **Step 11: Create server/package.json**

```json
{
  "name": "character-studio-server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "node --watch index.js",
    "test": "jest --runInBand"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "openai": "^4.47.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

- [ ] **Step 12: Create server/index.js**

```js
require('dotenv').config({ path: '../.env' })
const express = require('express')
const cors = require('cors')
const generateImage = require('./routes/generateImage')
const assist = require('./routes/assist')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/generate-image', generateImage)
app.use('/api/assist', assist)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

module.exports = app
```

- [ ] **Step 13: Install dependencies**

```bash
npm install
npm install --prefix client
npm install --prefix server
```

- [ ] **Step 14: Verify server starts**

```bash
npm run dev --prefix server
```

Expected: `Server running on port 3001`

- [ ] **Step 15: Commit**

```bash
git add package.json .gitignore .env.example client/ server/
git commit -m "feat: project scaffolding — React/Vite client + Express server"
```

---

## Task 2: Character Data Model + localStorage Hook

**Files:**
- Create: `client/src/hooks/useCharacters.js`
- Create: `client/src/hooks/useCharacters.test.js`

- [ ] **Step 1: Write failing tests**

Create `client/src/hooks/useCharacters.test.js`:

```js
import { renderHook, act } from '@testing-library/react'
import { useCharacters } from './useCharacters'

beforeEach(() => localStorage.clear())

const blankCharacter = () => ({
  name: '',
  tags: [],
  sheet: {
    backstory: '',
    personality: { traits: [], description: '' },
    relationships: '',
    arc: '',
  },
  appearance: {
    hairColor: 'black',
    build: 40,
    outfitStyle: 'Fantasy Armor',
    eyeColor: 'brown',
  },
  imageData: null,
})

test('starts with one blank character', () => {
  const { result } = renderHook(() => useCharacters())
  expect(result.current.characters).toHaveLength(1)
  expect(result.current.current.name).toBe('')
})

test('createCharacter adds a new blank character and selects it', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.createCharacter())
  expect(result.current.characters).toHaveLength(2)
})

test('updateCurrent merges changes into the current character', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.updateCurrent({ name: 'Aria' }))
  expect(result.current.current.name).toBe('Aria')
})

test('updateSheet merges changes into sheet', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.updateSheet({ backstory: 'Born in a storm.' }))
  expect(result.current.current.sheet.backstory).toBe('Born in a storm.')
})

test('updateAppearance merges changes into appearance', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.updateAppearance({ hairColor: 'red' }))
  expect(result.current.current.appearance.hairColor).toBe('red')
})

test('setCurrentById switches active character', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.createCharacter())
  const secondId = result.current.characters[1].id
  act(() => result.current.setCurrentById(secondId))
  expect(result.current.current.id).toBe(secondId)
})

test('persists to localStorage', () => {
  const { result } = renderHook(() => useCharacters())
  act(() => result.current.updateCurrent({ name: 'Zora' }))
  const stored = JSON.parse(localStorage.getItem('character-studio-characters'))
  expect(stored[0].name).toBe('Zora')
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test --prefix client
```

Expected: All 7 tests fail with "Cannot find module './useCharacters'"

- [ ] **Step 3: Implement useCharacters.js**

Create `client/src/hooks/useCharacters.js`:

```js
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'character-studio-characters'

function newCharacter() {
  return {
    id: crypto.randomUUID(),
    name: '',
    tags: [],
    sheet: {
      backstory: '',
      personality: { traits: [], description: '' },
      relationships: '',
      arc: '',
    },
    appearance: {
      hairColor: 'black',
      build: 40,
      outfitStyle: 'Fantasy Armor',
      eyeColor: 'brown',
    },
    imageData: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}
  return [newCharacter()]
}

export function useCharacters() {
  const [characters, setCharacters] = useState(load)
  const [currentId, setCurrentId] = useState(() => load()[0].id)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
  }, [characters])

  const current = characters.find(c => c.id === currentId) ?? characters[0]

  function updateCharacter(id, changes) {
    setCharacters(prev =>
      prev.map(c => c.id === id ? { ...c, ...changes, updatedAt: new Date().toISOString() } : c)
    )
  }

  function createCharacter() {
    const c = newCharacter()
    setCharacters(prev => [...prev, c])
    setCurrentId(c.id)
  }

  function updateCurrent(changes) {
    updateCharacter(currentId, changes)
  }

  function updateSheet(sheetChanges) {
    updateCurrent({ sheet: { ...current.sheet, ...sheetChanges } })
  }

  function updateAppearance(appearanceChanges) {
    updateCurrent({ appearance: { ...current.appearance, ...appearanceChanges } })
  }

  function setCurrentById(id) {
    if (characters.some(c => c.id === id)) setCurrentId(id)
  }

  return { characters, current, createCharacter, updateCurrent, updateSheet, updateAppearance, setCurrentById }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test --prefix client
```

Expected: All 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add client/src/hooks/
git commit -m "feat: useCharacters hook with localStorage persistence"
```

---

## Task 3: Prompt Builder Utility

**Files:**
- Create: `client/src/utils/promptBuilder.js`
- Create: `client/src/utils/promptBuilder.test.js`

- [ ] **Step 1: Write failing tests**

Create `client/src/utils/promptBuilder.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test --prefix client
```

Expected: 7 new failures with "Cannot find module './promptBuilder'"

- [ ] **Step 3: Implement promptBuilder.js**

Create `client/src/utils/promptBuilder.js`:

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test --prefix client
```

Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add client/src/utils/
git commit -m "feat: prompt builder utility for SDXL image generation"
```

---

## Task 4: NVIDIA Backend — Image Generation Route

**Files:**
- Create: `server/lib/nvidiaClient.js`
- Create: `server/routes/generateImage.js`
- Create: `server/__tests__/generateImage.test.js`

- [ ] **Step 1: Write failing tests**

Create `server/__tests__/generateImage.test.js`:

```js
const request = require('supertest')
const app = require('../index')

jest.mock('../lib/nvidiaClient', () => ({
  generateImage: jest.fn().mockResolvedValue('data:image/png;base64,fakebase64'),
}))

const { generateImage } = require('../lib/nvidiaClient')

afterEach(() => jest.clearAllMocks())

test('POST /api/generate-image returns imageData on success', async () => {
  const res = await request(app)
    .post('/api/generate-image')
    .send({ prompt: 'Portrait of Aria, silver hair' })

  expect(res.status).toBe(200)
  expect(res.body.imageData).toBe('data:image/png;base64,fakebase64')
  expect(generateImage).toHaveBeenCalledWith('Portrait of Aria, silver hair')
})

test('POST /api/generate-image returns 400 if prompt is missing', async () => {
  const res = await request(app).post('/api/generate-image').send({})
  expect(res.status).toBe(400)
  expect(res.body.error).toMatch(/prompt/)
})

test('POST /api/generate-image returns 500 on NVIDIA error', async () => {
  generateImage.mockRejectedValueOnce(new Error('NVIDIA timeout'))
  const res = await request(app)
    .post('/api/generate-image')
    .send({ prompt: 'Portrait of Aria' })
  expect(res.status).toBe(500)
  expect(res.body.error).toBeDefined()
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test --prefix server
```

Expected: Failures — route and nvidiaClient don't exist yet

- [ ] **Step 3: Create server/lib/nvidiaClient.js**

```js
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
  // NVIDIA returns artifacts array with base64 image
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
```

- [ ] **Step 4: Create server/routes/generateImage.js**

```js
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
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test --prefix server
```

Expected: 3 tests pass

- [ ] **Step 6: Commit**

```bash
git add server/lib/nvidiaClient.js server/routes/generateImage.js server/__tests__/generateImage.test.js
git commit -m "feat: NVIDIA image generation backend route"
```

---

## Task 5: NVIDIA Backend — AI Assist Route

**Files:**
- Create: `server/routes/assist.js`
- Create: `server/__tests__/assist.test.js`

- [ ] **Step 1: Write failing tests**

Create `server/__tests__/assist.test.js`:

```js
const request = require('supertest')
const app = require('../index')

jest.mock('../lib/nvidiaClient', () => ({
  generateImage: jest.fn(),
  assist: jest.fn().mockResolvedValue('She grew up in the shadow of a collapsed empire.'),
}))

const { assist } = require('../lib/nvidiaClient')

afterEach(() => jest.clearAllMocks())

test('POST /api/assist returns suggestion on success', async () => {
  const res = await request(app).post('/api/assist').send({
    field: 'backstory',
    character: { name: 'Aria', sheet: { personality: { traits: ['brave'] } } },
  })
  expect(res.status).toBe(200)
  expect(res.body.suggestion).toBe('She grew up in the shadow of a collapsed empire.')
})

test('POST /api/assist returns 400 if field is missing', async () => {
  const res = await request(app).post('/api/assist').send({ character: {} })
  expect(res.status).toBe(400)
  expect(res.body.error).toMatch(/field/)
})

test('POST /api/assist returns 400 if character is missing', async () => {
  const res = await request(app).post('/api/assist').send({ field: 'backstory' })
  expect(res.status).toBe(400)
})

test('POST /api/assist returns 500 on NVIDIA error', async () => {
  assist.mockRejectedValueOnce(new Error('LLM unavailable'))
  const res = await request(app).post('/api/assist').send({
    field: 'backstory',
    character: { name: 'Aria', sheet: { personality: { traits: [] } } },
  })
  expect(res.status).toBe(500)
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test --prefix server
```

Expected: 4 new failures — assist route doesn't exist

- [ ] **Step 3: Create server/routes/assist.js**

```js
const express = require('express')
const { assist } = require('../lib/nvidiaClient')

const router = express.Router()

const FIELD_PROMPTS = {
  backstory: 'Write 2-3 sentences of backstory for this character. Focus on formative events that shaped who they are.',
  personality: 'Describe 2-3 sentences about this character\'s personality, fears, and inner conflicts.',
  relationships: 'Write 2-3 sentences about the key relationships in this character\'s life and how those relationships affect them.',
  arc: 'Write 2-3 sentences about this character\'s role in the story and how they change over the course of it.',
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
```

- [ ] **Step 4: Mount the route in server/index.js**

In `server/index.js`, it's already mounted (`app.use('/api/assist', assist)`). No changes needed.

- [ ] **Step 5: Run all server tests**

```bash
npm test --prefix server
```

Expected: All 7 server tests pass

- [ ] **Step 6: Commit**

```bash
git add server/routes/assist.js server/__tests__/assist.test.js
git commit -m "feat: NVIDIA LLM AI assist backend route"
```

---

## Task 6: Frontend API Hooks

**Files:**
- Create: `client/src/hooks/useGenerate.js`
- Create: `client/src/hooks/useAssist.js`
- Create: `client/src/hooks/useGenerate.test.js`
- Create: `client/src/hooks/useAssist.test.js`

- [ ] **Step 1: Write failing tests for useGenerate**

Create `client/src/hooks/useGenerate.test.js`:

```js
import { renderHook, act } from '@testing-library/react'
import { useGenerate } from './useGenerate'

beforeEach(() => {
  global.fetch = jest.fn()
})

test('starts idle', () => {
  const { result } = renderHook(() => useGenerate())
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBeNull()
})

test('generate calls /api/generate-image and returns imageData', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ imageData: 'data:image/png;base64,abc' }),
  })

  const { result } = renderHook(() => useGenerate())
  let imageData
  await act(async () => {
    imageData = await result.current.generate('Portrait of Aria')
  })

  expect(imageData).toBe('data:image/png;base64,abc')
  expect(result.current.loading).toBe(false)
  expect(result.current.error).toBeNull()
})

test('sets error on failed response', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ error: 'rate limited' }),
  })

  const { result } = renderHook(() => useGenerate())
  await act(async () => {
    await result.current.generate('Portrait of Aria')
  })

  expect(result.current.error).toBe('rate limited')
})
```

- [ ] **Step 2: Write failing tests for useAssist**

Create `client/src/hooks/useAssist.test.js`:

```js
import { renderHook, act } from '@testing-library/react'
import { useAssist } from './useAssist'

beforeEach(() => {
  global.fetch = jest.fn()
})

test('starts idle', () => {
  const { result } = renderHook(() => useAssist())
  expect(result.current.loading).toBe(false)
  expect(result.current.suggestion).toBeNull()
})

test('assist calls /api/assist and sets suggestion', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ suggestion: 'She was born in a storm.' }),
  })

  const { result } = renderHook(() => useAssist())
  await act(async () => {
    await result.current.requestAssist({ field: 'backstory', character: { name: 'Aria' } })
  })

  expect(result.current.suggestion).toBe('She was born in a storm.')
})

test('clearSuggestion resets suggestion to null', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ suggestion: 'text' }),
  })

  const { result } = renderHook(() => useAssist())
  await act(async () => {
    await result.current.requestAssist({ field: 'backstory', character: {} })
  })
  act(() => result.current.clearSuggestion())
  expect(result.current.suggestion).toBeNull()
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test --prefix client
```

Expected: 6 new failures

- [ ] **Step 4: Implement useGenerate.js**

Create `client/src/hooks/useGenerate.js`:

```js
import { useState } from 'react'

export function useGenerate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function generate(prompt) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Image generation failed')
        return null
      }
      return data.imageData
    } catch (err) {
      setError('Network error — check your connection')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { generate, loading, error }
}
```

- [ ] **Step 5: Implement useAssist.js**

Create `client/src/hooks/useAssist.js`:

```js
import { useState } from 'react'

export function useAssist() {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [error, setError] = useState(null)

  async function requestAssist({ field, character }) {
    setLoading(true)
    setError(null)
    setSuggestion(null)
    try {
      const res = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, character }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'AI assist failed')
        return
      }
      setSuggestion(data.suggestion)
    } catch (err) {
      setError('Network error — check your connection')
    } finally {
      setLoading(false)
    }
  }

  function clearSuggestion() {
    setSuggestion(null)
    setError(null)
  }

  return { requestAssist, clearSuggestion, suggestion, loading, error }
}
```

- [ ] **Step 6: Run all frontend tests**

```bash
npm test --prefix client
```

Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add client/src/hooks/
git commit -m "feat: useGenerate and useAssist frontend API hooks"
```

---

## Task 7: Global Styles (Dark Theme)

**Files:**
- Create: `client/src/styles/global.css`
- Modify: `client/src/main.jsx`

- [ ] **Step 1: Create global.css**

Create `client/src/styles/global.css`:

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-base:     #0d0d1a;
  --bg-panel:    #12121e;
  --bg-elevated: #1a1a2e;
  --bg-control:  #22223a;
  --border:      #3a3a5c;
  --accent:      #7c6af7;
  --accent-dim:  #4a3f9f;
  --text-primary: #e2e8f0;
  --text-muted:  #8888aa;
  --text-label:  #aaaacc;
  --danger:      #ef4444;
  --success:     #22c55e;
}

body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Segoe UI', system-ui, sans-serif;
  font-size: 14px;
  height: 100vh;
  overflow: hidden;
}

#root { height: 100vh; display: flex; flex-direction: column; }

textarea, input, select {
  background: var(--bg-control);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  padding: 8px 10px;
  outline: none;
  transition: border-color 0.15s;
}
textarea:focus, input:focus, select:focus { border-color: var(--accent); }
textarea { resize: vertical; }
select option { background: var(--bg-control); }

button {
  background: var(--accent-dim);
  border: 1px solid var(--accent);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  padding: 6px 14px;
  transition: background 0.15s;
}
button:hover { background: var(--accent); }
button:disabled { opacity: 0.5; cursor: not-allowed; }

button.secondary {
  background: transparent;
  border-color: var(--border);
}
button.secondary:hover { background: var(--bg-elevated); }

button.danger { background: #7f1d1d; border-color: var(--danger); }
button.danger:hover { background: var(--danger); }

label {
  color: var(--text-label);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  display: block;
  margin-bottom: 5px;
}

.error-text { color: var(--danger); font-size: 12px; }
```

- [ ] **Step 2: Import global.css in main.jsx**

Edit `client/src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 3: Commit**

```bash
git add client/src/styles/ client/src/main.jsx
git commit -m "feat: dark theme global CSS"
```

---

## Task 8: App Shell — TopBar + NameBar

**Files:**
- Create: `client/src/components/TopBar.jsx`
- Create: `client/src/components/NameBar.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Create TopBar.jsx**

```jsx
export default function TopBar({ characters, currentId, onNew, onSelect }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderBottom: '1px solid var(--border)',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0,
    }}>
      <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>⚔️ Character Studio</span>
      <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button onClick={onNew}>+ New Character</button>
        <select
          value={currentId}
          onChange={e => onSelect(e.target.value)}
          style={{ minWidth: 160 }}
        >
          {characters.map(c => (
            <option key={c.id} value={c.id}>
              {c.name || 'Unnamed Character'}
            </option>
          ))}
        </select>
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Create NameBar.jsx**

```jsx
const MEDIA_OPTIONS = ['Videogame', 'Comic']
const GENRE_OPTIONS = ['Fantasy', 'Sci-Fi', 'Horror', 'Contemporary', 'Historical', 'Western']

export default function NameBar({ character, onUpdate }) {
  function toggleTag(tag) {
    const tags = character.tags.includes(tag)
      ? character.tags.filter(t => t !== tag)
      : [...character.tags, tag]
    onUpdate({ tags })
  }

  return (
    <div style={{
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexShrink: 0,
    }}>
      <input
        value={character.name}
        onChange={e => onUpdate({ name: e.target.value })}
        placeholder="Character name..."
        style={{ fontSize: 16, fontWeight: 600, width: 240 }}
      />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[...MEDIA_OPTIONS, ...GENRE_OPTIONS].map(tag => (
          <button
            key={tag}
            className="secondary"
            onClick={() => toggleTag(tag)}
            style={{
              padding: '3px 10px',
              fontSize: 12,
              borderRadius: 20,
              background: character.tags.includes(tag) ? 'var(--accent-dim)' : undefined,
              borderColor: character.tags.includes(tag) ? 'var(--accent)' : undefined,
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update App.jsx**

```jsx
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
        {/* panels go here */}
        <div style={{ color: 'var(--text-muted)', padding: 24 }}>Panels coming soon</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify visually**

```bash
npm run dev
```

Open http://localhost:5173. Expected: dark top bar with "⚔️ Character Studio", "+ New Character" button, character name dropdown, name input, tag pills below.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/TopBar.jsx client/src/components/NameBar.jsx client/src/App.jsx
git commit -m "feat: app shell — TopBar and NameBar"
```

---

## Task 9: Character Sheet — Left Panel

**Files:**
- Create: `client/src/components/AiSuggestion.jsx`
- Create: `client/src/components/SheetSection.jsx`
- Create: `client/src/components/TraitPills.jsx`
- Create: `client/src/components/CharacterSheet.jsx`

- [ ] **Step 1: Create AiSuggestion.jsx**

```jsx
export default function AiSuggestion({ suggestion, onAccept, onDismiss }) {
  if (!suggestion) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--accent)',
      borderRadius: 8,
      padding: '10px 12px',
      marginTop: 6,
    }}>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-primary)', marginBottom: 8 }}>
        {suggestion}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onAccept} style={{ padding: '4px 12px', fontSize: 12 }}>✓ Use this</button>
        <button onClick={onDismiss} className="secondary" style={{ padding: '4px 12px', fontSize: 12 }}>✕ Dismiss</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create SheetSection.jsx**

```jsx
import { useAssist } from '../hooks/useAssist'
import AiSuggestion from './AiSuggestion'

export default function SheetSection({ label, field, value, onChange, character, rows = 4 }) {
  const { requestAssist, clearSuggestion, suggestion, loading, error } = useAssist()

  function handleAccept() {
    onChange(suggestion)
    clearSuggestion()
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <label>{label}</label>
        <button
          className="secondary"
          onClick={() => requestAssist({ field, character })}
          disabled={loading}
          style={{ padding: '2px 10px', fontSize: 11, borderRadius: 4 }}
        >
          {loading ? '...' : '✨ AI Assist'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        style={{ width: '100%' }}
        placeholder={`Write about ${label.toLowerCase()}...`}
      />
      {error && <p className="error-text" style={{ marginTop: 4 }}>{error}</p>}
      <AiSuggestion
        suggestion={suggestion}
        onAccept={handleAccept}
        onDismiss={clearSuggestion}
      />
    </div>
  )
}
```

- [ ] **Step 3: Create TraitPills.jsx**

```jsx
import { useState } from 'react'

export default function TraitPills({ traits, onChange }) {
  const [input, setInput] = useState('')

  function addTrait() {
    const trimmed = input.trim()
    if (!trimmed || traits.includes(trimmed)) return
    onChange([...traits, trimmed])
    setInput('')
  }

  function removeTrait(trait) {
    onChange(traits.filter(t => t !== trait))
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {traits.map(trait => (
          <span
            key={trait}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent)',
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {trait}
            <span
              onClick={() => removeTrait(trait)}
              style={{ cursor: 'pointer', opacity: 0.6, fontSize: 14, lineHeight: 1 }}
            >×</span>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTrait()}
          placeholder="Add trait..."
          style={{ flex: 1 }}
        />
        <button onClick={addTrait} style={{ padding: '6px 12px' }}>+</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create CharacterSheet.jsx**

```jsx
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
```

- [ ] **Step 5: Mount CharacterSheet in App.jsx**

Edit the panels section in `client/src/App.jsx`:

```jsx
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
```

- [ ] **Step 6: Verify visually**

```bash
npm run dev
```

Open http://localhost:5173. Expected: left panel with Backstory, Personality (trait pills + textarea), Relationships, Role & Arc — all with AI Assist buttons.

- [ ] **Step 7: Commit**

```bash
git add client/src/components/
git commit -m "feat: character sheet left panel with AI assist"
```

---

## Task 10: Visual Editor — Right Panel

**Files:**
- Create: `client/src/components/PortraitArea.jsx`
- Create: `client/src/components/AppearanceControls.jsx`
- Create: `client/src/components/VisualEditor.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Create PortraitArea.jsx**

```jsx
export default function PortraitArea({ imageData, loading, error, onGenerate }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: '1px solid var(--border)',
      position: 'relative',
      minHeight: 220,
      background: 'var(--bg-base)',
    }}>
      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎨</div>
          <p>Generating portrait...</p>
        </div>
      )}
      {!loading && error && (
        <div style={{ textAlign: 'center' }}>
          <p className="error-text" style={{ marginBottom: 8 }}>{error}</p>
          <button onClick={onGenerate}>Retry</button>
        </div>
      )}
      {!loading && !error && imageData && (
        <img
          src={imageData}
          alt="Character portrait"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      )}
      {!loading && !error && !imageData && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎨</div>
          <p style={{ fontSize: 13 }}>Fill in the character sheet,<br />then generate a portrait</p>
        </div>
      )}
      <button
        onClick={onGenerate}
        disabled={loading}
        style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 12, padding: '4px 12px' }}
      >
        {imageData ? '↻ Regenerate' : '✨ Generate'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create AppearanceControls.jsx**

```jsx
const HAIR_COLORS = [
  { label: 'Black', value: 'black', hex: '#1a1a1a' },
  { label: 'Brown', value: 'brown', hex: '#8B4513' },
  { label: 'Blonde', value: 'blonde', hex: '#FFD700' },
  { label: 'Silver', value: 'silver', hex: '#C0C0C0' },
  { label: 'Red', value: 'red', hex: '#CC2200' },
  { label: 'White', value: 'white', hex: '#f0f0f0' },
]

const EYE_COLORS = [
  { label: 'Brown', value: 'brown', hex: '#8B4513' },
  { label: 'Blue', value: 'blue', hex: '#4a90d9' },
  { label: 'Green', value: 'green', hex: '#2d8a4e' },
  { label: 'Grey', value: 'grey', hex: '#888888' },
  { label: 'Amber', value: 'amber', hex: '#FFB300' },
  { label: 'Violet', value: 'violet', hex: '#9b59b6' },
]

const OUTFIT_STYLES = ['Fantasy Armor', 'Street Clothes', 'Sci-Fi Suit', 'Robes', 'Casual', 'Military']

export default function AppearanceControls({ appearance, onChange }) {
  return (
    <div style={{ padding: 14, overflowY: 'auto' }}>
      <label style={{ marginBottom: 10 }}>Appearance</label>

      <div style={{ marginBottom: 14 }}>
        <label>Hair Color</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {HAIR_COLORS.map(c => (
            <div
              key={c.value}
              title={c.label}
              onClick={() => onChange({ hairColor: c.value })}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: c.hex,
                cursor: 'pointer',
                border: appearance.hairColor === c.value ? '2px solid var(--accent)' : '2px solid transparent',
                boxShadow: appearance.hairColor === c.value ? '0 0 0 1px var(--accent)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label>Eye Color</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EYE_COLORS.map(c => (
            <div
              key={c.value}
              title={c.label}
              onClick={() => onChange({ eyeColor: c.value })}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: c.hex,
                cursor: 'pointer',
                border: appearance.eyeColor === c.value ? '2px solid var(--accent)' : '2px solid transparent',
                boxShadow: appearance.eyeColor === c.value ? '0 0 0 1px var(--accent)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label>Build</label>
        <input
          type="range"
          min={0}
          max={100}
          value={appearance.build}
          onChange={e => onChange({ build: Number(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          <span>Slim</span><span>Medium</span><span>Muscular</span>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label>Outfit Style</label>
        <select
          value={appearance.outfitStyle}
          onChange={e => onChange({ outfitStyle: e.target.value })}
          style={{ width: '100%' }}
        >
          {OUTFIT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create VisualEditor.jsx**

```jsx
import { useState } from 'react'
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
```

- [ ] **Step 4: Wire VisualEditor into App.jsx**

```jsx
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
```

- [ ] **Step 5: Run full app end-to-end**

```bash
npm run dev
```

Open http://localhost:5173. Expected:
- Full split-panel layout
- Left: character sheet with all 4 sections and AI Assist buttons
- Right: portrait area (placeholder) + hair/eye swatches + build slider + outfit dropdown + "Apply & Regenerate" button

Enter a character name and click "✨ Generate" — should call the server and return a portrait.

- [ ] **Step 6: Run all tests**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add client/src/components/ client/src/App.jsx
git commit -m "feat: visual editor right panel — portrait area + appearance controls"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Split-panel studio layout (Tasks 8–10)
- ✅ Character sheet: backstory, personality (traits + text), relationships, arc (Task 9)
- ✅ AI Assist per field with replace/dismiss (Tasks 5, 9)
- ✅ Portrait area with generate button (Task 10)
- ✅ Appearance controls: hair swatches, eye swatches, build slider, outfit dropdown (Task 10)
- ✅ Apply & Regenerate (Task 10)
- ✅ NVIDIA image endpoint (Task 4)
- ✅ NVIDIA LLM endpoint (Task 5)
- ✅ localStorage persistence (Task 2)
- ✅ Base64 image storage (Task 2 model, Task 10 wired)
- ✅ Error handling: 429, network errors, retry button (Tasks 4, 5, 6, 10)
- ✅ API key in .env, never exposed (Task 1)
- ✅ "My Characters" dropdown + New Character (Task 8)
- ✅ Tag pills (Task 8)

**No placeholders found.**

**Type consistency verified:** `imageData` used consistently across data model, `useCharacters`, `VisualEditor`, `PortraitArea`, and `App`.
