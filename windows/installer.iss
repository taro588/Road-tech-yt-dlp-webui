#define AppName "yt-dlp WebUI"
#define AppVersion "1.0.0"
#define AppPublisher "taro588"
#define AppExeName "yt-dlp-webui.exe"

[Setup]
AppId={{D6DDF2B8-9C8C-4B17-A1CE-8E8C9B3C3E1F}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={autopf}\yt-dlp WebUI
DefaultGroupName=yt-dlp WebUI
OutputDir=installer
OutputBaseFilename=yt-dlp-webui-setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayName=yt-dlp WebUI
CloseApplications=yes
RestartApplications=no

[Files]
Source: "dist\yt-dlp-webui\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\yt-dlp WebUI"; Filename: "{app}\{#AppExeName}"
Name: "{autodesktop}\yt-dlp WebUI"; Filename: "{app}\{#AppExeName}"

[Run]
Filename: "{app}\{#AppExeName}"; Description: "启动 yt-dlp WebUI"; Flags: nowait postinstall skipifsilent
