"""FastAPI 主应用入口"""
import os
import sys

# 将 backend 目录加入 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import config_router, tasks, websocket, yt_dlp

app = FastAPI(title="yt-dlp WebUI", version="1.0.0")

# CORS 配置，允许前端开发时跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(tasks.router)
app.include_router(yt_dlp.router)
app.include_router(config_router.router)
app.include_router(websocket.router)


@app.get("/api/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok"}


# 前端静态文件服务（生产环境）
# 构建后的前端文件放在 /app/static 目录下
STATIC_DIR = os.environ.get("STATIC_DIR", "/app/static")
if os.path.exists(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
