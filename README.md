# SnapScreen

Record the screen you mean to record. Nothing else.

SnapScreen is a lightweight Windows system tray utility that lets you pre-select which monitor to record, then start, pause, and stop recording with a global hotkey, tray menu, or floating widget. It sits silently in the system tray, requires no app window to operate, and saves recordings as MP4 files to a local folder.

No accounts. No cloud. No complexity.

## Download

**[➜ Download SnapScreen v0.3.0 for Windows](https://github.com/ullagaddi-git/snapscreen/releases/latest)**

Or grab a specific version from the [Releases page](https://github.com/ullagaddi-git/snapscreen/releases).

## Features

- **Monitor selection** — Choose which display to record from the tray menu. Your choice persists across restarts.
- **System audio recording** — Capture sound from videos, meetings, and music — not just the microphone. Uses Windows audio loopback (no third-party drivers needed).
- **Microphone, System, Both, or None** — Pick exactly what audio you want recorded.
- **Pause & Resume** — Pause a recording without stopping; resume into a new segment.
- **Floating record widget** — Optional control bar with Record / Pause / Resume / Stop buttons and a live duration timer.
- **Global hotkey** — Press Ctrl+Alt+R (configurable) from any app to start/stop recording.
- **Tray menu controls** — Start, pause, stop, and select monitor directly from the system tray.
- **Settings panel** — Configure hotkey, output folder, audio source, filename pattern, and startup behavior.
- **Windows notifications** — Get notified when recordings are saved. Click to open the folder.
- **Lightweight** — No app window during recording. Just a tray icon.

## Installation

1. Download `SnapScreen Setup x.x.x.exe` from the [latest release](https://github.com/ullagaddi-git/snapscreen/releases/latest)
2. Run the installer
3. SnapScreen starts automatically and appears in the system tray (bottom-right of taskbar)

**SmartScreen warning:** The app is not code-signed yet, so Windows may show a SmartScreen warning on first launch. Click **"More info"** then **"Run anyway"** to proceed.

## Usage

### Quick start

1. **Right-click the tray icon** (small monitor icon, bottom-right of your taskbar)
2. **Select Monitor** — Choose which display to record
3. **Start Recording** — Click it in the tray menu, or press your hotkey, or click the floating widget button
4. **Stop Recording** when done — recordings save to `C:\Users\<you>\Videos\SnapScreen\` by default

### Recording system audio (videos, meetings, music)

1. Right-click tray → **Settings**
2. Change **Audio Source** to **"System Audio (videos, meetings)"** — or **"Both"** if you also want your microphone
3. Start recording — anything playing through your speakers will be captured

### Floating record widget

If your global hotkey is intercepted by another app (e.g. some HP/Dell laptop hotkey utilities) or you just prefer a click target, use the floating widget:

1. Right-click tray → **Show Record Widget**
2. A small draggable control bar appears with Record / Pause / Resume / Stop buttons
3. Click to start, pause anytime, resume into a new segment, stop to save

## Settings

Right-click tray icon → **Settings** to configure:

| Setting | Default | Description |
|---------|---------|-------------|
| Recording Monitor | Primary display | Which monitor to capture |
| Recording Hotkey | Ctrl+Alt+R | Global keyboard shortcut |
| Output Folder | `Videos\SnapScreen` | Where MP4 files are saved |
| Audio Source | Microphone | Microphone / System Audio / Both / None |
| Filename Pattern | `YYYY-MM-DD_HHmmss` | Date format using dayjs tokens |
| Launch at Startup | On | Start with Windows |
| Show notification on save | On | Toast notification after each recording |

## How audio recording works

| Mode | What gets recorded | How |
|---|---|---|
| **Microphone** | Your voice via the mic | FFmpeg captures via DirectShow |
| **System Audio** | Speaker output (videos, meetings, music) | Electron `desktopCapturer` audio loopback → MediaRecorder → muxed with video |
| **Both** | Microphone + system audio mixed | FFmpeg amix combines both sources |
| **None** | No audio | Video-only recording |

## System Requirements

- Windows 10 (21H2 or later) or Windows 11
- ~150 MB disk space (plus space for recordings)
- A microphone if you want to record voice (any standard mic works)

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
- FFmpeg via `ffmpeg-static` (screen capture, encoding, muxing)
- Electron `desktopCapturer` (system audio loopback)
- electron-store (settings persistence)
- electron-builder (NSIS installer)
- dayjs (filename date formatting)

## Known Limitations

- **Not code-signed** — Windows SmartScreen warning on first install. Code signing certificate is on the roadmap.
- **Pause creates segments** — Each pause/resume cycle saves a separate file. Automatic merging is planned.
- **Global hotkey** — Some laptop OEM hotkey utilities (e.g. HP Hotkey Support) intercept common combinations like Ctrl+Shift+R. Use Ctrl+Alt+R, the tray menu, or the floating widget instead.

## Contributing

Issues and pull requests welcome. Please open an issue first for larger changes so we can discuss the approach.

## License

MIT
