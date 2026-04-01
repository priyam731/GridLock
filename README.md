# GridLock

GridLock is a real-time shared grid application where players compete to capture cells on a live board. It is designed to be simple to understand, fast to use, and easy to extend.

## Live Demo

- Frontend: [https://grid-lock-gamma.vercel.app](https://grid-lock-gamma.vercel.app)
- Backend: [https://gridlock-server.onrender.com](https://gridlock-server.onrender.com)
- Source code: [https://github.com/priyam731/GridLock](https://github.com/priyam731/GridLock)

If the live app takes a moment to connect, wait a few seconds for the backend to wake up. If it still does not work, clone this repository and run it locally using the steps below.

## What It Does

- Shows a shared 10x10 grid with 100 cells
- Lets any connected user capture unclaimed or owned cells
- Pushes updates to every client in real time
- Tracks player ownership, online users, and a live leaderboard
- Keeps captured cells owned even if a user disconnects

## Tech Stack

- Frontend: React 18, TypeScript, Vite, CSS Modules
- Backend: Node.js, Express, Socket.io, TypeScript
- Realtime: Socket.io over WebSockets with polling fallback
- Storage: In-memory `Map` on the server
- Deployment: Vercel for the frontend, Render for the backend

## Architecture

GridLock uses a modular, MVC-inspired structure so the code stays maintainable:

- `server/src/config` holds runtime settings like port, board size, cooldown, and CORS origin
- `server/src/models` contains pure TypeScript types
- `server/src/services` contains the core game logic
- `server/src/controllers` handles HTTP responses
- `server/src/routes` wires endpoints together
- `server/src/socket` handles Socket.io events and broadcasts
- `client/src/types` defines shared client-side contracts
- `client/src/services` wraps Socket.io for the UI
- `client/src/hooks` manages game state and cooldown timing
- `client/src/components` contains the UI

## Realtime Flow

1. The client connects and sends `user:join`.
2. The server returns a full `game:init` snapshot.
3. When a player clicks a cell, the client sends `cell:capture`.
4. The server validates the request, updates the grid, and broadcasts `cell:updated` and `leaderboard:updated`.
5. If the capture is blocked, the server sends `capture:error` and the UI shows feedback.

## Bonus Features

- Unique player names and colors
- Server-side cooldown to prevent spam
- Live top-10 leaderboard
- Capture pulse animation for updated cells
- Toast messages for invalid actions
- Cell ownership persists after disconnect

## Local Setup

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### Run locally

Open two terminals.

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Open the client at [http://localhost:5173](http://localhost:5173).

## Environment Variables

### Server

- `PORT` - server port, default `3001`
- `CLIENT_URL` - frontend origin used for CORS

### Client

- `VITE_SOCKET_URL` - backend URL used by Socket.io in production

Example production values:

```env
CLIENT_URL=https://grid-lock-gamma.vercel.app
VITE_SOCKET_URL=https://gridlock-server.onrender.com
```

## Build and Start

### Server

```bash
cd server
npm run build
npm run start
```

### Client

```bash
cd client
npm run build
npm run preview
```

## Deployment Notes

- Deploy the frontend on Vercel.
- Deploy the backend on Render.
- Set `CLIENT_URL` on the backend to the Vercel URL.
- Set `VITE_SOCKET_URL` on the frontend to the Render backend URL.
- If the live app is slow to connect, wait a few seconds before assuming it is broken.

## Folder Overview

```text
GridLock/
├── client/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── styles/
│       ├── types/
│       └── utils/
└── server/
    └── src/
        ├── config/
        ├── controllers/
        ├── models/
        ├── routes/
        ├── services/
        ├── socket/
        └── utils/
```

## Why This Approach

- The in-memory store keeps the app lightweight and fast.
- The server remains the source of truth for captures and cooldowns.
- The UI stays responsive while the backend ensures consistency.
- The modular layout makes it easy to swap in persistence later if needed.
