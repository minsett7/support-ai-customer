<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cc719818-74b6-4c27-af35-ea32d16486ff

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run Customer UI With Docker

This Docker setup is only for the customer frontend. The `backend/` folder is excluded from the image by `.dockerignore`.

Build and run the customer UI:

```bash
docker compose up --build -d
```

Open:

```text
http://localhost:3000
```

If the backend is running on another laptop or VM, build with that backend URL:

```bash
VITE_BACKEND_URL=http://192.168.1.50:5000 docker compose up --build -d
```

On Windows PowerShell:

```powershell
$env:VITE_BACKEND_URL="http://192.168.1.50:5000"
docker compose up --build -d
```

Replace `192.168.1.50` with the IP address of the machine hosting the backend.

Stop the UI container:

```bash
docker compose down
```
