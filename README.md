# Flourisher

A personal knowledge graph for building and exploring tag networks.
Add tags as nodes, connect them with edges, select a cluster and ask Ollama to suggest related concepts — all backed by a graph database.

```
Frontend (React)  ──▶  Backend (NestJS)  ──▶  Neo4j
      │
      └──▶  Ollama  (runs on your local machine, called directly from the browser)
```

## Requirements

| Tool | Version |
|------|---------|
| Docker & Docker Compose | any recent version |
| Ollama | any — running locally on your machine |

That's it. Node.js is only needed if you want to develop without Docker.

## Quick start

**1. Copy the environment file and fill it in**

```bash
cp .env.example .env
```

Open `.env` and set at minimum:

```
APP_USERNAME=yourname
APP_PASSWORD=a-strong-password
JWT_SECRET=<run: openssl rand -hex 32>
```

**2. Start Ollama with CORS enabled**

The browser calls Ollama directly, so it must accept cross-origin requests:

```bash
OLLAMA_ORIGINS=* ollama serve
```

Pull a model if you haven't already (e.g. `ollama pull llama3`).

**3. Start the stack**

```bash
docker compose up --build
```

The first start pulls the Neo4j image and waits for it to be ready — this can take ~30 seconds.

The frontend runs as a **Vite dev server** with hot module replacement — edit a file and the browser updates instantly without rebuilding.

To use the production nginx build instead:

```bash
docker compose -f docker-compose.yml up --build
```

**4. Open the app**

```
http://localhost:3000
```

Log in with the credentials you set in `.env` (`APP_USERNAME` / `APP_PASSWORD`).

## What you can do

- **Add tags** — enter a name and an optional description in the sidebar.
- **Select tags** — click a node on the graph or a row in the sidebar list.
- **Link tags** — select 2+ tags and click **Link** to create edges between them.
- **AI suggestions** — select tags and click **Suggest**; Flourisher calls Ollama and adds the returned concepts as grey dashed nodes. Accept or reject each one from the sidebar or by right-clicking on the graph.
- **Configure Ollama** — set the server URL and model in the Ollama section of the sidebar; settings are saved in your browser.

## Services & ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | `3000` | React SPA served by nginx |
| Backend | `3001` | NestJS REST API |
| Neo4j Browser | `7474` | Graph browser UI (optional) |
| Neo4j Bolt | `7687` | Driver connection (internal) |

## Development without Docker

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md).

## Environment variables

See [`.env.example`](.env.example) for the full list with descriptions.

## Architecture

The project follows **hexagonal architecture** in both layers:

- **Backend** (`backend/`) — NestJS. Domain entities and abstract repository ports live in `domain/` and `application/ports/`. Infrastructure adapters (Neo4j, HTTP controllers) live in `infrastructure/` and are wired via NestJS DI.
- **Frontend** (`frontend/`) — React + Vite. The same layering applies: `domain/` → `application/` (hooks) → `infrastructure/` (API clients, Ollama client) → `ui/` (components, pages).

## CI

GitHub Actions run on every pull request:

- **Frontend CI** — `vite build`
- **Backend CI** — `nest build` + `tsc`
