{
  description = "Dev shells for API (FastAPI), Mobile (Expo), and Web (Next.js)";

  nixConfig = {
    # Binary cache configuration - ensures all nix develop commands use these caches
    # extra-substituters adds to the default substituters (which includes cache.nixos.org)
    extra-substituters = [
      "https://danielsteman.cachix.org"
    ];
    extra-trusted-public-keys = [
      "danielsteman.cachix.org-1:GF11KE/ARICBTtWKncP9wNEKobb0kvFHqlpu5rqYNrU="
    ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = { allowUnfree = true; };
        };
      in
      {
        devShells = rec {
          backend = pkgs.mkShell {
            name = "mobile-git-notes-backend";
            packages = [
              pkgs.python312
              pkgs.poetry
              pkgs.pkg-config
              pkgs.openssl
              pkgs.libffi
              pkgs.postgresql
              pkgs.ngrok
              pkgs.pre-commit
              pkgs.python312Packages.pytest
            ];
            shellHook = ''
              echo "Backend shell: Python $(python --version), Poetry $(poetry --version)"
              echo "Tip: cd api && poetry install && poetry run uvicorn app.main:app --reload --port 8080"
              echo "Ngrok: ngrok http http://localhost:8080"

              # Aliases for backend development
              alias dev-api='cd api && poetry install && poetry run uvicorn app.main:app --reload --port 8080'
              alias start-api='dev-api'
              alias ngrok-api='ngrok http http://localhost:8080'
              alias test-api='cd api && poetry run pytest'
            '';
          };

          mobile = pkgs.mkShell {
            name = "mobile-git-notes-mobile";
            packages = [
              pkgs.nodejs_22
              pkgs.watchman
              pkgs.ngrok
            ];
            shellHook = ''
              echo "Mobile shell: Node $(node -v)"
              echo "Tip: cd mobile && npm install && npm run start"
              echo "Ngrok available: run 'ngrok http http://localhost:8081' for Metro"

              # Aliases for mobile development
              alias dev-mobile='cd mobile && npm install && npm run start'
              alias start-mobile='dev-mobile'
              alias ngrok-metro='ngrok http http://localhost:8081'
            '';
          };

          web = pkgs.mkShell {
            name = "mobile-git-notes-web";
            packages = [
              pkgs.nodejs_22
            ];
            shellHook = ''
              echo "Web shell: Node $(node -v)"
              echo "Tip: cd web && npm install && npm run dev"

              # Aliases for web development
              alias dev-web='cd web && npm install && npm run dev'
              alias build-web='cd web && npm install && npm run build'
              alias lint-web='cd web && npm install && npm run lint'
            '';
          };

          # One shell with everything for convenience
          full = pkgs.mkShell {
            name = "mobile-git-notes-full";
            packages = [
              # backend
              pkgs.python312
              pkgs.poetry
              pkgs.pkg-config
              pkgs.openssl
              pkgs.libffi
              pkgs.postgresql
              pkgs.pre-commit
              pkgs.python312Packages.pytest

              # frontend
              pkgs.nodejs_22
              pkgs.watchman

              # tooling
              pkgs.ngrok
              pkgs.process-compose
              pkgs.docker
              pkgs.docker-compose
            ];
            shellHook = ''
              export POETRY_VIRTUALENVS_IN_PROJECT=true
              echo "Full shell ready. Python $(python --version), Node $(node -v)"
              echo "- DB via Docker: 'docker compose up db'"
              echo "- API: 'cd api && poetry run uvicorn app.main:app --reload --port 8080'"
              echo "- Mobile: 'cd mobile && npm install && npm run start'"
              echo "- Web: 'cd web && npm install && npm run dev'"
              echo "- Orchestrate: 'process-compose --config ./process-compose.yaml up'"

              # Aliases for full development environment
              alias dev-api='cd api && poetry install && poetry run uvicorn app.main:app --reload --port 8080'
              alias start-api='dev-api'
              alias dev-mobile='cd mobile && npm install && npm run start'
              alias dev-web='cd web && npm install && npm run dev'
              alias lint-web='cd web && npm install && npm run lint'
              alias build-web='cd web && npm install && npm run build'
              alias start-mobile='dev-mobile'
              alias ngrok-api='ngrok http http://localhost:8080'
              alias ngrok-metro='ngrok http http://localhost:8081'
              alias test-api='cd api && poetry run pytest'
              alias db-up='docker compose up db'
            '';
          };

          # Make `nix develop` default to the full shell
          default = full;
        };

        # Handy runnable commands: nix run .#<name>
        apps = {
          dev = {
            type = "app";
            program = pkgs.writeShellScript "dev" ''
              exec nix develop .#full -c process-compose --config ./process-compose.yaml up
            '';
          };

          api = {
            type = "app";
            program = pkgs.writeShellScript "api" ''
              exec nix develop .#backend -c sh -lc 'cd api && poetry run uvicorn app.main:app --reload --port 8080'
            '';
          };

          mobile = {
            type = "app";
            program = pkgs.writeShellScript "mobile" ''
              exec nix develop .#mobile -c sh -lc 'cd mobile && npm install && npm run start'
            '';
          };

          web = {
            type = "app";
            program = pkgs.writeShellScript "web" ''
              exec nix develop .#web -c sh -lc 'cd web && npm install && npm run dev'
            '';
          };

          ngrokApi = {
            type = "app";
            program = pkgs.writeShellScript "ngrok-api" ''
              exec nix develop .#backend -c sh -lc 'ngrok http http://localhost:8080'
            '';
          };

          ngrokMetro = {
            type = "app";
            program = pkgs.writeShellScript "ngrok-metro" ''
              exec nix develop .#mobile -c sh -lc 'ngrok http http://localhost:8081'
            '';
          };

          dbUp = {
            type = "app";
            program = pkgs.writeShellScript "db-up" ''
              exec ${pkgs.docker}/bin/docker compose up db
            '';
          };
        };
      }
    );
}
