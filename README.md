# Character Studio

A personal web app for creating deep, visually rich characters for videogames and comics. Fill out a character sheet (backstory, personality, relationships, arc), generate an AI portrait, and customize their appearance — all in one split-panel view.

![Character Studio](https://build.nvidia.com/favicon.ico)

## Features

- **Character Sheet** — backstory, personality traits, relationships, and story arc
- **AI Writing Assist** — click "✨ AI Assist" on any field to get suggestions powered by Llama 3.1 70B
- **Portrait Generation** — generates a character portrait from your sheet using Stable Diffusion XL
- **Appearance Controls** — customize hair color, eye color, build, and outfit style
- **Auto-save** — all characters saved locally in your browser

---

## Getting a NVIDIA API Key

Both AI features (image generation + writing assist) use free models from [build.nvidia.com](https://build.nvidia.com).

1. Go to **https://build.nvidia.com**
2. Click **Sign In** (top right) — create a free account if you don't have one
3. After signing in, click your profile icon → **API Keys**
4. Click **Generate API Key**
5. Copy the key — it starts with `nvapi-`

> Free tier includes credits to get started with no payment info required.

---

## Running the App

### Prerequisites
- Node.js 18 or 20 — https://nodejs.org

### Steps

**1. Clone the repo**
```bash
git clone https://github.com/nikhilusa1/test-character-gen.git
cd test-character-gen
```

**2. Add your API key**
```bash
cp .env.example .env
```
Open `.env` and paste your key:
```
NVIDIA_API_KEY=nvapi-your-key-here
```

**3. Install dependencies**
```bash
npm install
npm install --prefix client
npm install --prefix server
```

**4. Start the app**
```bash
npm run dev
```

**5. Open your browser**

Go to the URL shown in the terminal — usually **http://localhost:5173**

---

## Models

| Feature | Model |
|---------|-------|
| Portrait generation | `stabilityai/stable-diffusion-xl` |
| AI writing assist | `meta/llama-3.1-70b-instruct` |

Both are free tier on build.nvidia.com.

---

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express (API proxy)
- **AI:** NVIDIA NIM endpoints (build.nvidia.com)
- **Storage:** Browser localStorage
