# Flourisher — Backend

NestJS REST API. Manages tags (nodes) and edges in a Neo4j graph database. Issues JWTs for authentication.

## Stack

- **NestJS** — framework
- **neo4j-driver** — Bolt connection to Neo4j
- **@nestjs/jwt** — JWT signing / verification

## REST API

All routes require a `Authorization: Bearer <token>` header except `POST /api/auth/login`.

### Auth

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | `{ username, password }` | Returns `{ access_token }` |

### Nodes (tags)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/nodes` | — | List all nodes |
| POST | `/api/nodes` | `{ name, description?, suggested? }` | Create a node |
| PUT | `/api/nodes/:id` | `{ name?, description? }` | Update a node |
| DELETE | `/api/nodes/:id` | — | Delete a node and its edges |
| PUT | `/api/nodes/:id/accept` | — | Promote a suggested node to permanent |
| DELETE | `/api/nodes/:id/reject` | — | Delete a suggested node |

### Edges

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/edges` | — | List all edges |
| POST | `/api/edges` | `{ sourceId, targetId, label? }` | Create an edge |
| PUT | `/api/edges/:id` | `{ label }` | Update edge label |
| DELETE | `/api/edges/:id` | — | Delete an edge |

### Graph (convenience)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/graph` | Returns `{ nodes, edges }` in one call |

## Running locally

You need a running Neo4j instance (see below) and Node.js 20+.

```bash
# Install dependencies
npm install

# Set environment variables (copy from root .env.example or set inline)
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USERNAME=neo4j
export NEO4J_PASSWORD=flourisher123
export APP_USERNAME=admin
export APP_PASSWORD=admin
export JWT_SECRET=dev-secret

# Start in watch mode
npm run start:dev
```

### Spin up Neo4j with Docker (standalone)

```bash
docker run --rm \
  -e NEO4J_AUTH=neo4j/flourisher123 \
  -p 7474:7474 -p 7687:7687 \
  neo4j:5
```

## Project structure

```
src/
├── main.ts                         # Bootstrap — global prefix /api, CORS
├── app.module.ts
├── shared/
│   └── neo4j/
│       ├── neo4j.service.ts        # Driver init, retry-on-start, constraints
│       └── neo4j.module.ts
└── modules/
    ├── auth/
    │   ├── auth.module.ts
    │   └── infrastructure/http/
    │       ├── auth.controller.ts  # POST /auth/login
    │       └── auth.guard.ts       # Bearer JWT guard
    └── tag/
        ├── domain/
        │   └── tag.entity.ts       # Tag, Edge, Graph types
        ├── application/
        │   ├── ports/
        │   │   └── tag-repository.port.ts   # Abstract DI token
        │   └── use-cases/          # One class per operation
        ├── infrastructure/
        │   ├── http/
        │   │   ├── tag.controller.ts
        │   │   └── dto/
        │   └── persistence/
        │       └── neo4j-tag.repository.ts  # Cypher queries
        └── tag.module.ts
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j Bolt URI |
| `NEO4J_USERNAME` | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | `password` | Neo4j password |
| `APP_USERNAME` | — | Login username for the app |
| `APP_PASSWORD` | — | Login password for the app |
| `JWT_SECRET` | — | Secret used to sign JWTs (use a strong random value in production) |
