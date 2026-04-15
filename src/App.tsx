import { useState, useEffect } from 'react'
import { useSettings } from './hooks/useSettings'
import MonitorSelector from './components/MonitorSelector'
import HotkeyInput from './components/HotkeyInput'
import FolderPicker from './components/FolderPicker'
import AudioSourceSelect from './components/AudioSourceSelect'
import ToggleRow from './components/ToggleRow'

function App(): JSX.Element {
  const { settings, setSetting } = useSettings()
  const [isRecording, setIsRecording] = useState(false)
  const [appVersion, setAppVersion] = useState('')

  // Poll recording state
  useEffect(() => {
    const poll = setInterval(async () => {
      const state = await window.snapscreen.getRecordingState()
      setIsRecording(state.isRecording)
    }, 500)
    return () => clearInterval(poll)
  }, [])

  // Get app version
  useEffect(() => {
    window.snapscreen.getAppVersion().then(setAppVersion)
  }, [])

  if (!settings) {
    return (
      <div className="h-full flex items-center justify-center bg-surface">
        <span className="text-muted text-sm">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="h-full bg-surface flex flex-col">
      {/* Title bar / drag region */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-border"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <h1 className="text-lg font-semibold">SnapScreen Settings</h1>
        <button
          onClick={() => window.close()}
          className="w-6 h-6 flex items-center justify-center rounded-sm
                     hover:bg-error hover:text-white text-muted"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          X
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Recording active banner */}
        {isRecording && (
          <div className="mb-4 px-4 py-2 rounded-md text-white text-sm font-medium"
               style={{ backgroundColor: 'var(--color-recording)' }}>
            ● Recording in progress
          </div>
        )}

        {/* Section: Recording */}
        <section>
          <label className="text-sm text-muted uppercase tracking-wider block pb-2">
            Recording Monitor
          </label>
          <MonitorSelector
            selectedId={settings.selectedDisplayId}
            onChange={(id, label) => {
              setSetting('selectedDisplayId', id)
              setSetting('selectedDisplayLabel', label)
            }}
            disabled={isRecording}
          />
        </section>

        <section className="mt-6">
          <label className="text-sm text-muted uppercase tracking-wider block pb-2">
            Recording Hotkey
          </label>
          <HotkeyInput
            value={settings.hotkeyAccelerator}
            onChange={(acc) => setSetting('hotkeyAccelerator', acc)}
            disabled={isRecording}
          />
        </section>

        {/* Divider */}
        <hr className="my-6 border-border" />

        {/* Section: Output */}
        <section>
          <label className="text-sm text-muted uppercase tracking-wider block pb-2">
            Output Folder
          </label>
          <FolderPicker
            value={settings.outputFolder}
            onChange={(path) => setSetting('outputFolder', path)}
          />
        </section>

        <section className="mt-6">
          <label className="text-sm text-muted uppercase tracking-wider block pb-2">
            Audio Source
          </label>
          <AudioSourceSelect
            value={settings.audioSource}
            onChange={(val) => setSetting('audioSource', val)}
          />
        </section>

        {/* Divider */}
        <hr className="my-6 border-border" />

        {/* Section: Toggles */}
        <section>
          <ToggleRow
            label="Launch at Windows Startup"
            value={settings.launchAtStartup}
            onChange={(val) => setSetting('launchAtStartup', val)}
          />
          <ToggleRow
            label="Show notification on save"
            value={settings.showNotificationOnSave}
            onChange={(val) => setSetting('showNotificationOnSave', val)}
          />
        </section>

        {/* Divider */}
        <hr className="my-6 border-border" />

        {/* Footer */}
        <section className="flex items-center justify-between">
          <span className="text-sm text-muted">SnapScreen v{appVersion}</span>
        </section>
      </div>
    </div>
  )
}

export default App
