"""任务管理路由"""
from fastapi import APIRouter, HTTPException

from core.models import CreateTaskRequest, TaskResponse
from core.task_manager import task_manager

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("", response_model=TaskResponse)
async def create_task(request: CreateTaskRequest):
    """创建下载任务"""
    if not request.url.strip():
        raise HTTPException(status_code=400, detail="URL 不能为空")
    return await task_manager.create_task(request)


@router.get("", response_model=list[TaskResponse])
async def get_all_tasks():
    """获取所有任务"""
    return task_manager.get_all_tasks()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    """获取单个任务详情"""
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    return task


@router.delete("/{task_id}")
async def cancel_task(task_id: str):
    """取消下载任务"""
    success = await task_manager.cancel_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="任务不存在")
    return {"message": "任务已取消"}


@router.get("/{task_id}/logs")
async def get_task_logs(task_id: str):
    """获取任务日志"""
    logs = task_manager.get_task_logs(task_id)
    if logs is None:
        raise HTTPException(status_code=404, detail="任务不存在")
    return {"logs": logs}
