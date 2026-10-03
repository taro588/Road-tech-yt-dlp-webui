import { useState, useEffect, useRef, useCallback } from 'react';
import { Download, RefreshCw, FileText, Link2, X, Video } from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { api } from '@/api/client';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TaskResponse, CreateTaskRequest, FormatConfig } from '@/types';

export function DownloadPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  
  const [quality, setQuality] = useState<string>('best');
  
  const qualityOptions = [
    { value: 'best', label: '最高画质', description: '优先选择最佳视频和音频' },
    { value: 'worst', label: '最低画质', description: '优先选择最差质量' },
    { value: 'bestvideo[height<=2160]+bestaudio', label: '4K', description: '最高2160p' },
    { value: 'bestvideo[height<=1440]+bestaudio', label: '2K', description: '最高1440p' },
    { value: 'bestvideo[height<=1080]+bestaudio', label: '1080p', description: '最高1080p' },
    { value: 'bestvideo[height<=720]+bestaudio', label: '720p', description: '最高720p' },
    { value: 'bestvideo[height<=480]+bestaudio', label: '480p', description: '最高480p' },
    { value: 'bestaudio', label: '仅音频', description: '只下载音频' },
  ];

  const handleUpdate = useCallback((updatedTask: TaskResponse) => {
    setTasks((prev) => {
      const index = prev.findIndex((t) => t.task_id === updatedTask.task_id);
      if (index >= 0) {
        const newTasks = [...prev];
        newTasks[index] = updatedTask;
        return newTasks;
      }
      return [updatedTask, ...prev];
    });

    if (selectedTask === updatedTask.task_id) {
      setLogs(updatedTask.logs || []);
      setSelectedTaskTitle(updatedTask.title || updatedTask.task_id);
    }
  }, [selectedTask]);

  useWebSocket(handleUpdate);

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const data = await api.tasks.getAll();
      setTasks(data);
      if (selectedTask) {
        const task = data.find((t) => t.task_id === selectedTask);
        if (task) {
          setLogs(task.logs || []);
          setSelectedTaskTitle(task.title || task.task_id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCancel = async (taskId: string) => {
    try {
      await api.tasks.cancel(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  };

  const handleViewLogs = async (taskId: string) => {
    setSelectedTask(taskId);
    const task = tasks.find((t) => t.task_id === taskId);
    if (task) {
      setLogs(task.logs || []);
      setSelectedTaskTitle(task.title || task.task_id);
    } else {
      try {
        const data = await api.tasks.getLogs(taskId);
        setLogs(data.logs);
        setSelectedTaskTitle(taskId);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        setLogs(['获取日志失败']);
        setSelectedTaskTitle(taskId);
      }
    }
    setLogsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setMessage({ type: 'error', text: '请输入视频链接' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const request: CreateTaskRequest = {
        url: url.trim(),
        format: {
          format: quality,
        } as FormatConfig,
      };

      await api.tasks.create(request);
      setMessage({ type: 'success', text: '任务已创建，正在下载中...' });
      setUrl('');
      fetchTasks();
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message || '创建任务失败' });
    } finally {
      setLoading(false);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const statusOrder = { downloading: 0, pending: 1, completed: 2, failed: 3, cancelled: 4 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const stats = {
    total: tasks.length,
    downloading: tasks.filter((t) => t.status === 'downloading').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-gradient-to-br from-primary-900 to-slate-900 rounded-2xl p-8 border border-primary-700/50">
        <h2 className="text-2xl font-bold text-white mb-2">下载视频</h2>
        <p className="text-slate-400 mb-6">输入视频链接开始下载</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">视频链接</label>
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入 YouTube、Bilibili、抖音等视频链接..."
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Video size={16} className="inline mr-1" />
              画质选择
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {qualityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setQuality(option.value)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    quality === option.value
                      ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-slate-500 truncate">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-red-500/20 border border-red-500/50 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-medium rounded-xl transition-colors"
            >
              <Download size={20} />
              {loading ? '创建中...' : '开始下载'}
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">任务管理</h2>
          <p className="text-slate-400">查看和管理所有下载任务</p>
        </div>
        <button
          onClick={fetchTasks}
          disabled={tasksLoading}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={18} className={tasksLoading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-slate-400 text-sm">总任务数</div>
        </div>
        <div className="bg-accent-500/20 rounded-xl p-4 border border-accent-500/50">
          <div className="text-2xl font-bold text-accent-500">{stats.downloading}</div>
          <div className="text-accent-400/80 text-sm">下载中</div>
        </div>
        <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/50">
          <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
          <div className="text-green-400/80 text-sm">已完成</div>
        </div>
        <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/50">
          <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
          <div className="text-red-400/80 text-sm">失败</div>
        </div>
      </div>

      {tasksLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-accent-500" size={32} />
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-2">暂无下载任务</div>
          <div className="text-slate-600 text-sm">输入视频链接创建下载任务</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.task_id}
              taskId={task.task_id}
              title={task.title}
              url={task.url}
              status={task.status}
              progress={task.progress}
              speed={task.speed}
              eta={task.eta}
              error={task.error_message}
              onCancel={() => handleCancel(task.task_id)}
              onViewLogs={() => handleViewLogs(task.task_id)}
            />
          ))}
        </div>
      )}

      {logsModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-accent-500" />
                <span className="font-medium text-white">任务日志 - {selectedTaskTitle || selectedTask}</span>
              </div>
              <button
                onClick={() => setLogsModalOpen(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div
              ref={logsContainerRef}
              className="flex-1 overflow-auto p-4"
            >
              {logs.length === 0 ? (
                <div className="text-center text-slate-500 py-8">暂无日志，等待下载开始...</div>
              ) : (
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                  {logs.join('\n')}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}