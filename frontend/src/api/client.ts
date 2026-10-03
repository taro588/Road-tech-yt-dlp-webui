import {
  ConfigResponse,
  ConfigUpdateRequest,
  CreateTaskRequest,
  TaskResponse,
  UpdateResponse,
  VersionResponse,
} from '@/types';

const API_BASE = '/api';

export const api = {
  tasks: {
    create: async (data: CreateTaskRequest): Promise<TaskResponse> => {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('创建任务失败');
      return res.json();
    },
    getAll: async (): Promise<TaskResponse[]> => {
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error('获取任务列表失败');
      return res.json();
    },
    get: async (taskId: string): Promise<TaskResponse> => {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`);
      if (!res.ok) throw new Error('获取任务失败');
      return res.json();
    },
    cancel: async (taskId: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('取消任务失败');
    },
    getLogs: async (taskId: string): Promise<{ logs: string[] }> => {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/logs`);
      if (!res.ok) throw new Error('获取日志失败');
      return res.json();
    },
  },
  ytDlp: {
    getVersion: async (): Promise<VersionResponse> => {
      const res = await fetch(`${API_BASE}/yt-dlp/version`);
      if (!res.ok) throw new Error('获取版本信息失败');
      return res.json();
    },
    update: async (): Promise<UpdateResponse> => {
      const res = await fetch(`${API_BASE}/yt-dlp/update`, { method: 'POST' });
      if (!res.ok) throw new Error('更新失败');
      return res.json();
    },
  },
  config: {
    get: async (): Promise<ConfigResponse> => {
      const res = await fetch(`${API_BASE}/config`);
      if (!res.ok) throw new Error('获取配置失败');
      return res.json();
    },
    update: async (data: ConfigUpdateRequest): Promise<ConfigResponse> => {
      const res = await fetch(`${API_BASE}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('更新配置失败');
      return res.json();
    },
    uploadCookies: async (file: File): Promise<{ success: boolean; message: string; file_path: string }> => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/config/cookies/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('上传 cookies 文件失败');
      return res.json();
    },
    listCookies: async (): Promise<{ files: string[] }> => {
      const res = await fetch(`${API_BASE}/config/cookies/list`);
      if (!res.ok) throw new Error('获取 cookies 文件列表失败');
      return res.json();
    },
    deleteCookies: async (filename: string): Promise<{ success: boolean; message: string }> => {
      const res = await fetch(`${API_BASE}/config/cookies/${filename}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('删除 cookies 文件失败');
      return res.json();
    },
  },
};
