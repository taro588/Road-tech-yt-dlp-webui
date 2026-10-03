import { Download, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  currentPage: string;
}

export function Sidebar({ currentPage }: SidebarProps) {
  const navItems = [
    { path: '/', label: '下载', icon: Download },
    { path: '/settings', label: '设置', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-accent-500 flex items-center gap-2">
          <Download size={24} />
          yt-dlp WebUI
        </h1>
        <p className="text-slate-400 text-sm mt-1">视频下载工具</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
