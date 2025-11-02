{
  description = "Dev shells for backend (FastAPI) and frontend (Expo)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells = {
          backend = pkgs.mkShell {
            name = "mobile-git-notes-backend";
            packages = [
              pkgs.python312
              pkgs.poetry
              pkgs.pkg-config
              pkgs.openssl
              pkgs.libffi
              pkgs.postgresql
            ];
            shellHook = ''
              export POETRY_VIRTUALENVS_IN_PROJECT=true
              echo "Backend shell: Python $(python --version), Poetry $(poetry --version)"
              echo "Tip: cd api && poetry install"
            '';
          };

          frontend = pkgs.mkShell {
            name = "mobile-git-notes-frontend";
            packages = [
              pkgs.nodejs_20
              pkgs.watchman
            ];
            shellHook = ''
              echo "Frontend shell: Node $(node -v)"
              echo "Tip: cd mobile-git-notes && npm install && npm run start"
            '';
          };
        };
      }
    );
}
