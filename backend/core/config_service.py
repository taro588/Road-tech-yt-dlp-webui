"""配置服务模块，负责读取和更新 config.json"""
import json
import os
from pathlib import Path
from typing import Any

# 配置文件路径：优先使用环境变量，否则使用默认路径
CONFIG_PATH = os.environ.get("CONFIG_PATH", "/app/config/config.json")


def _ensure_config_exists() -> None:
    """确保配置文件存在，不存在则创建默认配置"""
    config_dir = os.path.dirname(CONFIG_PATH)
    if config_dir:
        os.makedirs(config_dir, exist_ok=True)
    if not os.path.exists(CONFIG_PATH):
        default_config = {
            "default_output_path": "/downloads",
            "max_concurrent_tasks": 3,
            "yt_dlp_path": "/usr/local/bin/yt-dlp",
            "ffmpeg_path": "/usr/bin/ffmpeg",
            "auto_check_update": True,
            "update_interval_hours": 24,
        }
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(default_config, f, indent=4, ensure_ascii=False)


def load_config() -> dict[str, Any]:
    """加载配置文件"""
    _ensure_config_exists()
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {
            "default_output_path": "/downloads",
            "max_concurrent_tasks": 3,
            "yt_dlp_path": "/usr/local/bin/yt-dlp",
            "ffmpeg_path": "/usr/bin/ffmpeg",
            "auto_check_update": True,
            "update_interval_hours": 24,
        }


def save_config(config: dict[str, Any]) -> None:
    """保存配置到文件"""
    config_dir = os.path.dirname(CONFIG_PATH)
    if config_dir:
        os.makedirs(config_dir, exist_ok=True)
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=4, ensure_ascii=False)


def update_config(partial: dict[str, Any]) -> dict[str, Any]:
    """部分更新配置"""
    current = load_config()
    current.update(partial)
    save_config(current)
    return current
