import json
import os
import sys
import threading
import time
import webbrowser
from pathlib import Path

HOST = "127.0.0.1"
PORT = 17890

def app_root() -> Path:
    return Path(sys.executable).resolve().parent

def prepare_environment() -> None:
    root = app_root()
    data = Path(os.environ.get("APPDATA", Path.home())) / "yt-dlp-webui"
    data.mkdir(parents=True, exist_ok=True)
    config_file = data / "config.json"
    bundled = root / "config" / "config.json"

    if not config_file.exists():
        config = json.loads(bundled.read_text(encoding="utf-8")) if bundled.exists() else {}
        config["default_output_path"] = str(Path.home() / "Downloads" / "yt-dlp-webui")
        config["yt_dlp_path"] = str(root / "bin" / "yt-dlp.exe")
        config["ffmpeg_path"] = str(root / "bin" / "ffmpeg.exe")
        config["auto_check_update"] = False
        config.setdefault("network", {})["proxy"] = ""
        config_file.write_text(json.dumps(config, indent=4, ensure_ascii=False), encoding="utf-8")

    (Path.home() / "Downloads" / "yt-dlp-webui").mkdir(parents=True, exist_ok=True)
    bin_dir = root / "bin"
    os.environ["PATH"] = str(bin_dir) + os.pathsep + os.environ.get("PATH", "")
    os.environ["CONFIG_PATH"] = str(config_file)
    os.environ["STATIC_DIR"] = str(root / "backend" / "static")

def open_browser() -> None:
    time.sleep(1.5)
    webbrowser.open(f"http://{HOST}:{PORT}")

def main() -> None:
    prepare_environment()
    threading.Thread(target=open_browser, daemon=True).start()
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, log_level="warning")

if __name__ == "__main__":
    main()
