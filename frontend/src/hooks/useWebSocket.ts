import { useEffect, useRef, useState } from 'react';
import { TaskResponse } from '@/types';

interface TaskUpdate {
  task_id: string;
  status: string;
  url: string;
  title: string;
  progress: number;
  speed: string;
  eta: string;
  output_file: string;
  error_message: string;
  created_at: string;
  completed_at?: string;
  logs: string[];
}

export function useWebSocket(onUpdate: (task: TaskResponse) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws/tasks`);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as TaskUpdate;
        onUpdate({
          task_id: data.task_id,
          status: data.status as TaskResponse['status'],
          url: data.url,
          title: data.title,
          progress: data.progress,
          speed: data.speed,
          eta: data.eta,
          output_file: data.output_file,
          error_message: data.error_message,
          created_at: data.created_at,
          completed_at: data.completed_at,
          logs: data.logs || [],
        });
      } catch {
        console.error('Failed to parse WebSocket message');
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [onUpdate]);

  return { connected };
}
