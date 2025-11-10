# Architecture

Components:

- Encryption
  - Secret management
- Markdown editor
- Github integration
  - Auth
  - File CRUD
  - Repo CRUD
- Database (Neon)
  - Managed Postgres on Neon
  - Local development via Neon Local proxy (Docker)

# UX

Home Screen
→ “Login with GitHub”

Select Repository
→ Show GitHub repos → Tap one → Confirm access

Set Default Folder
→ “Where should notes be stored?” → default /notes/

Editor
→ Write note → Tap “Commit” → Confirm → Done

Next time you open app
→ Lands directly in the editor (default repo + folder preloaded)
