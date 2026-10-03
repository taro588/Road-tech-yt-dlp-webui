"""yt-dlp 更新管理路由"""
from fastapi import APIRouter

from core.models import UpdateResponse, VersionResponse
from core.yt_dlp_executor import get_current_version, get_latest_version, update_yt_dlp

router = APIRouter(prefix="/api/yt-dlp", tags=["yt-dlp"])


@router.get("/version", response_model=VersionResponse)
async def get_version():
    """获取当前 yt-dlp 版本和最新版本"""
    current = get_current_version()
    latest = get_latest_version()
    update_available = False
    if latest and current != "unknown" and current != latest:
        update_available = True
    return VersionResponse(
        current_version=current,
        latest_version=latest,
        update_available=update_available,
    )


@router.post("/update", response_model=UpdateResponse)
async def update():
    """更新 yt-dlp 到最新版本"""
    success, message = update_yt_dlp()
    return UpdateResponse(success=success, message=message)
