{
  description = "Dev shells for backend (FastAPI) and frontend (Expo)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs, nixpkgs-unstable, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = { allowUnfree = true; };
        };
        unstablePkgs = import nixpkgs-unstable {
          inherit system;
          config = { allowUnfree = true; };
        };
      in
      {
        devShells = {
          backend = pkgs.mkShell {
            name = "mobile-git-notes-backend";
            packages = [
              pkgs.python312
              unstablePkgs.poetry
              pkgs.pkg-config
              pkgs.openssl
              pkgs.libffi
              pkgs.postgresql
              unstablePkgs.ngrok
            ];
            shellHook = ''
              export POETRY_VIRTUALENVS_IN_PROJECT=true
              echo "Backend shell: Python $(python --version), Poetry $(poetry --version)"

              # Always work from the api directory if present at repo root
              if [ -d "api" ] && [ -f "api/pyproject.toml" ]; then
                cd api || true
              fi

              # Ensure Poetry uses the Nix Python, install deps (incl. dev extra) every time, then activate venv
              if [ -f "pyproject.toml" ]; then
                poetry env use "$(command -v python)" >/dev/null 2>&1 || true
                poetry install --no-interaction --extras dev --sync || poetry install --no-interaction --sync
                VENV_PATH="$(poetry env info --path 2>/dev/null || echo .venv)"
                if [ -d "$VENV_PATH" ]; then
                  . "$VENV_PATH/bin/activate" 2>/dev/null || true
                fi
                echo "Poetry deps ensured and venv activated from: $VENV_PATH"
              fi

              echo "Ngrok available: run 'ngrok http http://localhost:8000'"
            '';
          };

          frontend = pkgs.mkShell {
            name = "mobile-git-notes-frontend";
            packages = [
              pkgs.nodejs_20
              pkgs.watchman
              unstablePkgs.ngrok
            ];
            shellHook = ''
              echo "Frontend shell: Node $(node -v)"
              echo "Tip: cd mobile-git-notes && npm install && npm run start"
              echo "Ngrok available: run 'ngrok http http://localhost:8081' for Metro"
            '';
          };
        };
      }
    );
}
