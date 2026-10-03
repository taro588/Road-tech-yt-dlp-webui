"""任务管理器，负责下载任务的创建、执行和状态管理"""
import asyncio
import subprocess
import uuid
from datetime import datetime
from typing import Any, Optional

from .config_service import load_config
from .models import (
    AuthenticationConfig,
    CreateTaskRequest,
    DownloadConfig,
    ExtractorConfig,
    FilesystemConfig,
    FormatConfig,
    GeneralConfig,
    NetworkConfig,
    PostProcessingConfig,
    SponsorBlockConfig,
    SubtitleConfig,
    TaskResponse,
    TaskStatus,
    VerbosityConfig,
    VideoSelectionConfig,
    WorkaroundsConfig,
)
from .yt_dlp_executor import build_download_args, parse_progress


class Task:
    """下载任务内部模型"""

    def __init__(self, request: CreateTaskRequest):
        self.task_id = str(uuid.uuid4())[:8]
        self.url = request.url
        self.status = TaskStatus.PENDING
        self.title = ""
        self.progress = 0.0
        self.speed = ""
        self.eta = ""
        self.output_file = ""
        self.error_message = ""
        self.created_at = datetime.now()
        self.completed_at: Optional[datetime] = None
        self.request = request
        self.process: Optional[subprocess.Popen] = None
        self.log_lines: list[str] = []

    def to_response(self) -> TaskResponse:
        """转换为 API 响应模型"""
        return TaskResponse(
            task_id=self.task_id,
            status=self.status,
            url=self.url,
            title=self.title,
            progress=self.progress,
            speed=self.speed,
            eta=self.eta,
            output_file=self.output_file,
            error_message=self.error_message,
            created_at=self.created_at,
            completed_at=self.completed_at,
            logs=self.log_lines,
        )

    def to_dict(self) -> dict[str, Any]:
        """转换为字典（用于 WebSocket 推送）"""
        return {
            "task_id": self.task_id,
            "status": self.status.value,
            "url": self.url,
            "title": self.title,
            "progress": self.progress,
            "speed": self.speed,
            "eta": self.eta,
            "output_file": self.output_file,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "logs": self.log_lines,
        }


