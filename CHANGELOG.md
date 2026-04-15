# Changelog

## v0.1.0 — MVP Release

### Features
- **Monitor selection** — Choose which display to record from the tray menu
- **Screen recording** — Capture your selected monitor as MP4 using FFmpeg (gdigrab)
- **Microphone audio** — Auto-detects and records from available microphone
- **Tray-only app** — No window on launch, lives silently in the system tray
- **Start/Stop from tray** — Right-click menu with Start/Stop Recording buttons
- **Global hotkey** — Ctrl+Alt+R (configurable) to toggle recording from any app
- **Settings panel** — Full UI for monitor, hotkey, output folder, audio, and toggles
- **Recording duration** — Tray tooltip shows elapsed time while recording
- **Custom filename pattern** — Configurable date format for output filenames
- **Windows notifications** — Notifies when recording is saved; click to open folder
- **First-run onboarding** — Welcome notification on first launch
- **Hotkey conflict detection** — Warns about conflicts with common apps
- **Error handling** — Graceful fallbacks for disconnected monitors, FFmpeg crashes, save failures
- **Accessibility** — Keyboard navigation, aria labels, focus indicators
- **NSIS installer** — Windows installer with custom install directory

### Known Limitations
- Not code-signed — Windows SmartScreen warning on first install
- System audio capture requires a virtual audio device (uses microphone by default)
- Global hotkey may be intercepted by HP Hotkey Support or similar software
- Windows 10 (21H2+) and Windows 11 only
