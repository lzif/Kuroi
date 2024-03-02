{ pkgs, ... }: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs
  ];
  idx.workspace.onCreate.install = ''
    npm install
    '';
  idx.previews = {
    enable = true;
    previews = [
      {
        command =
          [ "npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
        manager = "web";
        id = "web";
      }
    ];
  };
}
