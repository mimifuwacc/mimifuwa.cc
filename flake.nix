{
  description = "mimifuwacc/mimifuwa.cc";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nix-vite-plus.url = "github:ryoppippi/nix-vite-plus";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    nix-vite-plus,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs_24
          pnpm_10
          mprocs
          nix-vite-plus.packages.${system}.vp
        ];
      };
    });
}
