# Word Hunt — Backend (health check only)

A minimal [NestJS](https://nestjs.com/) service that exposes a single endpoint.
The mobile game is fully offline and does **not** depend on this service.

```
GET /health  →  { "status": "ok" }
```

## Run

```bash
cd backend
npm install
npm run start        # http://localhost:3000/health
```

No game logic lives here by design.
