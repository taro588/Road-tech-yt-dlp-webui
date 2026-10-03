export type TaskStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled';

export interface NetworkConfig {
  proxy?: string;
  socket_timeout?: number;
  force_ipv4?: boolean;
  force_ipv6?: boolean;
  source_address?: string;
  impersonate?: string;
  geo_verification_proxy?: string;
  xff?: string;
  enable_file_urls?: boolean;
}

export interface DownloadConfig {
  concurrent_fragments?: number;
  limit_rate?: string;
  retries?: number;
  fragment_retries?: number;
  file_access_retries?: number;
  retry_sleep?: string;
  http_chunk_size?: string;
  throttled_rate?: string;
  buffer_size?: number;
  resize_buffer?: boolean;
  keep_fragments?: boolean;
  skip_unavailable_fragments?: boolean;
  abort_on_unavailable_fragments?: boolean;
  hls_use_mpegts?: boolean;
  download_sections?: string;
  downloader?: string;
  downloader_args?: string;
}

export interface FilesystemConfig {
  output_template?: string;
  output_na_placeholder?: string;
  restrict_filenames?: boolean;
  windows_filenames?: boolean;
  trim_filenames?: number;
  no_overwrites?: boolean;
  force_overwrites?: boolean;
  continue_download?: boolean;
  part_files?: boolean;
  mtime?: boolean;
  write_description?: boolean;
  write_info_json?: boolean;
  write_playlist_metafiles?: boolean;
  write_comments?: boolean;
  clean_info_json?: boolean;
  load_info_json?: string;
  write_thumbnail?: boolean;
  write_all_thumbnails?: boolean;
  write_link?: boolean;
  write_url_link?: boolean;
  write_webloc_link?: boolean;
  write_desktop_link?: boolean;
  cache_dir?: string;
}

export interface FormatConfig {
  format?: string;
  format_sort?: string;
  format_sort_reset?: boolean;
  format_sort_force?: boolean;
  merge_output_format?: string;
  prefer_free_formats?: boolean;
  video_multistreams?: boolean;
  audio_multistreams?: boolean;
  check_formats?: boolean;
  check_all_formats?: boolean;
  video_quality?: string;
  audio_quality?: string;
}

export interface SubtitleConfig {
  write_subs?: boolean;
  write_auto_subs?: boolean;
  sub_format?: string;
  sub_langs?: string;
}

export interface PostProcessingConfig {
  extract_audio?: boolean;
  audio_format?: string;
  audio_quality?: string;
  remux_video?: string;
  recode_video?: string;
  keep_video?: boolean;
  post_overwrites?: boolean;
  embed_subs?: boolean;
  embed_thumbnail?: boolean;
  embed_metadata?: boolean;
  embed_chapters?: boolean;
  embed_info_json?: boolean;
  xattrs?: boolean;
  concat_playlist?: string;
  fixup?: string;
  split_chapters?: boolean;
  remove_chapters?: string;
  force_keyframes_at_cuts?: boolean;
  exec?: string;
  convert_subs?: string;
  convert_thumbnails?: string;
  postprocessor_args?: string;
  parse_metadata?: string;
  replace_in_metadata?: string;
}

export interface SponsorBlockConfig {
  enabled?: boolean;
  mark?: string;
  remove?: string;
  chapter_title?: string;
  api_url?: string;
}

export interface WorkaroundsConfig {
  sleep_requests?: number;
  sleep_interval?: number;
  max_sleep_interval?: number;
  sleep_subtitles?: number;
  add_headers?: string;
  encoding?: string;
  legacy_server_connect?: boolean;
  no_check_certificates?: boolean;
  prefer_insecure?: boolean;
  bidi_workaround?: boolean;
}

export interface VideoSelectionConfig {
  no_playlist?: boolean;
  yes_playlist?: boolean;
  playlist_items?: string;
  min_filesize?: string;
  max_filesize?: string;
  match_filters?: string;
  break_match_filters?: string;
  age_limit?: number;
  max_downloads?: number;
  download_archive?: string;
  break_on_existing?: boolean;
  break_per_input?: boolean;
  skip_playlist_after_errors?: number;
  date?: string;
  date_before?: string;
  date_after?: string;
  playlist_random?: boolean;
  lazy_playlist?: boolean;
}

