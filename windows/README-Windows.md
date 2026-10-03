# Windows EXE

This repository keeps the original upstream web UI and adds a Windows packaging path.

The GitHub Actions workflow builds yt-dlp-webui.exe and a double-click Windows installer.

The installer bundles the Python application runtime plus yt-dlp, FFmpeg and Deno so the end user does not need Python, Node.js or Docker.

User configuration is stored under %APPDATA%\yt-dlp-webui\config.json.

Downloads default to %USERPROFILE%\Downloads\yt-dlp-webui.

The packaged server listens only on 127.0.0.1:17890 and opens the browser automatically.

The default proxy from the upstream sample configuration is deliberately cleared for the Windows package. Users can configure their own proxy in the WebUI.

A push to main triggers .github/workflows/windows-exe.yml. The workflow runs on a Windows GitHub-hosted runner, builds the application with PyInstaller, then compiles the installer with Inno Setup.
