{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  name = "shell_env";
  packages = with pkgs; [
    nodejs_22
    pnpm
    git-cliff
  ];
}
