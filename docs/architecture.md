# Architecture

Components:

- Encryption
  - Secret management
- Markdown editor
- Github integration
  - Auth
  - File CRUD
  - Repo CRUD

# UX

- A user enteres a screen
- Logs in with Github
- The user to redirected to a screen where connected repositories are listed
  - If no repo is connected, show a button "connect repository"
  - A list of repos should be presented, from which the user chooses one repo
  - A message shows that the repo is now connected
  - The user is redirected back to the repos overview
- At least one repo is now connected and the user can click this repo
- Continue in markdown editor
- Set file name and write content in markdown
- Encrypt markdown file and commit changes
