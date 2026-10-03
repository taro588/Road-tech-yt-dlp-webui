"""WebSocket 路由，用于实时推送任务状态"""
import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from core.task_manager import task_manager

router = APIRouter()


@router.websocket("/ws/tasks")
async def websocket_tasks(websocket: WebSocket):
    """WebSocket 端点，实时推送任务状态更新"""
    await websocket.accept()

    async def send_update(data: dict):
        try:
            await websocket.send_text(json.dumps(data, ensure_ascii=False, default=str))
        except Exception:
            pass

    task_manager.register_callback(send_update)

    try:
        while True:
            await asyncio.sleep(30.0)
    except WebSocketDisconnect:
        pass
    finally:
        task_manager.unregister_callback(send_update)
