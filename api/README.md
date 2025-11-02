# API

## Local development

### 1) Environment variables

This project reads configuration from a `.env` file at the repository root (one level above this `api/` directory). Add the following keys:

```
DATABASE_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
ENCRYPTION_KEY=
JWT_SECRET=
JWT_ISSUER=
```

Notes:

- `ENCRYPTION_KEY` should be a base64-encoded 32-byte key.
- Example `DATABASE_URL` for Postgres (see below): `postgresql+psycopg://mgn:mgn@localhost:5432/mgn`

### 2) Run Postgres via Docker

Choose one:

- One-liner (detached):

```bash
docker run -d --name mgn-postgres \
  -e POSTGRES_USER=mgn -e POSTGRES_PASSWORD=mgn -e POSTGRES_DB=mgn \
  -p 5432:5432 -v mgn_pg_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

- docker-compose (recommended): `docker compose up -d`

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: mgn-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: mgn
      POSTGRES_PASSWORD: mgn
      POSTGRES_DB: mgn
    volumes:
      - mgn_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "mgn"]
      interval: 5s
      timeout: 3s
      retries: 5
volumes:
  mgn_pg_data:
```

Set the connection URL for the API:

```bash
export DATABASE_URL="postgresql+psycopg://mgn:mgn@localhost:5432/mgn"
```

If port 5432 is in use locally, map to 5433 and update the URL accordingly.

Quick psql inside container:

```bash
docker exec -it mgn-postgres psql -U mgn -d mgn
```

### 3) Start the API locally

```bash
cd api
fastapi dev app/main.py --port 8000
```

### 4) Expose API with ngrok (for GitHub OAuth on device)

Install and authenticate ngrok (macOS):

```bash
brew install ngrok
ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN>
```

Start the tunnel:

```bash
ngrok http 8000
```

In your GitHub OAuth App, set the Authorization callback URL to:

```
https://<your-ngrok-subdomain>.ngrok.app/auth/github/callback
```

Notes:

- The HTTPS forwarding URL from ngrok ends with `.ngrok.app`.
- If the URL changes on restart, update the GitHub OAuth App setting or use a reserved domain.
- The backend exchanges the code for a token, then can redirect back to the mobile app via a deep link (e.g., `mobilegitnotes://oauth?session=<JWT>`).

## API overview

- `POST /auth/github/exchange` → Exchange OAuth code for GitHub token, store encrypted, return app JWT
- `POST /github/repos` → Create a repository as the user
- `PUT /github/repos/{owner}/{repo}/contents/{path}` → Create/update a file via GitHub Contents API
