"""数据模型定义"""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    PENDING = "pending"
    DOWNLOADING = "downloading"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class NetworkConfig(BaseModel):
    proxy: Optional[str] = ""
    socket_timeout: Optional[int] = 300
    force_ipv4: Optional[bool] = False
    force_ipv6: Optional[bool] = False
    source_address: Optional[str] = ""
    impersonate: Optional[str] = ""
    geo_verification_proxy: Optional[str] = ""
    xff: Optional[str] = ""
    enable_file_urls: Optional[bool] = False


class DownloadConfig(BaseModel):
    concurrent_fragments: Optional[int] = 1
    limit_rate: Optional[str] = ""
    retries: Optional[int] = 10
    fragment_retries: Optional[int] = 10
    file_access_retries: Optional[int] = 3
    retry_sleep: Optional[str] = ""
    http_chunk_size: Optional[str] = ""
    throttled_rate: Optional[str] = ""
    buffer_size: Optional[int] = 1024
    resize_buffer: Optional[bool] = True
    keep_fragments: Optional[bool] = False
    skip_unavailable_fragments: Optional[bool] = True
    abort_on_unavailable_fragments: Optional[bool] = False
    hls_use_mpegts: Optional[bool] = False
    download_sections: Optional[str] = ""
    downloader: Optional[str] = ""
    downloader_args: Optional[str] = ""


class FilesystemConfig(BaseModel):
    output_template: Optional[str] = "%(title)s.%(ext)s"
    output_na_placeholder: Optional[str] = "NA"
    restrict_filenames: Optional[bool] = False
    windows_filenames: Optional[bool] = False
    trim_filenames: Optional[int] = 0
    no_overwrites: Optional[bool] = False
    force_overwrites: Optional[bool] = False
    continue_download: Optional[bool] = True
    part_files: Optional[bool] = True
    mtime: Optional[bool] = False
    write_description: Optional[bool] = False
    write_info_json: Optional[bool] = False
    write_playlist_metafiles: Optional[bool] = True
    write_comments: Optional[bool] = False
    clean_info_json: Optional[bool] = True
    load_info_json: Optional[str] = ""
    write_thumbnail: Optional[bool] = False
    write_all_thumbnails: Optional[bool] = False
    write_link: Optional[bool] = False
    write_url_link: Optional[bool] = False
    write_webloc_link: Optional[bool] = False
    write_desktop_link: Optional[bool] = False
    cache_dir: Optional[str] = ""


class FormatConfig(BaseModel):
    format: Optional[str] = ""
    format_sort: Optional[str] = ""
    format_sort_reset: Optional[bool] = False
    format_sort_force: Optional[bool] = False
    merge_output_format: Optional[str] = ""
    prefer_free_formats: Optional[bool] = False
    video_multistreams: Optional[bool] = False
    audio_multistreams: Optional[bool] = False
    check_formats: Optional[bool] = False
    check_all_formats: Optional[bool] = False


class SubtitleConfig(BaseModel):
    write_subs: Optional[bool] = False
    write_auto_subs: Optional[bool] = False
    sub_format: Optional[str] = ""
    sub_langs: Optional[str] = "en,zh"


class PostProcessingConfig(BaseModel):
    extract_audio: Optional[bool] = False
    audio_format: Optional[str] = "mp3"
    audio_quality: Optional[str] = "5"
    remux_video: Optional[str] = ""
    recode_video: Optional[str] = ""
    keep_video: Optional[bool] = False
    post_overwrites: Optional[bool] = True
    embed_subs: Optional[bool] = False
    embed_thumbnail: Optional[bool] = False
    embed_metadata: Optional[bool] = False
    embed_chapters: Optional[bool] = False
    embed_info_json: Optional[bool] = False
    xattrs: Optional[bool] = False
    concat_playlist: Optional[str] = "multi_video"
    fixup: Optional[str] = "detect_or_warn"
    split_chapters: Optional[bool] = False
    remove_chapters: Optional[str] = ""
    force_keyframes_at_cuts: Optional[bool] = False
    exec: Optional[str] = ""
    convert_subs: Optional[str] = "srt"
    convert_thumbnails: Optional[str] = ""
    postprocessor_args: Optional[str] = ""
    parse_metadata: Optional[str] = ""
    replace_in_metadata: Optional[str] = ""


class SponsorBlockConfig(BaseModel):
    enabled: Optional[bool] = False
    mark: Optional[str] = ""
    remove: Optional[str] = ""
    chapter_title: Optional[str] = "[SponsorBlock]: %(category_names)l"
    api_url: Optional[str] = "https://sponsor.ajay.app"


class WorkaroundsConfig(BaseModel):
    sleep_requests: Optional[int] = 0
    sleep_interval: Optional[int] = 0
    max_sleep_interval: Optional[int] = 0
    sleep_subtitles: Optional[int] = 0
    add_headers: Optional[str] = ""
    encoding: Optional[str] = ""
    legacy_server_connect: Optional[bool] = False
    no_check_certificates: Optional[bool] = False
    prefer_insecure: Optional[bool] = False
    bidi_workaround: Optional[bool] = False


class VideoSelectionConfig(BaseModel):
    no_playlist: Optional[bool] = True
    yes_playlist: Optional[bool] = False
    playlist_items: Optional[str] = ""
    min_filesize: Optional[str] = ""
    max_filesize: Optional[str] = ""
    match_filters: Optional[str] = ""
    break_match_filters: Optional[str] = ""
    age_limit: Optional[int] = 0
    max_downloads: Optional[int] = 0
    download_archive: Optional[str] = ""
    break_on_existing: Optional[bool] = False
    break_per_input: Optional[bool] = False
    skip_playlist_after_errors: Optional[int] = 0
    date: Optional[str] = ""
    date_before: Optional[str] = ""
    date_after: Optional[str] = ""
    playlist_random: Optional[bool] = False
    lazy_playlist: Optional[bool] = False


