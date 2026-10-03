"""yt-dlp 执行器，负责调用 yt-dlp 命令行工具执行下载"""
import asyncio
import json
import os
import re
import subprocess
from typing import Any, Optional

from .config_service import load_config
from .models import (
    AuthenticationConfig,
    DownloadConfig,
    ExtractorConfig,
    FilesystemConfig,
    FormatConfig,
    GeneralConfig,
    NetworkConfig,
    PostProcessingConfig,
    SponsorBlockConfig,
    SubtitleConfig,
    TaskStatus,
    VerbosityConfig,
    VideoSelectionConfig,
    WorkaroundsConfig,
)


def _get_yt_dlp_path() -> str:
    """获取 yt-dlp 可执行文件路径"""
    config = load_config()
    yt_dlp_path = config.get("yt_dlp_path", "/usr/local/bin/yt-dlp")
    if not os.path.exists(yt_dlp_path):
        return "yt-dlp"
    return yt_dlp_path


def _get_ffmpeg_path() -> str:
    """获取 ffmpeg 可执行文件路径"""
    config = load_config()
    return config.get("ffmpeg_path", "/usr/bin/ffmpeg")


def get_current_version() -> str:
    """获取当前 yt-dlp 版本"""
    try:
        yt_dlp = _get_yt_dlp_path()
        result = subprocess.run(
            [yt_dlp, "--version"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0:
            return result.stdout.strip().split("\n")[0].strip()
    except Exception:
        pass
    return "unknown"


def _normalize_version(version: str) -> str:
    """规范化版本号格式为 YYYY.MM.DD"""
    parts = version.split(".")
    if len(parts) == 3:
        return f"{parts[0]}.{parts[1].zfill(2)}.{parts[2].zfill(2)}"
    return version


def get_latest_version() -> str:
    """获取 yt-dlp 最新版本号"""
    config = load_config()
    proxy = config.get("network", {}).get("proxy", "")
    
    env = os.environ.copy()
    if proxy:
        env["HTTP_PROXY"] = proxy
        env["HTTPS_PROXY"] = proxy
    
    try:
        result = subprocess.run(
            ["pip", "index", "versions", "yt-dlp"],
            capture_output=True,
            text=True,
            timeout=15,
            env=env,
        )
        if result.returncode == 0:
            match = re.search(r"Available versions:\s*([\d.]+)", result.stdout)
            if match:
                return _normalize_version(match.group(1))
    except Exception:
        pass
    try:
        result = subprocess.run(
            ["pip", "show", "yt-dlp"],
            capture_output=True,
            text=True,
            timeout=10,
            env=env,
        )
        if result.returncode == 0:
            for line in result.stdout.split("\n"):
                if line.startswith("Version:"):
                    return _normalize_version(line.split(":", 1)[1].strip())
    except Exception:
        pass
    return ""


def update_yt_dlp() -> tuple[bool, str]:
    """更新 yt-dlp 到最新版本"""
    config = load_config()
    proxy = config.get("network", {}).get("proxy", "")
    
    env = os.environ.copy()
    if proxy:
        env["HTTP_PROXY"] = proxy
        env["HTTPS_PROXY"] = proxy
    
    try:
        result = subprocess.run(
            ["pip", "install", "--upgrade", "yt-dlp"],
            capture_output=True,
            text=True,
            timeout=120,
            env=env,
        )
        if result.returncode == 0:
            import importlib
            import sys
            if "yt_dlp" in sys.modules:
                importlib.reload(sys.modules["yt_dlp"])
            return True, "yt-dlp 更新成功"
        else:
            return False, f"更新失败: {result.stderr.strip()}"
    except Exception as e:
        return False, f"更新出错: {str(e)}"


def build_download_args(
    url: str,
    output_path: Optional[str] = None,
    filename: Optional[str] = None,
    network: Optional[NetworkConfig] = None,
    download: Optional[DownloadConfig] = None,
    filesystem: Optional[FilesystemConfig] = None,
    format: Optional[FormatConfig] = None,
    subtitle: Optional[SubtitleConfig] = None,
    post_processing: Optional[PostProcessingConfig] = None,
    sponsorblock: Optional[SponsorBlockConfig] = None,
    workarounds: Optional[WorkaroundsConfig] = None,
    video_selection: Optional[VideoSelectionConfig] = None,
    authentication: Optional[AuthenticationConfig] = None,
    extractor: Optional[ExtractorConfig] = None,
    general: Optional[GeneralConfig] = None,
    verbosity: Optional[VerbosityConfig] = None,
    extra_args: Optional[str] = None,
) -> list[str]:
    """构建 yt-dlp 下载命令参数"""
    config = load_config()
    yt_dlp = _get_yt_dlp_path()
    ffmpeg_path = _get_ffmpeg_path()
    out_path = output_path or config.get("default_output_path", "/downloads")

    os.makedirs(out_path, exist_ok=True)

    args = [yt_dlp, "--ffmpeg-location", ffmpeg_path]

    if general:
        if general.ignore_errors:
            args.append("-i")
        if general.abort_on_error:
            args.append("--abort-on-error")
        if general.flat_playlist:
            args.append("--flat-playlist")
        if general.live_from_start:
            args.append("--live-from-start")
        if general.wait_for_video:
            args.extend(["--wait-for-video", general.wait_for_video])
        if general.mark_watched:
            args.append("--mark-watched")
        if general.ignore_config:
            args.append("--ignore-config")
        if general.compat_options:
            args.extend(["--compat-options", general.compat_options])
        if general.color:
            args.extend(["--color", general.color])

    if video_selection and video_selection.no_playlist:
        args.append("--no-playlist")
    elif video_selection and video_selection.yes_playlist:
        args.append("--yes-playlist")

    if filename:
        output_template = os.path.join(out_path, filename)
    elif filesystem and filesystem.output_template:
        output_template = os.path.join(out_path, filesystem.output_template)
    else:
        output_template = os.path.join(out_path, "%(title)s.%(ext)s")
    args.extend(["-o", output_template])

    if network:
        if network.proxy:
            args.extend(["--proxy", network.proxy])
        if network.socket_timeout:
            args.extend(["--socket-timeout", str(network.socket_timeout)])
        if network.source_address:
            args.extend(["--source-address", network.source_address])
        if network.impersonate:
            args.extend(["--impersonate", network.impersonate])
        if network.force_ipv4:
            args.append("-4")
        if network.force_ipv6:
            args.append("-6")
        if network.geo_verification_proxy:
            args.extend(["--geo-verification-proxy", network.geo_verification_proxy])
        if network.xff:
            args.extend(["--xff", network.xff])
        if network.enable_file_urls:
            args.append("--enable-file-urls")

    if download:
        if download.concurrent_fragments:
            args.extend(["-N", str(download.concurrent_fragments)])
        if download.limit_rate:
            args.extend(["-r", download.limit_rate])
        if download.retries:
            args.extend(["-R", str(download.retries)])
        if download.fragment_retries:
            args.extend(["--fragment-retries", str(download.fragment_retries)])
        if download.file_access_retries:
            args.extend(["--file-access-retries", str(download.file_access_retries)])
        if download.retry_sleep:
            args.extend(["--retry-sleep", download.retry_sleep])
        if download.http_chunk_size:
            args.extend(["--http-chunk-size", download.http_chunk_size])
        if download.throttled_rate:
            args.extend(["--throttled-rate", download.throttled_rate])
        if download.buffer_size:
            args.extend(["--buffer-size", str(download.buffer_size)])
        if not download.resize_buffer:
            args.append("--no-resize-buffer")
        if download.keep_fragments:
            args.append("--keep-fragments")
        if download.abort_on_unavailable_fragments:
            args.append("--abort-on-unavailable-fragments")
        elif not download.skip_unavailable_fragments:
            args.append("--abort-on-unavailable-fragments")
        if download.hls_use_mpegts:
            args.append("--hls-use-mpegts")
        if download.download_sections:
            args.extend(["--download-sections", download.download_sections])
        if download.downloader:
            args.extend(["--downloader", download.downloader])
        if download.downloader_args:
            args.extend(["--downloader-args", download.downloader_args])

    if filesystem:
        if filesystem.output_na_placeholder:
            args.extend(["--output-na-placeholder", filesystem.output_na_placeholder])
        if filesystem.restrict_filenames:
            args.append("--restrict-filenames")
        if filesystem.windows_filenames:
            args.append("--windows-filenames")
        if filesystem.trim_filenames:
            args.extend(["--trim-filenames", str(filesystem.trim_filenames)])
        if filesystem.no_overwrites:
            args.append("-w")
        if filesystem.force_overwrites:
            args.append("--force-overwrites")
        if not filesystem.continue_download:
            args.append("--no-continue")
        if not filesystem.part_files:
            args.append("--no-part")
        if filesystem.mtime:
            args.append("--mtime")
        if filesystem.write_description:
            args.append("--write-description")
        if filesystem.write_info_json:
            args.append("--write-info-json")
        if not filesystem.write_playlist_metafiles:
            args.append("--no-write-playlist-metafiles")
        if filesystem.write_comments:
            args.append("--write-comments")
        if not filesystem.clean_info_json:
            args.append("--no-clean-info-json")
        if filesystem.load_info_json:
            args.extend(["--load-info-json", filesystem.load_info_json])
        if filesystem.write_thumbnail:
            args.append("--write-thumbnail")
        if filesystem.write_all_thumbnails:
            args.append("--write-all-thumbnails")
        if filesystem.write_link:
            args.append("--write-link")
        if filesystem.write_url_link:
            args.append("--write-url-link")
        if filesystem.write_webloc_link:
            args.append("--write-webloc-link")
        if filesystem.write_desktop_link:
            args.append("--write-desktop-link")
        if filesystem.cache_dir:
            args.extend(["--cache-dir", filesystem.cache_dir])

    if format:
        if format.format and format.format.lower() != 'best':
            args.extend(["-f", format.format])
        if format.format_sort:
            args.extend(["-S", format.format_sort])
        if format.format_sort_reset:
            args.append("--format-sort-reset")
        if format.format_sort_force:
            args.append("--format-sort-force")
        if format.merge_output_format:
            args.extend(["--merge-output-format", format.merge_output_format])
        if format.prefer_free_formats:
            args.append("--prefer-free-formats")
        if format.video_multistreams:
            args.append("--video-multistreams")
        if format.audio_multistreams:
            args.append("--audio-multistreams")
        if format.check_formats:
            args.append("--check-formats")
        if format.check_all_formats:
            args.append("--check-all-formats")

    if subtitle:
        if subtitle.write_subs:
            args.append("--write-subs")
        if subtitle.write_auto_subs:
            args.append("--write-auto-subs")
        if subtitle.sub_format:
            args.extend(["--sub-format", subtitle.sub_format])
        if subtitle.sub_langs:
            args.extend(["--sub-langs", subtitle.sub_langs])

    if post_processing:
        if post_processing.extract_audio:
            args.append("-x")
            if post_processing.audio_format:
                args.extend(["--audio-format", post_processing.audio_format])
            if post_processing.audio_quality:
                args.extend(["--audio-quality", post_processing.audio_quality])
        if post_processing.remux_video:
            args.extend(["--remux-video", post_processing.remux_video])
        if post_processing.recode_video:
            args.extend(["--recode-video", post_processing.recode_video])
        if post_processing.keep_video:
            args.append("-k")
        if not post_processing.post_overwrites:
            args.append("--no-post-overwrites")
        if post_processing.embed_subs:
            args.append("--embed-subs")
        if post_processing.embed_thumbnail:
            args.append("--embed-thumbnail")
        if post_processing.embed_metadata:
            args.append("--embed-metadata")
        if post_processing.embed_chapters:
            args.append("--embed-chapters")
        if post_processing.embed_info_json:
            args.append("--embed-info-json")
        if post_processing.xattrs:
            args.append("--xattrs")
        if post_processing.concat_playlist:
            args.extend(["--concat-playlist", post_processing.concat_playlist])
        if post_processing.fixup:
            args.extend(["--fixup", post_processing.fixup])
        if post_processing.split_chapters:
            args.append("--split-chapters")
        if post_processing.remove_chapters:
            args.extend(["--remove-chapters", post_processing.remove_chapters])
        if post_processing.force_keyframes_at_cuts:
            args.append("--force-keyframes-at-cuts")
        if post_processing.exec:
            args.extend(["--exec", post_processing.exec])
        if post_processing.convert_subs:
            args.extend(["--convert-subs", post_processing.convert_subs])
        if post_processing.convert_thumbnails:
            args.extend(["--convert-thumbnails", post_processing.convert_thumbnails])
        if post_processing.postprocessor_args:
            args.extend(["--postprocessor-args", post_processing.postprocessor_args])
        if post_processing.parse_metadata:
            args.extend(["--parse-metadata", post_processing.parse_metadata])
        if post_processing.replace_in_metadata:
            args.extend(["--replace-in-metadata", post_processing.replace_in_metadata])

    if sponsorblock and sponsorblock.enabled:
        if sponsorblock.mark:
            args.extend(["--sponsorblock-mark", sponsorblock.mark])
        if sponsorblock.remove:
            args.extend(["--sponsorblock-remove", sponsorblock.remove])
        if sponsorblock.chapter_title:
            args.extend(["--sponsorblock-chapter-title", sponsorblock.chapter_title])
        if sponsorblock.api_url:
            args.extend(["--sponsorblock-api", sponsorblock.api_url])

    if workarounds:
        if workarounds.sleep_requests:
            args.extend(["--sleep-requests", str(workarounds.sleep_requests)])
        if workarounds.sleep_interval:
            args.extend(["--sleep-interval", str(workarounds.sleep_interval)])
        if workarounds.max_sleep_interval:
            args.extend(["--max-sleep-interval", str(workarounds.max_sleep_interval)])
        if workarounds.sleep_subtitles:
            args.extend(["--sleep-subtitles", str(workarounds.sleep_subtitles)])
        if workarounds.add_headers:
            args.extend(["--add-headers", workarounds.add_headers])
        if workarounds.encoding:
            args.extend(["--encoding", workarounds.encoding])
        if workarounds.legacy_server_connect:
            args.append("--legacy-server-connect")
        if workarounds.no_check_certificates:
            args.append("--no-check-certificates")
        if workarounds.prefer_insecure:
            args.append("--prefer-insecure")
        if workarounds.bidi_workaround:
            args.append("--bidi-workaround")

    if video_selection:
        if video_selection.playlist_items:
            args.extend(["-I", video_selection.playlist_items])
        if video_selection.min_filesize:
            args.extend(["--min-filesize", video_selection.min_filesize])
        if video_selection.max_filesize:
            args.extend(["--max-filesize", video_selection.max_filesize])
        if video_selection.match_filters:
            args.extend(["--match-filters", video_selection.match_filters])
        if video_selection.break_match_filters:
            args.extend(["--break-match-filters", video_selection.break_match_filters])
        if video_selection.age_limit:
            args.extend(["--age-limit", str(video_selection.age_limit)])
        if video_selection.max_downloads:
            args.extend(["--max-downloads", str(video_selection.max_downloads)])
        if video_selection.download_archive:
            args.extend(["--download-archive", video_selection.download_archive])
        if video_selection.break_on_existing:
            args.append("--break-on-existing")
        if video_selection.break_per_input:
            args.append("--break-per-input")
        if video_selection.skip_playlist_after_errors:
            args.extend(["--skip-playlist-after-errors", str(video_selection.skip_playlist_after_errors)])
        if video_selection.date:
            args.extend(["--date", video_selection.date])
        if video_selection.date_before:
            args.extend(["--datebefore", video_selection.date_before])
        if video_selection.date_after:
            args.extend(["--dateafter", video_selection.date_after])
        if video_selection.playlist_random:
            args.append("--playlist-random")
        if video_selection.lazy_playlist:
            args.append("--lazy-playlist")

    if authentication:
        if authentication.username:
            args.extend(["-u", authentication.username])
        if authentication.password:
            args.extend(["-p", authentication.password])
        if authentication.twofactor:
            args.extend(["-2", authentication.twofactor])
        if authentication.netrc:
            args.append("-n")
        if authentication.netrc_location:
            args.extend(["--netrc-location", authentication.netrc_location])
        if authentication.netrc_cmd:
            args.extend(["--netrc-cmd", authentication.netrc_cmd])
        if authentication.video_password:
            args.extend(["--video-password", authentication.video_password])
        if authentication.cookies_file:
            args.extend(["--cookies", authentication.cookies_file])
        if authentication.cookies_from_browser:
            args.extend(["--cookies-from-browser", authentication.cookies_from_browser])
        if authentication.ap_mso:
            args.extend(["--ap-mso", authentication.ap_mso])
        if authentication.ap_username:
            args.extend(["--ap-username", authentication.ap_username])
        if authentication.ap_password:
            args.extend(["--ap-password", authentication.ap_password])
        if authentication.client_certificate:
            args.extend(["--client-certificate", authentication.client_certificate])
        if authentication.client_certificate_key:
            args.extend(["--client-certificate-key", authentication.client_certificate_key])
        if authentication.client_certificate_password:
            args.extend(["--client-certificate-password", authentication.client_certificate_password])

    if extractor:
        if extractor.extractor_retries:
            args.extend(["--extractor-retries", str(extractor.extractor_retries)])
        if not extractor.allow_dynamic_mpd:
            args.append("--ignore-dynamic-mpd")
        if extractor.hls_split_discontinuity:
            args.append("--hls-split-discontinuity")
        if extractor.extractor_args:
            args.extend(["--extractor-args", extractor.extractor_args])

    if verbosity:
        if verbosity.quiet:
            args.append("-q")
        if verbosity.verbose:
            args.append("-v")
        if verbosity.no_warnings:
            args.append("--no-warnings")
        if verbosity.simulate:
            args.append("-s")
        if verbosity.ignore_no_formats_error:
            args.append("--ignore-no-formats-error")
        if verbosity.skip_download:
            args.append("--skip-download")
        if verbosity.print_json:
            args.append("-j")
        if verbosity.dump_single_json:
            args.append("-J")
        if verbosity.force_write_archive:
            args.append("--force-write-archive")
        if not verbosity.newline:
            args.append("--no-newline")
        if verbosity.no_progress:
            args.append("--no-progress")
        if not verbosity.progress:
            args.append("--no-progress")
        if verbosity.console_title:
            args.append("--console-title")
        if verbosity.print_traffic:
            args.append("--print-traffic")
        if verbosity.dump_pages:
            args.append("--dump-pages")
        if verbosity.write_pages:
            args.append("--write-pages")
        if verbosity.progress_template:
            args.extend(["--progress-template", verbosity.progress_template])
        if verbosity.progress_delta:
            args.extend(["--progress-delta", str(verbosity.progress_delta)])

    args.extend(["--newline", "--progress", "--remote-components", "ejs:github"])

    if extra_args:
        import shlex
        args.extend(shlex.split(extra_args))

    args.append(url)
    return args


def parse_progress(line: str) -> dict[str, Any]:
    """解析 yt-dlp 进度输出行"""
    result: dict[str, Any] = {}

    progress_match = re.search(
        r"\[download\]\s+([\d.]+)%\s+of\s+~?([\d.]+\w+)\s+at\s+([\d.]+\w+/s)\s+ETA\s+([\d:]+)",
        line,
    )
    if progress_match:
        result["progress"] = float(progress_match.group(1))
        result["total_size"] = progress_match.group(2)
        result["speed"] = progress_match.group(3)
        result["eta"] = progress_match.group(4)
        return result

    title_match = re.search(r"\[info\]\s+(.+)$", line)
    if title_match:
        result["title"] = title_match.group(1).strip()
        return result

    if "[download]" in line and "100%" in line:
        result["progress"] = 100.0
        return result

    dest_match = re.search(r"\[Merger\]\s+Merging formats into \"(.+)\"", line)
    if dest_match:
        result["output_file"] = dest_match.group(1)
        return result

    dest_match = re.search(r"\[download\]\s+Destination:\s+(.+)", line)
    if dest_match:
        result["output_file"] = dest_match.group(1).strip()
        return result

    return result