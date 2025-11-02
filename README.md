# Mobile git notes

I've been journaling in a private repo, in markdown files, use a pre-commit hook that encrypts notes using a private GPG key. This workflow is very basic but works well on a machine. Sometimes, however, I have ideas on the road that I want to commit to my journal, but the only device in reach is my mobile device. For this reason I thought it'd be fun to have a mobile app with a Git(hub|lab)|Bitbucket integration and a markdown editor, so you can commit ideas from anywhere, in a safe and private way.

## Dev environment (Kitty session)

Start a multi-tab Kitty session for ngrok, backend and frontend:

```bash
bash scripts/start-dev-kitty.sh
```

Tabs created:

- ngrok: `ngrok http 8000`
- backend: `nix develop .#backend --command bash -lc "cd api && fastapi dev app/main.py --port 8000"`
- frontend: `nix develop .#frontend --command bash -lc "cd mobile-git-notes && npm run start"`

Prereqs:

- Kitty installed and available as `kitty`
- ngrok installed and authenticated (`ngrok config add-authtoken ...`)
- Dependencies installed per API and frontend READMEs
