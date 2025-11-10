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
- Example `DATABASE_URL` for Neon Local: `postgresql+psycopg://neon:npg@localhost:5432/<database_name>?sslmode=require`

### Generate ENCRYPTION_KEY

You need a base64-encoded 32-byte key:

- Python:

```bash
python -c 'import os,base64; print(base64.b64encode(os.urandom(32)).decode())'
```

- OpenSSL:

```bash
openssl rand -base64 32
```

- Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2) Run Neon Local via Docker

This repository uses [Neon](https://neon.com) for Postgres. For local development, run the Neon Local proxy with Docker (Compose is already configured in `docker-compose.yml` as service `db`).

Start via Docker Compose:

```bash
docker compose up -d db
```

Required environment variables for the `db` service (supply via your shell or `.env`):

- `NEON_API_KEY`
- `NEON_PROJECT_ID`
- One of:
  - `BRANCH_ID` (connect to an existing branch), or
  - `PARENT_BRANCH_ID` (create ephemeral branch from parent)
- Optional:
  - `DELETE_BRANCH=false` (persist ephemeral branches)

Set the connection URL for the API:

```bash
export DATABASE_URL="postgresql+psycopg://neon:npg@localhost:5432/<database_name>?sslmode=require"
```

If port 5432 is in use locally, map to 5433 and update the URL accordingly.

Quick psql via local proxy:

```bash
psql "postgresql://neon:npg@localhost:5432/<database_name>?sslmode=require"
```

### 3) Start the API locally

```bash
cd api
fastapi dev app/main.py --port 8080
```

### 4) Expose API with ngrok (for GitHub OAuth on device)

Install and authenticate ngrok (macOS):

```bash
brew install ngrok
ngrok config add-authtoken <YOUR_NGROK_AUTHTOKEN>
```

Start the tunnel:

```bash
ngrok http 8080
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

## Testing

Install dev dependencies and run the test suite.

### Install test dependencies

- Using pip (recommended for this project’s PEP 621 config):

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ./api[dev]
```

### Run tests

```bash
cd api
pytest
```

Run with coverage:

```bash
pytest --cov=app --cov-report=term-missing
```

Run a single test file or test:

```bash
pytest api/tests/test_auth_exchange.py -q
pytest -k exchange_code_success -q
```

Notes:

- External GitHub requests are mocked via `respx`; tests do not hit GitHub.
- The test suite uses an in-memory SQLite DB with dependency overrides; no Postgres needed.

## Nix dev shells (explicit installs)

Use the repo's Nix dev shells to mirror CI and keep installs explicit.

### Backend shell (first-time setup)

```bash
nix develop .#backend --command bash -lc "pip install -e ./api[dev] && pre-commit install"
```

### Backend shell (run lint/tests)

```bash
nix develop .#backend --command bash -lc "cd api && pre-commit run --all-files"
nix develop .#backend --command bash -lc "cd api && pytest"
```

### Backend shell (start API)

```bash
nix develop .#backend --command bash -lc "cd api && fastapi dev app/main.py --port 8080"
```
