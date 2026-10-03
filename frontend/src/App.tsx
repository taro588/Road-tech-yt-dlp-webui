import { Route, Routes, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { DownloadPage } from '@/pages/DownloadPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar currentPage={location.pathname} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<DownloadPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
