import { useState, useEffect, useCallback } from 'react'

interface SnapScreenSettings {
  selectedDisplayId: number | null
  selectedDisplayLabel: string
  hotkeyAccelerator: string
  outputFolder: string
  filenameDateFormat: string
  audioSource: 'system' | 'mic' | 'both' | 'none'
  launchAtStartup: boolean
  showNotificationOnSave: boolean
  isFirstRun: boolean
  appVersion: string
}

interface SnapScreenAPI {
  getSettings: () => Promise<SnapScreenSettings>
  setSetting: (key: string, value: unknown) => Promise<{ success: boolean; error?: string }>
  listMonitors: () => Promise<unknown[]>
  openFolderDialog: () => Promise<string | null>
  openFolder: (path: string) => Promise<void>
  getRecordingState: () => Promise<{ isRecording: boolean }>
  validateHotkey: (accelerator: string) => Promise<{ valid: boolean }>
  getAppVersion: () => Promise<string>
}

declare global {
  interface Window {
    snapscreen: SnapScreenAPI
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<SnapScreenSettings | null>(null)

  useEffect(() => {
    window.snapscreen.getSettings().then(setSettings)
  }, [])

  const updateSetting = useCallback(async <K extends keyof SnapScreenSettings>(
    key: K,
    value: SnapScreenSettings[K]
  ) => {
    const result = await window.snapscreen.setSetting(key, value)
    if (result.success) {
      setSettings(prev => prev ? { ...prev, [key]: value } : prev)
    }
    return result
  }, [])

  return { settings, setSetting: updateSetting }
}
