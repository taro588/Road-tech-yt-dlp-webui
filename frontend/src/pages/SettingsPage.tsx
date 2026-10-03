import { useEffect, useState } from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, Download, Settings2, RefreshCw,
  ChevronDown, ChevronUp, Globe, DownloadCloud, Video, Volume2, 
  Subtitles, FolderOpen, Monitor, Flag, Zap, Lock, X
} from 'lucide-react';
import { api } from '@/api/client';
import { ConfigResponse, ConfigUpdateRequest, VersionResponse } from '@/types';

interface ConfigSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function ConfigSection({ title, icon, children }: ConfigSectionProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-left"
      >
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        {icon}
        <span className="font-medium">{title}</span>
      </button>
      {expanded && (
        <div className="mt-2 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
          {children}
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const [version, setVersion] = useState<VersionResponse | null>(null);
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [configEditing, setConfigEditing] = useState(false);
  const [configForm, setConfigForm] = useState<ConfigUpdateRequest>({});
  const [configSaved, setConfigSaved] = useState(false);

  const [activeTab, setActiveTab] = useState<'webui' | 'ytdlp'>('webui');

  const [ytDlpParams, setYtDlpParams] = useState({
    network: {
      proxy: '',
      socket_timeout: 300,
      force_ipv4: false,
      force_ipv6: false,
    },
    download: {
      concurrent_fragments: 1,
      limit_rate: '',
      retries: 10,
      skip_unavailable_fragments: true,
    },
    filesystem: {
      output_template: '%(title)s.%(ext)s',
      write_thumbnail: false,
      write_info_json: false,
      continue_download: true,
    },
    format: {
      format: '',
      merge_output_format: '',
      prefer_free_formats: false,
      video_quality: '',
      audio_quality: '',
    },
    subtitle: {
      write_subs: false,
      write_auto_subs: false,
      sub_langs: 'en,zh',
    },
    post_processing: {
      extract_audio: false,
      audio_format: 'mp3',
      audio_quality: '5',
      embed_subs: false,
      embed_thumbnail: false,
      embed_metadata: false,
      keep_video: false,
    },
    sponsorblock: {
      enabled: false,
      mark: '',
      remove: '',
    },
    video_selection: {
      no_playlist: true,
      yes_playlist: false,
      playlist_items: '',
    },
    authentication: {
      username: '',
      password: '',
      cookies_file: '',
      cookies_from_browser: '',
    },
  });

  useEffect(() => {
    fetchVersion();
    fetchConfig();
  }, []);

  const fetchVersion = async () => {
    setCheckingUpdate(true);
    try {
      const data = await api.ytDlp.getVersion();
      setVersion(data);
    } catch (error) {
      console.error('Failed to fetch version:', error);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const data = await api.config.get();
      setConfig(data);
      setConfigForm({
        default_output_path: data.default_output_path,
        max_concurrent_tasks: data.max_concurrent_tasks,
        yt_dlp_path: data.yt_dlp_path,
        ffmpeg_path: data.ffmpeg_path,
        auto_check_update: data.auto_check_update,
        update_interval_hours: data.update_interval_hours,
      });
      setYtDlpParams({
        network: {
          proxy: data.network.proxy || '',
          socket_timeout: data.network.socket_timeout || 300,
          force_ipv4: data.network.force_ipv4 || false,
          force_ipv6: data.network.force_ipv6 || false,
        },
        download: {
          concurrent_fragments: data.download.concurrent_fragments || 1,
          limit_rate: data.download.limit_rate || '',
          retries: data.download.retries || 10,
          skip_unavailable_fragments: data.download.skip_unavailable_fragments || true,
        },
        filesystem: {
          output_template: data.filesystem.output_template || '%(title)s.%(ext)s',
          write_thumbnail: data.filesystem.write_thumbnail || false,
          write_info_json: data.filesystem.write_info_json || false,
          continue_download: data.filesystem.continue_download || true,
        },
        format: {
          format: data.format.format || '',
          merge_output_format: data.format.merge_output_format || '',
          prefer_free_formats: data.format.prefer_free_formats || false,
          video_quality: '',
          audio_quality: '',
        },
        subtitle: {
          write_subs: data.subtitle.write_subs || false,
          write_auto_subs: data.subtitle.write_auto_subs || false,
          sub_langs: data.subtitle.sub_langs || 'en,zh',
        },
        post_processing: {
          extract_audio: data.post_processing.extract_audio || false,
          audio_format: data.post_processing.audio_format || 'mp3',
          audio_quality: data.post_processing.audio_quality || '5',
          embed_subs: data.post_processing.embed_subs || false,
          embed_thumbnail: data.post_processing.embed_thumbnail || false,
          embed_metadata: data.post_processing.embed_metadata || false,
          keep_video: data.post_processing.keep_video || false,
        },
        sponsorblock: {
          enabled: data.sponsorblock.enabled || false,
          mark: data.sponsorblock.mark || '',
          remove: data.sponsorblock.remove || '',
        },
        video_selection: {
          no_playlist: data.video_selection.no_playlist || true,
          yes_playlist: data.video_selection.yes_playlist || false,
          playlist_items: data.video_selection.playlist_items || '',
        },
        authentication: {
          username: data.authentication?.username || '',
          password: data.authentication?.password || '',
          cookies_file: data.authentication?.cookies_file || '',
          cookies_from_browser: data.authentication?.cookies_from_browser || '',
        },
      });
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    setUpdateMessage(null);
    try {
      const result = await api.ytDlp.update();
      if (result.success) {
        setUpdateMessage({ type: 'success', text: result.message });
        await fetchVersion();
      } else {
        setUpdateMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setUpdateMessage({ type: 'error', text: (error as Error).message || '更新失败' });
    } finally {
      setUpdating(false);
    }
  };

  const handleConfigSave = async () => {
    try {
      await api.config.update(configForm);
      setConfigSaved(true);
      await fetchConfig();
      setTimeout(() => setConfigSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const [ytDlpSaved, setYtDlpSaved] = useState(false);
  const [ytDlpSaving, setYtDlpSaving] = useState(false);

  const [cookiesFiles, setCookiesFiles] = useState<string[]>([]);
  const [uploadingCookies, setUploadingCookies] = useState(false);
  const [cookiesMessage, setCookiesMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCookiesFiles = async () => {
    try {
      const data = await api.config.listCookies();
      setCookiesFiles(data.files);
    } catch (error) {
      console.error('Failed to fetch cookies files:', error);
    }
  };

  useEffect(() => {
    fetchCookiesFiles();
  }, []);

  const handleCookiesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      setCookiesMessage({ type: 'error', text: '仅支持 .txt 格式的 cookies 文件' });
      return;
    }

    setUploadingCookies(true);
    setCookiesMessage(null);

    try {
      await api.config.uploadCookies(file);
      setCookiesMessage({ type: 'success', text: 'Cookies 文件上传成功' });
      await fetchCookiesFiles();
      await fetchConfig();
    } catch (error) {
      setCookiesMessage({ type: 'error', text: (error as Error).message || '上传失败' });
    } finally {
      setUploadingCookies(false);
      e.target.value = '';
    }
  };

  const handleCookiesDelete = async (filename: string) => {
    try {
      await api.config.deleteCookies(filename);
      setCookiesMessage({ type: 'success', text: '文件删除成功' });
      await fetchCookiesFiles();
      await fetchConfig();
    } catch (error) {
      setCookiesMessage({ type: 'error', text: (error as Error).message || '删除失败' });
    }
  };

  const handleCookiesSelect = (filename: string) => {
    const filePath = `/app/config/cookies/${filename}`;
    setYtDlpParams({ ...ytDlpParams, authentication: { ...ytDlpParams.authentication, cookies_file: filePath } });
  };

  const handleYtDlpParamsSave = async () => {
    setYtDlpSaving(true);
    try {
      const request: ConfigUpdateRequest = {
        ...configForm,
        network: ytDlpParams.network,
        download: ytDlpParams.download,
        filesystem: ytDlpParams.filesystem,
        format: ytDlpParams.format,
        subtitle: ytDlpParams.subtitle,
        post_processing: ytDlpParams.post_processing,
        sponsorblock: ytDlpParams.sponsorblock,
        video_selection: ytDlpParams.video_selection,
        authentication: ytDlpParams.authentication,
      };
      await api.config.update(request);
      setYtDlpSaved(true);
      await fetchConfig();
      setTimeout(() => setYtDlpSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save yt-dlp params:', error);
    } finally {
      setYtDlpSaving(false);
    }
  };

  const audioQualities = [
    { value: '0', label: '最高质量' },
    { value: '5', label: '中等质量' },
    { value: '9', label: '最低质量' },
  ];
  const audioFormats = ['mp3', 'aac', 'flac', 'm4a', 'opus', 'vorbis', 'wav'];
  const videoFormats = ['mp4', 'mkv', 'webm', 'avi', 'flv', 'mov'];
  const videoQualityOptions = [
    { value: '', label: '自动' },
    { value: 'bestvideo', label: '最高画质' },
    { value: 'bestvideo[height<=2160]', label: '4K (2160p)' },
    { value: 'bestvideo[height<=1440]', label: '2K (1440p)' },
    { value: 'bestvideo[height<=1080]', label: '1080p' },
    { value: 'bestvideo[height<=720]', label: '720p' },
    { value: 'bestvideo[height<=480]', label: '480p' },
    { value: 'worstvideo', label: '最低画质' },
  ];

  const audioQualityOptions = [
    { value: '', label: '自动' },
    { value: 'bestaudio', label: '最高音质' },
    { value: 'worstaudio', label: '最低音质' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">设置</h2>
      <p className="text-slate-400 mb-6">管理 WebUI 和 yt-dlp 配置</p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('webui')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'webui'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          WebUI 设置
        </button>
        <button
          onClick={() => setActiveTab('ytdlp')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'ytdlp'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          yt-dlp 设置
        </button>
      </div>

      {activeTab === 'webui' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Download className="text-accent-500" size={24} />
              <h3 className="text-lg font-semibold text-white">yt-dlp 更新</h3>
            </div>

            {checkingUpdate ? (
              <div className="flex items-center gap-2 text-slate-400">
                <RefreshCw className="animate-spin" size={20} />
                检查更新中...
              </div>
            ) : version ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">当前版本</span>
                  <span className="font-mono text-white">{version.current_version}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <span className="text-slate-400">最新版本</span>
                  <span className="font-mono text-accent-500">{version.latest_version || '未知'}</span>
                </div>

                {version.update_available && (
                  <div className="bg-accent-500/20 border border-accent-500/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="text-accent-500" size={18} />
                      <span className="font-medium text-accent-400">有新版本可用</span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      当前版本: {version.current_version} → 最新版本: {version.latest_version}
                    </p>
                  </div>
                )}

                {!version.update_available && version.latest_version && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={18} />
                      <span className="font-medium text-green-400">当前已是最新版本</span>
                    </div>
                  </div>
                )}

                {updateMessage && (
                  <div
                    className={`mb-4 p-4 rounded-lg ${
                      updateMessage.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                        : 'bg-red-500/20 border border-red-500/50 text-red-400'
                    }`}
                  >
                    {updateMessage.text}
                  </div>
                )}

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-red-400">
                      更新 yt-dlp 可能会因接口变化导致 WebUI 功能失效，请谨慎操作。
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={fetchVersion}
                    disabled={checkingUpdate}
                    className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={checkingUpdate ? 'animate-spin' : ''} />
                    检查更新
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updating || !version.update_available}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      version.update_available && !updating
                        ? 'bg-accent-500 text-white hover:bg-accent-400'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Download size={16} />
                    {updating ? '更新中...' : '一键更新'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-500">无法获取版本信息</div>
            )}
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Settings2 className="text-accent-500" size={24} />
                <h3 className="text-lg font-semibold text-white">全局配置</h3>
              </div>
              {!configEditing ? (
                <button
                  onClick={() => setConfigEditing(true)}
                  className="px-3 py-1.5 bg-accent-500/20 text-accent-400 rounded-lg hover:bg-accent-500/30 transition-colors text-sm"
                >
                  编辑
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setConfigEditing(false);
                      fetchConfig();
                    }}
                    className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfigSave}
                    className={`px-3 py-1.5 rounded-lg transition-colors text-sm flex items-center gap-1 ${
                      configSaved
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-accent-500 text-white hover:bg-accent-400'
                    }`}
                  >
                    <CheckCircle size={14} />
                    {configSaved ? '已保存' : '保存'}
                  </button>
                </div>
              )}
            </div>

            {config && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">默认输出路径</label>
                    <input
                      type="text"
                      value={configForm.default_output_path || ''}
                      onChange={(e) => setConfigForm({ ...configForm, default_output_path: e.target.value })}
                      disabled={!configEditing}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        configEditing
                          ? 'bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-accent-500'
                          : 'bg-slate-700/50 border border-slate-700 text-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">最大并发任务数</label>
                    <input
                      type="number"
                      value={configForm.max_concurrent_tasks || ''}
                      onChange={(e) => setConfigForm({ ...configForm, max_concurrent_tasks: parseInt(e.target.value) || undefined })}
                      disabled={!configEditing}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        configEditing
                          ? 'bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-accent-500'
                          : 'bg-slate-700/50 border border-slate-700 text-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">yt-dlp 路径</label>
                    <input
                      type="text"
                      value={configForm.yt_dlp_path || ''}
                      onChange={(e) => setConfigForm({ ...configForm, yt_dlp_path: e.target.value })}
                      disabled={!configEditing}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        configEditing
                          ? 'bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-accent-500'
                          : 'bg-slate-700/50 border border-slate-700 text-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">FFmpeg 路径</label>
                    <input
                      type="text"
                      value={configForm.ffmpeg_path || ''}
                      onChange={(e) => setConfigForm({ ...configForm, ffmpeg_path: e.target.value })}
                      disabled={!configEditing}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        configEditing
                          ? 'bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-accent-500'
                          : 'bg-slate-700/50 border border-slate-700 text-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">自动检查更新</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={configForm.auto_check_update ?? false}
                        onChange={(e) => setConfigForm({ ...configForm, auto_check_update: e.target.checked })}
                        disabled={!configEditing}
                        className={`w-4 h-4 rounded ${
                          configEditing
                            ? 'border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500'
                            : 'border-slate-600 bg-slate-700'
                        }`}
                      />
                      <span className="text-sm text-slate-300">启用自动检查</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">更新检查间隔（小时）</label>
                    <input
                      type="number"
                      value={configForm.update_interval_hours || ''}
                      onChange={(e) => setConfigForm({ ...configForm, update_interval_hours: parseInt(e.target.value) || undefined })}
                      disabled={!configEditing}
                      className={`w-full px-3 py-2 rounded-lg text-sm ${
                        configEditing
                          ? 'bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-accent-500'
                          : 'bg-slate-700/50 border border-slate-700 text-slate-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ytdlp' && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">yt-dlp 下载参数</h3>
          <p className="text-slate-400 text-sm mb-6">这些参数将应用于所有下载任务</p>

          <ConfigSection title="网络设置" icon={<Globe size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">代理服务器</label>
                <input
                  type="text"
                  value={ytDlpParams.network.proxy}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, network: { ...ytDlpParams.network, proxy: e.target.value } })}
                  placeholder="http://proxy:port"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">超时时间（秒）</label>
                <input
                  type="number"
                  value={ytDlpParams.network.socket_timeout}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, network: { ...ytDlpParams.network, socket_timeout: parseInt(e.target.value) || 300 } })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ytDlpParams.network.force_ipv4}
                    onChange={(e) => setYtDlpParams({ ...ytDlpParams, network: { ...ytDlpParams.network, force_ipv4: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300">强制 IPv4</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ytDlpParams.network.force_ipv6}
                    onChange={(e) => setYtDlpParams({ ...ytDlpParams, network: { ...ytDlpParams.network, force_ipv6: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300">强制 IPv6</span>
                </label>
              </div>
            </div>
          </ConfigSection>

          <ConfigSection title="下载设置" icon={<DownloadCloud size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">并发下载片段数</label>
                <input
                  type="number"
                  value={ytDlpParams.download.concurrent_fragments}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, download: { ...ytDlpParams.download, concurrent_fragments: parseInt(e.target.value) || 1 } })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">下载限速</label>
                <input
                  type="text"
                  value={ytDlpParams.download.limit_rate}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, download: { ...ytDlpParams.download, limit_rate: e.target.value } })}
                  placeholder="如: 50K, 4.2M"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">重试次数</label>
                <input
                  type="number"
                  value={ytDlpParams.download.retries}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, download: { ...ytDlpParams.download, retries: parseInt(e.target.value) || 10 } })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ytDlpParams.download.skip_unavailable_fragments}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, download: { ...ytDlpParams.download, skip_unavailable_fragments: e.target.checked } })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-300">跳过不可用片段</span>
              </div>
            </div>
          </ConfigSection>

          <ConfigSection title="视频格式" icon={<Video size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">视频画质</label>
                <select
                  value={ytDlpParams.format.video_quality}
                  onChange={(e) => {
                    const videoQuality = e.target.value;
                    const audioQuality = ytDlpParams.format.audio_quality;
                    let format = '';
                    if (videoQuality && audioQuality) {
                      format = `${videoQuality}+${audioQuality}`;
                    } else if (videoQuality) {
                      format = videoQuality;
                    } else if (audioQuality) {
                      format = audioQuality;
                    }
                    setYtDlpParams({ ...ytDlpParams, format: { ...ytDlpParams.format, video_quality: videoQuality, format } });
                  }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  {videoQualityOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">音频音质</label>
                <select
                  value={ytDlpParams.format.audio_quality}
                  onChange={(e) => {
                    const audioQuality = e.target.value;
                    const videoQuality = ytDlpParams.format.video_quality;
                    let format = '';
                    if (videoQuality && audioQuality) {
                      format = `${videoQuality}+${audioQuality}`;
                    } else if (videoQuality) {
                      format = videoQuality;
                    } else if (audioQuality) {
                      format = audioQuality;
                    }
                    setYtDlpParams({ ...ytDlpParams, format: { ...ytDlpParams.format, audio_quality: audioQuality, format } });
                  }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  {audioQualityOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">合并输出格式</label>
                <select
                  value={ytDlpParams.format.merge_output_format}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, format: { ...ytDlpParams.format, merge_output_format: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">自动</option>
                  {videoFormats.map((f) => (
                    <option key={f} value={f}>{f.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ytDlpParams.format.prefer_free_formats}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, format: { ...ytDlpParams.format, prefer_free_formats: e.target.checked } })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-300">优先自由格式</span>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">生成的格式代码</label>
                <div className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 font-mono text-sm">
                  {ytDlpParams.format.format || '未选择（使用默认）'}
                </div>
              </div>
            </div>
          </ConfigSection>

          <ConfigSection title="音频设置" icon={<Volume2 size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setYtDlpParams({ ...ytDlpParams, post_processing: { ...ytDlpParams.post_processing, extract_audio: false } })}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                    !ytDlpParams.post_processing.extract_audio
                      ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                      : 'bg-slate-700 border-slate-600 text-slate-400'
                  }`}
                >
                  下载视频
                </button>
                <button
                  type="button"
                  onClick={() => setYtDlpParams({ ...ytDlpParams, post_processing: { ...ytDlpParams.post_processing, extract_audio: true } })}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                    ytDlpParams.post_processing.extract_audio
                      ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                      : 'bg-slate-700 border-slate-600 text-slate-400'
                  }`}
                >
                  仅音频
                </button>
              </div>
              {ytDlpParams.post_processing.extract_audio && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">音频格式</label>
                    <select
                      value={ytDlpParams.post_processing.audio_format}
                      onChange={(e) => setYtDlpParams({ ...ytDlpParams, post_processing: { ...ytDlpParams.post_processing, audio_format: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      {audioFormats.map((f) => (
                        <option key={f} value={f}>{f.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">音频质量</label>
                    <select
                      value={ytDlpParams.post_processing.audio_quality}
                      onChange={(e) => setYtDlpParams({ ...ytDlpParams, post_processing: { ...ytDlpParams.post_processing, audio_quality: e.target.value } })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      {audioQualities.map((q) => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ytDlpParams.post_processing.keep_video}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, post_processing: { ...ytDlpParams.post_processing, keep_video: e.target.checked } })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-300">保留原始文件</span>
              </label>
            </div>
          </ConfigSection>

          <ConfigSection title="字幕设置" icon={<Subtitles size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ytDlpParams.subtitle.write_subs}
                    onChange={(e) => setYtDlpParams({ ...ytDlpParams, subtitle: { ...ytDlpParams.subtitle, write_subs: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300">下载字幕</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ytDlpParams.subtitle.write_auto_subs}
                    onChange={(e) => setYtDlpParams({ ...ytDlpParams, subtitle: { ...ytDlpParams.subtitle, write_auto_subs: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300">自动生成字幕</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">字幕语言</label>
                <input
                  type="text"
                  value={ytDlpParams.subtitle.sub_langs}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, subtitle: { ...ytDlpParams.subtitle, sub_langs: e.target.value } })}
                  placeholder="en,zh 或 all"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>
          </ConfigSection>

          <ConfigSection title="文件系统" icon={<FolderOpen size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">输出模板</label>
                <input
                  type="text"
                  value={ytDlpParams.filesystem.output_template}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, filesystem: { ...ytDlpParams.filesystem, output_template: e.target.value } })}
                  placeholder="%(title)s.%(ext)s"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ytDlpParams.filesystem.write_thumbnail}
                    onChange={(e) => setYtDlpParams({ ...ytDlpParams, filesystem: { ...ytDlpParams.filesystem, write_thumbnail: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300">下载缩略图</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ytDlpParams.filesystem.write_info_json}
                    onChange={(e) => setYtDlpParams({ ...ytDlpParams, filesystem: { ...ytDlpParams.filesystem, write_info_json: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300">写入 JSON</span>
                </label>
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ytDlpParams.filesystem.continue_download}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, filesystem: { ...ytDlpParams.filesystem, continue_download: e.target.checked } })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-300">断点续传</span>
              </div>
            </div>
          </ConfigSection>

          <ConfigSection title="后处理" icon={<Monitor size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ytDlpParams.post_processing.embed_thumbnail}
                    onChange={(e) => setYtDlpParams({ ...ytDlpParams, post_processing: { ...ytDlpParams.post_processing, embed_thumbnail: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300">嵌入缩略图</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ytDlpParams.post_processing.embed_metadata}
                    onChange={(e) => setYtDlpParams({ ...ytDlpParams, post_processing: { ...ytDlpParams.post_processing, embed_metadata: e.target.checked } })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300">嵌入元数据</span>
                </label>
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ytDlpParams.post_processing.embed_subs}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, post_processing: { ...ytDlpParams.post_processing, embed_subs: e.target.checked } })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-300">嵌入字幕</span>
              </div>
            </div>
          </ConfigSection>

          <ConfigSection title="SponsorBlock" icon={<Flag size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ytDlpParams.sponsorblock.enabled}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, sponsorblock: { ...ytDlpParams.sponsorblock, enabled: e.target.checked } })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-300">启用 SponsorBlock</span>
              </div>
              {ytDlpParams.sponsorblock.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">标记章节</label>
                    <input
                      type="text"
                      value={ytDlpParams.sponsorblock.mark}
                      onChange={(e) => setYtDlpParams({ ...ytDlpParams, sponsorblock: { ...ytDlpParams.sponsorblock, mark: e.target.value } })}
                      placeholder="如: sponsor,intro"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">移除片段</label>
                    <input
                      type="text"
                      value={ytDlpParams.sponsorblock.remove}
                      onChange={(e) => setYtDlpParams({ ...ytDlpParams, sponsorblock: { ...ytDlpParams.sponsorblock, remove: e.target.value } })}
                      placeholder="如: sponsor,intro"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                </>
              )}
            </div>
          </ConfigSection>

          <ConfigSection title="视频选择" icon={<Zap size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setYtDlpParams({ ...ytDlpParams, video_selection: { ...ytDlpParams.video_selection, no_playlist: true, yes_playlist: false } })}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                    ytDlpParams.video_selection.no_playlist
                      ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                      : 'bg-slate-700 border-slate-600 text-slate-400'
                  }`}
                >
                  仅视频
                </button>
                <button
                  type="button"
                  onClick={() => setYtDlpParams({ ...ytDlpParams, video_selection: { ...ytDlpParams.video_selection, no_playlist: false, yes_playlist: true } })}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                    ytDlpParams.video_selection.yes_playlist
                      ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                      : 'bg-slate-700 border-slate-600 text-slate-400'
                  }`}
                >
                  播放列表
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">播放列表项目</label>
                <input
                  type="text"
                  value={ytDlpParams.video_selection.playlist_items}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, video_selection: { ...ytDlpParams.video_selection, playlist_items: e.target.value } })}
                  placeholder="如: 1:5,10"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>
          </ConfigSection>

          <ConfigSection title="认证设置" icon={<Lock size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">用户名</label>
                <input
                  type="text"
                  value={ytDlpParams.authentication.username}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, authentication: { ...ytDlpParams.authentication, username: e.target.value } })}
                  placeholder="用户名"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">密码</label>
                <input
                  type="password"
                  value={ytDlpParams.authentication.password}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, authentication: { ...ytDlpParams.authentication, password: e.target.value } })}
                  placeholder="密码"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Cookies 文件</label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleCookiesUpload}
                  disabled={uploadingCookies}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 cursor-pointer"
                />
                {uploadingCookies && (
                  <div className="mt-2 flex items-center gap-2 text-accent-500">
                    <RefreshCw className="animate-spin" size={16} />
                    上传中...
                  </div>
                )}
                {cookiesMessage && (
                  <div className={`mt-2 p-3 rounded-lg text-sm ${
                    cookiesMessage.type === 'success'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {cookiesMessage.text}
                  </div>
                )}
              </div>
              {cookiesFiles.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">已上传的 Cookies 文件</label>
                  <div className="flex flex-wrap gap-2">
                    {cookiesFiles.map((filename) => (
                      <div
                        key={filename}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                          ytDlpParams.authentication.cookies_file?.includes(filename)
                            ? 'bg-accent-500/20 border-accent-500 text-accent-400'
                            : 'bg-slate-700 border-slate-600 text-slate-300'
                        }`}
                      >
                        <button
                          onClick={() => handleCookiesSelect(filename)}
                          className="hover:underline"
                        >
                          {filename}
                        </button>
                        <button
                          onClick={() => handleCookiesDelete(filename)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">浏览器 Cookies（可选）</label>
                <input
                  type="text"
                  value={ytDlpParams.authentication.cookies_from_browser}
                  onChange={(e) => setYtDlpParams({ ...ytDlpParams, authentication: { ...ytDlpParams.authentication, cookies_from_browser: e.target.value } })}
                  placeholder="如: chrome, firefox, edge"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <p className="text-xs text-slate-500 mt-1">从浏览器直接导入 cookies，格式: browser[+profile][~keyring]</p>
              </div>
            </div>
          </ConfigSection>

          <div className="mt-6 flex justify-end">
            {ytDlpSaved && (
              <div className="mr-4 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg flex items-center gap-2">
                <CheckCircle size={18} />
                已保存
              </div>
            )}
            <button
              onClick={handleYtDlpParamsSave}
              disabled={ytDlpSaving}
              className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 disabled:bg-accent-700 text-white font-medium rounded-xl transition-colors"
            >
              <CheckCircle size={18} />
              {ytDlpSaving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'webui' && (
        <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">容器挂载说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-accent-500 font-mono text-sm mb-2">/downloads</div>
              <div className="text-slate-400 text-sm">下载文件存储目录</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-accent-500 font-mono text-sm mb-2">/usr/local/lib/python3.11/site-packages/yt_dlp</div>
              <div className="text-slate-400 text-sm">yt-dlp 安装目录（用于持久化更新）</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-accent-500 font-mono text-sm mb-2">/app/config/config.json</div>
              <div className="text-slate-400 text-sm">配置文件</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}