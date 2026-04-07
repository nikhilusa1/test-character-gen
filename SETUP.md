# Setup Guide — Character Studio

## Getting a NVIDIA build.nvidia.com API Key

1. Go to https://build.nvidia.com
2. Click **Sign In** (top right) — create a free account if you don't have one
3. After signing in, click your profile icon → **API Keys**
4. Click **Generate API Key**
5. Copy the key — it starts with `nvapi-`

Free tier includes credits to get started with no payment info required.

---

## Running the App

### Prerequisites
- Node.js 18 or 20 (https://nodejs.org)

### Steps

1. Clone the repo and enter the directory:
   ```bash
   git clone <repo-url>
   cd test-character-gen
   ```

2. Create your `.env` file at the project root:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and paste your NVIDIA API key:
   ```
   NVIDIA_API_KEY=nvapi-your-key-here
   ```

4. Install dependencies:
   ```bash
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

5. Start the app:
   ```bash
   npm run dev
   ```

6. Open your browser to the URL shown in the terminal (usually http://localhost:5173)

---

## Models Used

| Feature | Model |
|---------|-------|
| Character portrait generation | Stable Diffusion XL (`stabilityai/stable-diffusion-xl`) |
| AI writing assist (backstory, personality, etc.) | Llama 3.1 70B (`meta/llama-3.1-70b-instruct`) |

Both models are available on the free tier at build.nvidia.com.