class AuthenticationConfig(BaseModel):
    username: Optional[str] = ""
    password: Optional[str] = ""
    twofactor: Optional[str] = ""
    netrc: Optional[bool] = False
    netrc_location: Optional[str] = ""
    netrc_cmd: Optional[str] = ""
    video_password: Optional[str] = ""
    cookies_file: Optional[str] = ""
    cookies_from_browser: Optional[str] = ""
    ap_mso: Optional[str] = ""
    ap_username: Optional[str] = ""
    ap_password: Optional[str] = ""
    client_certificate: Optional[str] = ""
    client_certificate_key: Optional[str] = ""
    client_certificate_password: Optional[str] = ""


class ExtractorConfig(BaseModel):
    extractor_retries: Optional[int] = 3
    allow_dynamic_mpd: Optional[bool] = True
    hls_split_discontinuity: Optional[bool] = False
    extractor_args: Optional[str] = ""


class GeneralConfig(BaseModel):
    ignore_errors: Optional[bool] = False
    abort_on_error: Optional[bool] = False
    flat_playlist: Optional[bool] = False
    live_from_start: Optional[bool] = False
    wait_for_video: Optional[str] = ""
    mark_watched: Optional[bool] = False
    ignore_config: Optional[bool] = False
    compat_options: Optional[str] = ""
    color: Optional[str] = "auto"


class VerbosityConfig(BaseModel):
    quiet: Optional[bool] = False
    verbose: Optional[bool] = False
    no_warnings: Optional[bool] = False
    simulate: Optional[bool] = False
    ignore_no_formats_error: Optional[bool] = False
    skip_download: Optional[bool] = False
    print_json: Optional[bool] = False
    dump_single_json: Optional[bool] = False
    force_write_archive: Optional[bool] = False
    newline: Optional[bool] = True
    no_progress: Optional[bool] = False
    progress: Optional[bool] = True
    console_title: Optional[bool] = False
    print_traffic: Optional[bool] = False
    dump_pages: Optional[bool] = False
    write_pages: Optional[bool] = False
    progress_template: Optional[str] = ""
    progress_delta: Optional[int] = 0


class CreateTaskRequest(BaseModel):
    url: str
    output_path: Optional[str] = None
    filename: Optional[str] = None
    network: Optional[NetworkConfig] = None
    download: Optional[DownloadConfig] = None
    filesystem: Optional[FilesystemConfig] = None
    format: Optional[FormatConfig] = None
    subtitle: Optional[SubtitleConfig] = None
    post_processing: Optional[PostProcessingConfig] = None
    sponsorblock: Optional[SponsorBlockConfig] = None
    workarounds: Optional[WorkaroundsConfig] = None
    video_selection: Optional[VideoSelectionConfig] = None
    authentication: Optional[AuthenticationConfig] = None
    extractor: Optional[ExtractorConfig] = None
    general: Optional[GeneralConfig] = None
    verbosity: Optional[VerbosityConfig] = None
    extra_args: Optional[str] = None


class TaskResponse(BaseModel):
    task_id: str
    status: TaskStatus
    url: str
    title: str = ""
    progress: float = 0.0
    speed: str = ""
    eta: str = ""
    output_file: str = ""
    error_message: str = ""
    created_at: datetime
    completed_at: Optional[datetime] = None
    logs: list[str] = []


class VersionResponse(BaseModel):
    current_version: str
    latest_version: str = ""
    update_available: bool = False


class UpdateResponse(BaseModel):
    success: bool
    message: str


class ConfigResponse(BaseModel):
    default_output_path: str
    max_concurrent_tasks: int
    yt_dlp_path: str
    ffmpeg_path: str
    auto_check_update: bool
    update_interval_hours: int
    network: NetworkConfig
    download: DownloadConfig
    filesystem: FilesystemConfig
    format: FormatConfig
    subtitle: SubtitleConfig
    post_processing: PostProcessingConfig
    sponsorblock: SponsorBlockConfig
    workarounds: WorkaroundsConfig
    video_selection: VideoSelectionConfig
    authentication: AuthenticationConfig
    extractor: ExtractorConfig
    general: GeneralConfig
    verbosity: VerbosityConfig


class ConfigUpdateRequest(BaseModel):
    default_output_path: Optional[str] = None
    max_concurrent_tasks: Optional[int] = None
    yt_dlp_path: Optional[str] = None
    ffmpeg_path: Optional[str] = None
    auto_check_update: Optional[bool] = None
    update_interval_hours: Optional[int] = None
    network: Optional[NetworkConfig] = None
    download: Optional[DownloadConfig] = None
    filesystem: Optional[FilesystemConfig] = None
    format: Optional[FormatConfig] = None
    subtitle: Optional[SubtitleConfig] = None
    post_processing: Optional[PostProcessingConfig] = None
    sponsorblock: Optional[SponsorBlockConfig] = None
    workarounds: Optional[WorkaroundsConfig] = None
    video_selection: Optional[VideoSelectionConfig] = None
    authentication: Optional[AuthenticationConfig] = None
    extractor: Optional[ExtractorConfig] = None
    general: Optional[GeneralConfig] = None
    verbosity: Optional[VerbosityConfig] = None