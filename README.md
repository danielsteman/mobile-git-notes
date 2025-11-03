# Mobile git notes

<p align="center">
  <a href="https://github.com/danielsteman/mobile-git-notes" target="_blank">
    <img alt="Version" src="https://img.shields.io/github/package-json/v/danielsteman/mobile-git-notes?color=%236b5b95&label=version&logo=semver&logoColor=white" />
  </a>
  <a href="https://github.com/danielsteman/mobile-git-notes/blob/main/LICENSE" target="_blank">
    <img alt="License" src="https://img.shields.io/github/license/danielsteman/mobile-git-notes?color=%230b84fe" />
  </a>
  <a href="https://github.com/danielsteman/mobile-git-notes/stargazers" target="_blank">
    <img alt="Stars" src="https://img.shields.io/github/stars/danielsteman/mobile-git-notes?style=social" />
  </a>
  <a href="https://github.com/danielsteman/mobile-git-notes/issues" target="_blank">
    <img alt="Issues" src="https://img.shields.io/github/issues/danielsteman/mobile-git-notes" />
  </a>
  <a href="https://github.com/danielsteman/mobile-git-notes/pulls" target="_blank">
    <img alt="Pull Requests" src="https://img.shields.io/github/issues-pr/danielsteman/mobile-git-notes" />
  </a>
  <img alt="Last Commit" src="https://img.shields.io/github/last-commit/danielsteman/mobile-git-notes" />
  <img alt="Commit Activity" src="https://img.shields.io/github/commit-activity/m/danielsteman/mobile-git-notes" />
</p>

<p align="center">
  <img alt="Expo" src="https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-61DAFB?logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" />
  <img alt="Python" src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white" />
  <img alt="Poetry" src="https://img.shields.io/badge/Poetry-60A5FA?logo=poetry&logoColor=white" />
  <img alt="Nix" src="https://img.shields.io/badge/Nix-5277C3?logo=nixos&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" />
  <img alt="pre-commit" src="https://img.shields.io/badge/pre--commit-enabled-FAB040?logo=pre-commit&logoColor=black" />
  <img alt="Conventional Commits" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-fa6673?logo=conventionalcommits&logoColor=white" />
</p>

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
