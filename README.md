# GridLock

GridLock is a real-time shared grid app where players claim territory on a 10x10 board. Every capture is synchronized instantly via Socket.io, and a live leaderboard tracks the top players.

## Highlights

- Real-time multiplayer capture loop over Socket.io
- 10x10 grid (100 cells) with animated updates
- Server-authoritative 3s cooldown per player
- In-memory state using Maps for fast reads and writes
- Top-10 leaderboard with live updates
- Territorial persistence: cells remain owned even after disconnects

## Tech Stack

- Frontend: React 18 + TypeScript + Vite + CSS Modules
- Backend: Node.js + Express + Socket.io + TypeScript
- Storage: In-memory Maps (easy Redis swap later)

## Project Structure

```text
GridLock/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Cell/
│   │   │   ├── Grid/
│   │   │   ├── JoinScreen/
│   │   │   ├── Leaderboard/
│   │   │   ├── Toast/
│   │   │   └── UserPanel/
│   │   ├── hooks/
│   │   │   ├── useCooldown.ts
│   │   │   └── useGrid.ts
│   │   ├── services/
│   │   │   └── socketService.ts
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── types/
│   │   │   ├── css.d.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── nameGenerator.ts
│   │   ├── App.module.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── server/
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   ├── socket/
    │   ├── utils/
    │   ├── app.ts
    │   └── server.ts
    └── package.json
```

## Architecture (MVC-Inspired Modular)

### Backend

- config: constants like port, grid size, cooldown, CORS origin
- models: pure TypeScript interfaces (Cell, User, LeaderboardEntry)
- services:
  - GridService: owns authoritative in-memory grid and capture mutations
  - UserService: manages users, colors, cooldown checks, leaderboard ranking
- controllers: HTTP route handlers
- routes: REST route wiring
- socket: event handlers and broadcast logic
- app.ts: composition root for middleware, services, routes, and sockets
- server.ts: process entrypoint and listener

### Frontend

- types: shared client-side contracts for state and socket payloads
- services: thin Socket.io wrapper with typed event helpers
- hooks:
  - useGrid: reducer + socket event integration + optimistic cooldown mirror
  - useCooldown: computes remaining cooldown and progress bar values
- components:
  - JoinScreen: username gate before entering game
  - Grid: board container and deterministic cell ordering
  - Cell: clickable tile with pulse animation
  - UserPanel: player stats + cooldown bar
  - Leaderboard: top 10 ranking
  - Toast: transient feedback/error messaging
- styles: global tokens, reset, gradients, typography

## Real-Time Event Contract

### Client -> Server

- user:join { name }
- cell:capture { cellId }

### Server -> Client

- game:init { user, cells, leaderboard, stats }
- cell:updated { cell }
- leaderboard:updated { leaderboard, stats }
- capture:error { message, cooldownMs? }
- user:joined { userId, name, color, onlinePlayers }
- user:left { userId, name, onlinePlayers }

## Core Design Decisions

1. Conflict resolution
   - Node.js event loop serializes incoming capture events; first processed event wins.
2. Cooldown enforcement
   - Cooldown is enforced server-side. The client mirrors cooldown in UI for responsiveness.
3. Persistent territory
   - Cells keep ownership after disconnect, preserving game history and strategic territory.
4. Color allocation
   - A curated palette is tracked server-side to avoid duplicate colors while available.
5. Update animation
   - Client tracks recently updated cell IDs and clears them after 600ms to trigger pulse.

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### 1) Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2) Run in development

In terminal 1:

```bash
cd server
npm run dev
```

In terminal 2:

```bash
cd client
npm run dev
```

App: http://localhost:5173  
API + Socket: http://localhost:3001

## Build Commands

### Server

```bash
cd server
npm run build
npm start
```

### Client

```bash
cd client
npm run build
npm run preview
```

## Environment Variables

### Server

- PORT (default: 3001)
- CLIENT_URL (default: http://localhost:5173)

### Client

- VITE_SOCKET_URL (optional, defaults to / for same-origin/proxy)

## Performance Notes

- Full board payload is small: 900 cells is typically tens of KB.
- In-memory Maps provide O(1) key access and straightforward mutation paths.
- The design is ready to swap in Redis or persistent storage later if needed.
