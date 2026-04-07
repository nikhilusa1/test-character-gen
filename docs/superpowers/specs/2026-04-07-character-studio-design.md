# Character Studio — Design Spec
**Date:** 2026-04-07
**Status:** Approved

---

## Overview

A personal web app for creating deep, visually rich characters for videogames and comics. The core experience is a **split-panel studio**: character sheet on the left, AI-generated portrait with appearance controls on the right. NVIDIA build.nvidia.com free-tier endpoints power both image generation and AI-assisted writing.

---

## Architecture

```
Browser (React SPA)
    │
    ├── Character Sheet Panel (left)
    └── Visual Editor Panel (right)
         │
         ▼
Node/Express Backend (API proxy)
    │
    ├── NVIDIA NIM — LLM endpoint (character writing assist)
    └── NVIDIA NIM — Image generation endpoint (portrait)
```

- **Frontend:** React (Vite), no UI framework — custom CSS to match a dark, game/comic aesthetic
- **Backend:** Node + Express — thin proxy to keep the NVIDIA API key server-side
- **Storage:** `localStorage` for now (personal tool, no database needed)
- **Deployment:** Run locally (`npm run dev`)

---

## Character Data Model

```json
{
  "id": "uuid",
  "name": "string",
  "tags": ["videogame | comic", "genre"],
  "sheet": {
    "backstory": "string",
    "personality": {
      "traits": ["string"],
      "description": "string"
    },
    "relationships": "string",
    "arc": "string"
  },
  "appearance": {
    "hairColor": "string",
    "build": 0,
    "outfitStyle": "string",
    "extraNotes": "string"
  },
  "imageUrl": "string | null",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

Characters are saved as a JSON array in `localStorage` under the key `character-studio-characters`.

---

## UI Components

### App Shell
- Top bar: app name, **+ New Character** button, **My Characters** dropdown
- Name bar: editable character name + tag pills (medium, genre)

### Left Panel — Character Sheet
Four collapsible sections, all free-text with autosave:
1. **Backstory** — textarea: origin, formative events
2. **Personality & Psychology** — trait pills (add/remove) + textarea for fears, motivations, inner conflicts
3. **Relationships** — textarea: key people, dynamics
4. **Role & Arc** — textarea: story purpose, how they change

Each section has an **"AI Assist" button** that calls the NVIDIA LLM endpoint with the character's current data as context and suggests content for that field.

### Right Panel — Visual Editor
- **Portrait area** (top ~55%): displays the generated image, or a placeholder prompt
- **Generate button**: builds a prompt from the character sheet + appearance controls, calls NVIDIA image endpoint
- **Appearance controls** (bottom ~45%):
  - Hair color: swatch picker (6–8 preset colors)
  - Build: slider (Slim → Muscular)
  - Outfit style: dropdown (Fantasy Armor, Street Clothes, Sci-Fi Suit, Robes, Casual, Military)
  - Eye color: swatch picker
- **Apply & Regenerate button**: incorporates slider state into the prompt and regenerates

---

## NVIDIA Integration

### Image Generation
- Endpoint: `POST https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl`
- Prompt is auto-built from character data:
  ```
  Portrait of [name], [personality traits], [outfit style], [hair color] hair, 
  [build] build, [eye color] eyes, [backstory one-liner], 
  high quality character art, comic book style
  ```
- API key stored in `.env` on the backend, never exposed to the browser

### LLM (AI Assist)
- Endpoint: NVIDIA NIM LLM (e.g., `meta/llama-3.1-70b-instruct` or similar available model)
- Each "AI Assist" call sends a system prompt + the character's current sheet as context
- Returns 2–3 sentences of suggested content for the requested field
- User can accept (appends to field) or dismiss

---

## Data Flow

1. User fills character sheet fields → autosaved to `localStorage`
2. User clicks **Generate**: frontend sends sheet + appearance state to backend `/api/generate-image`
3. Backend builds prompt, calls NVIDIA image API, returns image URL/base64 to frontend
4. Image displayed in portrait area
5. User adjusts sliders → clicks **Apply & Regenerate** → repeats step 2–4
6. User clicks **AI Assist** on a field → frontend sends field name + full character context to `/api/assist`
7. Backend calls NVIDIA LLM, returns suggestion → displayed inline for user to accept/dismiss

---

## Backend API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/generate-image` | Build prompt + call NVIDIA image endpoint |
| POST | `/api/assist` | Call NVIDIA LLM for field suggestion |

---

## Error Handling

- Image generation failure: show error state in portrait area with retry button
- AI Assist failure: show inline error, field remains unchanged
- NVIDIA rate limit (429): surface friendly message "Rate limit reached — try again in a moment"
- No network: localStorage data is never lost; generation silently fails with error state

---

## Out of Scope (for now)
- Export to PDF / image
- Sharing characters with others
- Relationship graph visualizer
- Multiple stories / project grouping
- Custom appearance slider categories
