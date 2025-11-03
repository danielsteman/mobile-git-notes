{
  description = "Dev shells for backend (FastAPI) and frontend (Expo)";

  nixConfig = {
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
            ];
            shellHook = ''
              echo "Backend shell: Python $(python --version), Poetry $(poetry --version)"
              echo "Tip: cd api && poetry install && poetry run uvicorn app.main:app --reload --port 8000"
              echo "Ngrok: ngrok http http://localhost:8000"
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
              echo "Tip: cd mobile-git-notes && npm install && npm run start"
              echo "Ngrok available: run 'ngrok http http://localhost:8081' for Metro"
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
              echo "- API: 'cd api && poetry run uvicorn app.main:app --reload --port 8000'"
              echo "- Mobile: 'cd mobile-git-notes && npm install && npm run start'"
              echo "- Orchestrate: 'process-compose --config ./process-compose.yaml up'"
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
              exec nix develop .#backend -c sh -lc 'cd api && poetry run uvicorn app.main:app --reload --port 8000'
            '';
          };

          mobile = {
            type = "app";
            program = pkgs.writeShellScript "mobile" ''
              exec nix develop .#mobile -c sh -lc 'cd mobile-git-notes && npm install && npm run start'
            '';
          };

          ngrokApi = {
            type = "app";
            program = pkgs.writeShellScript "ngrok-api" ''
              exec nix develop .#backend -c sh -lc 'ngrok http http://localhost:8000'
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
