import { AlertCircle, CheckCircle, Clock, Loader2, FileText } from 'lucide-react';
import { TaskStatus } from '@/types';

interface TaskCardProps {
  taskId: string;
  title: string;
  url: string;
  status: TaskStatus;
  progress: number;
  speed: string;
  eta: string;
  error?: string;
  onCancel?: () => void;
  onViewLogs?: () => void;
}

export function TaskCard({
  taskId,
  title,
  url,
  status,
  progress,
  speed,
  eta,
  error,
  onCancel,
  onViewLogs,
}: TaskCardProps) {
  const statusConfig = {
    pending: { label: '等待中', color: 'bg-yellow-500', icon: Clock },
    downloading: { label: '下载中', color: 'bg-accent-500', icon: Loader2 },
    completed: { label: '已完成', color: 'bg-green-500', icon: CheckCircle },
    failed: { label: '失败', color: 'bg-red-500', icon: AlertCircle },
    cancelled: { label: '已取消', color: 'bg-slate-500', icon: AlertCircle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color} text-white`}>
              {config.label}
            </span>
            <span className="text-xs text-slate-400">ID: {taskId}</span>
          </div>
          <h3 className="font-medium text-white truncate">{title || url}</h3>
        </div>
        <Icon size={20} className={status === 'downloading' ? 'text-accent-500 animate-spin' : 'text-slate-400'} />
      </div>

      {status === 'downloading' && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-400">进度</span>
            <span className="text-accent-500 font-medium">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-accent-500 to-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {(status === 'downloading' || status === 'pending') && (
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
          {speed && <span className="flex items-center gap-1"><span>速度:</span> <span className="text-white">{speed}</span></span>}
          {eta && <span className="flex items-center gap-1"><span>ETA:</span> <span className="text-white">{eta}</span></span>}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 mb-3">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        {(status === 'downloading' || status === 'pending') && onCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            取消
          </button>
        )}
        {onViewLogs && (
          <button
            onClick={onViewLogs}
            className="px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-1"
          >
            <FileText size={14} />
            查看日志
          </button>
        )}
      </div>
    </div>
  );
}