class TaskManager:
    """任务管理器单例"""

    def __init__(self):
        self._tasks: dict[str, Task] = {}
        self._callbacks: list = []  # WebSocket 回调列表

    def register_callback(self, callback):
        """注册 WebSocket 回调函数"""
        self._callbacks.append(callback)

    def unregister_callback(self, callback):
        """注销 WebSocket 回调函数"""
        if callback in self._callbacks:
            self._callbacks.remove(callback)

    async def _notify_callbacks(self, task: Task):
        """通知所有 WebSocket 客户端"""
        for callback in self._callbacks:
            try:
                await callback(task.to_dict())
            except Exception:
                pass

    def get_all_tasks(self) -> list[TaskResponse]:
        """获取所有任务"""
        return [task.to_response() for task in self._tasks.values()]

    def get_task(self, task_id: str) -> Optional[TaskResponse]:
        """获取单个任务"""
        task = self._tasks.get(task_id)
        return task.to_response() if task else None

    def get_task_logs(self, task_id: str) -> list[str]:
        """获取任务日志"""
        task = self._tasks.get(task_id)
        return task.log_lines if task else []

    async def create_task(self, request: CreateTaskRequest) -> TaskResponse:
        """创建并启动下载任务"""
        config = load_config()
        
        full_request = CreateTaskRequest(
            url=request.url,
            output_path=request.output_path or config.get("default_output_path"),
            filename=request.filename,
            network=request.network or NetworkConfig(**config.get("network", {})),
            download=request.download or DownloadConfig(**config.get("download", {})),
            filesystem=request.filesystem or FilesystemConfig(**config.get("filesystem", {})),
            format=request.format or FormatConfig(**config.get("format", {})),
            subtitle=request.subtitle or SubtitleConfig(**config.get("subtitle", {})),
            post_processing=request.post_processing or PostProcessingConfig(**config.get("post_processing", {})),
            sponsorblock=request.sponsorblock or SponsorBlockConfig(**config.get("sponsorblock", {})),
            workarounds=request.workarounds or WorkaroundsConfig(**config.get("workarounds", {})),
            video_selection=request.video_selection or VideoSelectionConfig(**config.get("video_selection", {})),
            authentication=request.authentication or AuthenticationConfig(**config.get("authentication", {})),
            extractor=request.extractor or ExtractorConfig(**config.get("extractor", {})),
            general=request.general or GeneralConfig(**config.get("general", {})),
            verbosity=request.verbosity or VerbosityConfig(**config.get("verbosity", {})),
            extra_args=request.extra_args,
        )
        
        task = Task(full_request)
        self._tasks[task.task_id] = task
        # 异步启动下载
        asyncio.create_task(self._run_task(task))
        return task.to_response()

    async def cancel_task(self, task_id: str) -> bool:
        """取消下载任务"""
        task = self._tasks.get(task_id)
        if not task:
            return False
        if task.process and task.status == TaskStatus.DOWNLOADING:
            task.process.terminate()
            try:
                task.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                task.process.kill()
        task.status = TaskStatus.CANCELLED
        task.completed_at = datetime.now()
        await self._notify_callbacks(task)
        return True

    async def _run_task(self, task: Task):
        """执行下载任务"""
        try:
            args = build_download_args(
                url=task.request.url,
                output_path=task.request.output_path,
                filename=task.request.filename,
                network=task.request.network,
                download=task.request.download,
                filesystem=task.request.filesystem,
                format=task.request.format,
                subtitle=task.request.subtitle,
                post_processing=task.request.post_processing,
                sponsorblock=task.request.sponsorblock,
                workarounds=task.request.workarounds,
                video_selection=task.request.video_selection,
                authentication=task.request.authentication,
                extractor=task.request.extractor,
                general=task.request.general,
                verbosity=task.request.verbosity,
                extra_args=task.request.extra_args,
            )

            task.status = TaskStatus.DOWNLOADING
            await self._notify_callbacks(task)

            # 启动子进程
            task.process = subprocess.Popen(
                args,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True,
            )

            # 实时读取输出并解析进度
            loop = asyncio.get_event_loop()

            def read_line():
                if task.process and task.process.stdout:
                    line = task.process.stdout.readline()
                    return line.strip() if line else None
                return None

            # 实时读取每一行输出
            while True:
                line = await loop.run_in_executor(None, read_line)
                if line is None:
                    break
                if line:
                    task.log_lines.append(line)
                    parsed = parse_progress(line)
                    if "title" in parsed:
                        task.title = parsed["title"]
                    if "progress" in parsed:
                        task.progress = parsed["progress"]
                    if "speed" in parsed:
                        task.speed = parsed["speed"]
                    if "eta" in parsed:
                        task.eta = parsed["eta"]
                    if "output_file" in parsed:
                        task.output_file = parsed["output_file"]
                    # 实时推送更新
                    await self._notify_callbacks(task)
                    await asyncio.sleep(0.05)

            # 等待进程完成
            return_code = task.process.wait()

            if return_code == 0:
                task.status = TaskStatus.COMPLETED
                task.progress = 100.0
            elif task.status != TaskStatus.CANCELLED:
                task.status = TaskStatus.FAILED
                task.error_message = "下载失败，请检查日志"
        except FileNotFoundError as e:
            task.status = TaskStatus.FAILED
            task.error_message = f"yt-dlp 未找到: {str(e)}"
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error_message = f"执行出错: {str(e)}"
        finally:
            task.completed_at = datetime.now()
            await self._notify_callbacks(task)


# 全局任务管理器实例
task_manager = TaskManager()
