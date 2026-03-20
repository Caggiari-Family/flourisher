# Flourisher — Frontend

React SPA built with Vite. Displays the knowledge graph, handles tag/edge management and calls Ollama directly from the browser for AI suggestions.

## Stack

- **React 18** + **Vite**
- **react-force-graph-2d** — force-directed graph canvas
- **Ollama** — called directly from the browser (no backend proxy needed)

## Running locally

You need the backend running (see `backend/README.md`) and Node.js 20+.

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. API calls to `/api/` are proxied to `http://localhost:3001` by Vite (see `vite.config.js`).

## Ollama

The frontend calls Ollama directly. Before using the Suggest feature:

1. Start Ollama with CORS enabled:
   ```bash
   OLLAMA_ORIGINS=* ollama serve
   ```
2. Pull a model if needed:
   ```bash
   ollama pull llama3
   ```
3. In the app sidebar, set the **Server URL** (default `http://localhost:11434`) and **Model** (default `llama3`), then click **Save**.

## Project structure

```
src/
├── domain/
│   └── tag.js                        # JSDoc types: Tag, Edge, Graph
├── application/
│   ├── useAuth.js                    # Login state, JWT in localStorage
│   ├── useGraph.js                   # Graph state + all tag/edge/suggestion ops
│   └── useOllama.js                  # Ollama URL/model config + getSuggestions()
├── infrastructure/
│   ├── api/
│   │   ├── client.js                 # Fetch wrapper with Bearer auth
│   │   ├── auth.api.js               # POST /auth/login
│   │   └── tag.api.js                # Nodes, edges, graph endpoints
│   └── ollama/
│       └── ollama.client.js          # POST /api/generate — builds prompt, parses JSON
└── ui/
    ├── pages/
    │   ├── LoginPage.jsx / .css
    │   └── GraphPage.jsx / .css      # Wires useOllama → useGraph → Sidebar + GraphView
    └── components/
        ├── GraphView.jsx / .css      # Force graph canvas
        └── Sidebar.jsx / .css        # Add tag, selection, suggestions, tag list, Ollama config
```

## Architecture notes

The app follows hexagonal architecture:

- `domain/` — plain data types, no framework code.
- `application/` — hooks that orchestrate business logic; they depend only on injected functions (e.g. `getSuggestions`) not on concrete infrastructure.
- `infrastructure/` — fetch clients and the Ollama adapter; the only place that knows about URLs and HTTP.
- `ui/` — React components; they read state from hooks and fire callbacks — no direct API calls.

## Building for production

```bash
npm run build
```

Output goes to `dist/`. In production the app is served by nginx inside Docker, which also proxies `/api/` to the backend container.
