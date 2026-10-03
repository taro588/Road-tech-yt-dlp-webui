# yt-dlp WebUI

基于 [yt-dlp](https://github.com/yt-dlp/yt-dlp) 的 WebUI 下载工具，提供直观的网页界面用于视频下载和参数配置。

## 功能特性

- **网页界面**: 提供美观的 Web 界面，支持视频链接输入和参数配置
- **实时进度**: 通过 WebSocket 实时推送下载进度和日志
- **任务管理**: 查看、取消下载任务，查看任务日志（弹窗模式）
- **画质选择**: 提供8档画质选项（最高画质、4K、2K、1080p、720p、480p、360p、仅音频）
- **格式配置**: 视频格式和音频格式分开选择，提供明确的格式代码选项
- **Cookies 导入**: 支持上传 cookies 文件用于认证，访问受限内容
- **保留原始文件**: 可选保留合并前的原始视频和音频文件
- **自动更新**: 自动检查 yt-dlp 更新，提供一键更新按钮
- **容器化部署**: 使用 Docker 容器运行，集成 FFmpeg、yt-dlp 和 Deno
- **持久化存储**: 支持挂载下载目录和配置文件
- **代理支持**: 支持配置代理服务器，加速下载

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Vite
- **后端**: FastAPI + uvicorn
- **容器**: Docker + Docker Compose
- **核心工具**: yt-dlp, FFmpeg, Deno

## 快速开始

### 使用 Docker Compose（推荐）

```bash
git clone https://github.com/your-username/yt-dlp-webui.git
cd yt-dlp-webui

mkdir -p downloads config

docker-compose up -d
```

### 使用 Docker

```bash
docker build -t yt-dlp-webui:latest .

docker run -d \
  -p 8888:8000 \
  -v ./downloads:/downloads \
  -v ./config:/app/config \
  --name yt-dlp-webui \
  yt-dlp-webui:latest
```

### 使用代理构建镜像

```bash
export HTTP_PROXY=http://your-proxy-server:port
export HTTPS_PROXY=http://your-proxy-server:port

docker build -t yt-dlp-webui:latest .
```

### 手动构建

```bash
cd frontend
npm install
npm run build

cd ../backend
pip install -r requirements.txt

uvicorn main:app --host 0.0.0.0 --port 8000
```

## 访问应用

启动后访问 `http://localhost:8888` 即可使用 WebUI。

## 界面说明

### 下载页面

- **视频链接**: 输入要下载的视频链接（支持 YouTube、Bilibili、抖音等）
- **画质选择**: 选择下载画质（最高画质、4K、2K、1080p、720p、480p、360p、仅音频）
- **任务列表**: 显示所有下载任务，包括进度、速度、ETA
- **查看日志**: 点击任务卡片的"查看日志"按钮弹出日志窗口
- **取消任务**: 对下载中和等待中的任务可以取消

### 设置页面

**WebUI 设置**
- yt-dlp 版本检查和更新
- 默认输出路径
- 最大并发任务数
- yt-dlp 和 FFmpeg 路径配置
- 自动检查更新设置

**yt-dlp 设置**
- 网络设置（代理、超时、IPv4/IPv6）
- 下载设置（并发片段数、限速、重试次数）
- 视频格式（视频画质、音频音质、合并输出格式）
- 音频设置（下载视频/仅音频、音频格式、音频质量、保留原始文件）
- 字幕设置（下载字幕、自动生成字幕、字幕语言）
- 文件系统（输出模板、缩略图、JSON）
- 后处理（嵌入缩略图、元数据、字幕）
- SponsorBlock（标记和移除广告片段）
- 视频选择（仅视频/播放列表、播放列表项目）
- 认证设置（Cookies 文件上传、用户名密码认证）

## 目录结构

```
yt-dlp-webui/
├── backend/           # 后端代码
│   ├── core/          # 核心模块
│   │   ├── config_service.py    # 配置服务
│   │   ├── models.py            # 数据模型
│   │   ├── task_manager.py      # 任务管理器
│   │   └── yt_dlp_executor.py   # yt-dlp 执行器
│   ├── routers/       # API 路由
│   │   ├── tasks.py             # 任务管理路由
│   │   ├── yt_dlp.py            # yt-dlp 更新路由
│   │   ├── config_router.py     # 配置管理路由
│   │   └── websocket.py         # WebSocket 路由
│   ├── static/        # 前端静态文件
│   ├── main.py        # 应用入口
│   └── requirements.txt
├── frontend/          # 前端代码
│   ├── src/
│   │   ├── api/       # API 客户端
│   │   ├── components/# UI 组件
│   │   ├── hooks/     # 自定义 hooks
│   │   ├── pages/     # 页面组件
│   │   └── types/     # TypeScript 类型定义
│   ├── package.json
│   └── vite.config.ts
├── config/            # 配置文件
│   └── config.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 配置说明

### config.json

```json
{
    "default_output_path": "/downloads",
    "max_concurrent_tasks": 3,
    "yt_dlp_path": "/usr/local/bin/yt-dlp",
    "ffmpeg_path": "/usr/bin/ffmpeg",
    "auto_check_update": true,
    "update_interval_hours": 24,
    "network": {
        "proxy": "",
        "socket_timeout": 300,
        "force_ipv4": false,
        "force_ipv6": false
    },
    "download": {
        "max_downloads": 3,
        "rate_limit": "",
        "retries": 10,
        "fragment_retries": 10
    },
    "format": {
        "format": "",
        "video_quality": "",
        "audio_quality": ""
    },
    "audio": {
        "extract_audio": false,
        "audio_format": "best",
        "audio_quality": "0",
        "keep_video": false
    },
    "subtitles": {
        "write_subtitles": false,
        "write_auto_sub": false,
        "sub_lang": ""
    },
    "filesystem": {
        "output_template": "%(title)s.%(ext)s",
        "write_thumbnail": false,
        "write_json": false
    },
    "post_processing": {
        "embed_thumbnail": false,
        "embed_metadata": false,
        "embed_subtitles": false
    },
    "sponsorblock": {
        "sponsorblock_remove": false,
        "sponsorblock_mark": false,
        "sponsorblock_categories": ["sponsor"]
    },
    "authentication": {
        "username": "",
        "password": "",
        "cookies_file": ""
    },
    "video_selection": {
        "playlist_items": "",
        "min_views": 0,
        "max_views": 0,
        "date_range": ""
    }
}
```

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| CONFIG_PATH | 配置文件路径 | /app/config/config.json |
| STATIC_DIR | 前端静态文件目录 | /app/static |

## 容器挂载说明

| 挂载路径 | 说明 |
|----------|------|
| /downloads | 下载文件存储目录 |
| /app/config | 配置文件目录 |

## API 接口

### 任务管理

- `GET /api/tasks` - 获取所有任务
- `POST /api/tasks` - 创建下载任务
- `GET /api/tasks/{task_id}` - 获取单个任务
- `DELETE /api/tasks/{task_id}` - 取消任务
- `GET /api/tasks/{task_id}/logs` - 获取任务日志

### yt-dlp 管理

- `GET /api/yt-dlp/version` - 获取版本信息
- `POST /api/yt-dlp/update` - 更新 yt-dlp

### 配置管理

- `GET /api/config` - 获取配置
- `PUT /api/config` - 更新配置

### Cookies 管理

- `POST /api/config/cookies/upload` - 上传 Cookies 文件
- `GET /api/config/cookies/list` - 列出已上传的 Cookies 文件
- `DELETE /api/config/cookies/{filename}` - 删除 Cookies 文件

### WebSocket

- `WS /ws` - 实时任务状态推送

## yt-dlp 更新说明

在设置页面可以检查 yt-dlp 更新并一键升级。由于 yt-dlp 可能会更新接口，更新后可能导致 WebUI 部分功能失效。

## 支持的网站

支持所有 yt-dlp 支持的网站，包括：
- YouTube
- Bilibili
- 抖音 / 快手
- 微博
- Vimeo
- Twitter/X
- 以及更多...

## 常见问题

### Q: 下载视频后原始文件被删除？

yt-dlp 默认会在合并视频和音频后删除原始文件。如需保留原始文件，在设置页面的"音频设置"中勾选"保留原始文件"选项，这将传递 `-k` 参数给 yt-dlp。

### Q: YouTube 视频下载失败，提示 JS 挑战？

确保容器中安装了 Deno（Docker 镜像已集成）。如果仍然失败，检查代理配置是否正确，或尝试更新 yt-dlp 到最新版本。

### Q: 如何使用 Cookies 访问受限内容？

在设置页面的"认证设置"中，点击"上传 Cookies 文件"按钮，选择浏览器导出的 cookies.txt 文件。上传后，下载任务将自动使用该 cookies 文件进行认证。

## 许可证

MIT License
