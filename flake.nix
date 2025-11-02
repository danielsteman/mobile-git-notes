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
              echo "Tip: cd api && poetry install"
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