export interface AuthenticationConfig {
  username?: string;
  password?: string;
  twofactor?: string;
  netrc?: boolean;
  netrc_location?: string;
  netrc_cmd?: string;
  video_password?: string;
  cookies_file?: string;
  cookies_from_browser?: string;
  ap_mso?: string;
  ap_username?: string;
  ap_password?: string;
  client_certificate?: string;
  client_certificate_key?: string;
  client_certificate_password?: string;
}

export interface ExtractorConfig {
  extractor_retries?: number;
  allow_dynamic_mpd?: boolean;
  hls_split_discontinuity?: boolean;
  extractor_args?: string;
}

export interface GeneralConfig {
  ignore_errors?: boolean;
  abort_on_error?: boolean;
  flat_playlist?: boolean;
  live_from_start?: boolean;
  wait_for_video?: string;
  mark_watched?: boolean;
  ignore_config?: boolean;
  compat_options?: string;
  color?: string;
}

export interface VerbosityConfig {
  quiet?: boolean;
  verbose?: boolean;
  no_warnings?: boolean;
  simulate?: boolean;
  ignore_no_formats_error?: boolean;
  skip_download?: boolean;
  print_json?: boolean;
  dump_single_json?: boolean;
  force_write_archive?: boolean;
  newline?: boolean;
  no_progress?: boolean;
  progress?: boolean;
  console_title?: boolean;
  print_traffic?: boolean;
  dump_pages?: boolean;
  write_pages?: boolean;
  progress_template?: string;
  progress_delta?: number;
}

export interface CreateTaskRequest {
  url: string;
  output_path?: string;
  filename?: string;
  network?: NetworkConfig;
  download?: DownloadConfig;
  filesystem?: FilesystemConfig;
  format?: FormatConfig;
  subtitle?: SubtitleConfig;
  post_processing?: PostProcessingConfig;
  sponsorblock?: SponsorBlockConfig;
  workarounds?: WorkaroundsConfig;
  video_selection?: VideoSelectionConfig;
  authentication?: AuthenticationConfig;
  extractor?: ExtractorConfig;
  general?: GeneralConfig;
  verbosity?: VerbosityConfig;
  extra_args?: string;
}

export interface TaskResponse {
  task_id: string;
  status: TaskStatus;
  url: string;
  title: string;
  progress: number;
  speed: string;
  eta: string;
  output_file: string;
  error_message: string;
  created_at: string;
  completed_at?: string;
  logs?: string[];
}

export interface VersionResponse {
  current_version: string;
  latest_version: string;
  update_available: boolean;
}

export interface UpdateResponse {
  success: boolean;
  message: string;
}

export interface ConfigResponse {
  default_output_path: string;
  max_concurrent_tasks: number;
  yt_dlp_path: string;
  ffmpeg_path: string;
  auto_check_update: boolean;
  update_interval_hours: number;
  network: NetworkConfig;
  download: DownloadConfig;
  filesystem: FilesystemConfig;
  format: FormatConfig;
  subtitle: SubtitleConfig;
  post_processing: PostProcessingConfig;
  sponsorblock: SponsorBlockConfig;
  workarounds: WorkaroundsConfig;
  video_selection: VideoSelectionConfig;
  authentication: AuthenticationConfig;
  extractor: ExtractorConfig;
  general: GeneralConfig;
  verbosity: VerbosityConfig;
}

export interface ConfigUpdateRequest {
  default_output_path?: string;
  max_concurrent_tasks?: number;
  yt_dlp_path?: string;
  ffmpeg_path?: string;
  auto_check_update?: boolean;
  update_interval_hours?: number;
  network?: NetworkConfig;
  download?: DownloadConfig;
  filesystem?: FilesystemConfig;
  format?: FormatConfig;
  subtitle?: SubtitleConfig;
  post_processing?: PostProcessingConfig;
  sponsorblock?: SponsorBlockConfig;
  workarounds?: WorkaroundsConfig;
  video_selection?: VideoSelectionConfig;
  authentication?: AuthenticationConfig;
  extractor?: ExtractorConfig;
  general?: GeneralConfig;
  verbosity?: VerbosityConfig;
}