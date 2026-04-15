# SnapScreen

Record the screen you mean to record. Nothing else.

SnapScreen is a lightweight Windows system tray utility that lets you pre-select which monitor to record, then start and stop recording with a global hotkey or tray menu. It sits silently in the system tray, requires no app window to operate, and saves recordings as MP4 files to a local folder.

No accounts. No cloud. No complexity.

## Features

- **Monitor selection** — Choose which display to record from the tray menu. Your choice persists across restarts.
- **Global hotkey** — Press Ctrl+Alt+R (configurable) from any app to start/stop recording.
- **Tray menu controls** — Start and stop recording directly from the system tray context menu.
- **Microphone audio** — Automatically detects and records from your microphone.
- **Settings panel** — Configure hotkey, output folder, audio source, and startup behavior.
- **Windows notifications** — Get notified when recordings are saved. Click to open the folder.
- **Lightweight** — No browser windows during recording. Just a tray icon.

## Installation

1. Download `SnapScreen Setup x.x.x.exe` from [Releases](../../releases)
2. Run the installer
3. SnapScreen starts automatically and appears in the system tray

**SmartScreen warning:** Since the app is not code-signed yet, Windows may show a SmartScreen warning on first launch. Click "More info" then "Run anyway" to proceed.

## Usage

1. **Right-click the tray icon** (small icon in the bottom-right of your taskbar)
2. **Select Monitor** — Choose which display to record
3. **Start Recording** — Click "Start Recording" in the tray menu, or press the configured hotkey
4. **Stop Recording** — Click "Stop Recording" or press the hotkey again
5. **Find your recording** — Saved to `C:\Users\<you>\Videos\SnapScreen\` by default

## Settings

Right-click tray icon > **Settings** to configure:

| Setting | Default | Description |
|---------|---------|-------------|
| Recording Monitor | Primary display | Which monitor to capture |
| Recording Hotkey | Ctrl+Alt+R | Global keyboard shortcut |
| Output Folder | `Videos\SnapScreen` | Where MP4 files are saved |
| Audio Source | System Audio | Microphone, system, both, or none |
| Launch at Startup | On | Start with Windows |
| Notifications | On | Show notification after each recording |

## System Requirements

- Windows 10 (21H2 or later) or Windows 11
- 100MB disk space (plus space for recordings)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build installer
npm run dist
```

## Tech Stack

- Electron + TypeScript + React
- electron-vite (build tooling)
- Tailwind CSS (design system)
- FFmpeg via ffmpeg-static (screen capture)
- electron-store (settings persistence)
- electron-builder (packaging)

## Known Limitations

- No code signing yet — Windows SmartScreen warning on first install
- System audio capture requires a virtual audio device (records microphone by default)
- Global hotkey may not work if intercepted by other software (use tray menu as fallback)

## License

MIT
