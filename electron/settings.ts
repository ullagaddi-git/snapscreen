import Store from 'electron-store'
import { app } from 'electron'
import path from 'path'

export interface SnapScreenSettings {
  // Monitor selection
  selectedDisplayId: number | null
  selectedDisplayLabel: string

  // Hotkey
  hotkeyAccelerator: string

  // Output
  outputFolder: string
  filenameDateFormat: string

  // Audio
  audioSource: 'system' | 'mic' | 'both' | 'none'

  // App behavior
  launchAtStartup: boolean
  showNotificationOnSave: boolean

  // Internal state (not user-facing)
  isFirstRun: boolean
  appVersion: string
}

const defaults: SnapScreenSettings = {
  selectedDisplayId: null,
  selectedDisplayLabel: 'Not selected',
  hotkeyAccelerator: 'CommandOrControl+Shift+R',
  outputFolder: path.join(app.getPath('videos'), 'SnapScreen'),
  filenameDateFormat: 'YYYY-MM-DD_HHmmss',
  audioSource: 'system',
  launchAtStartup: true,
  showNotificationOnSave: true,
  isFirstRun: true,
  appVersion: app.getVersion(),
}

const store = new Store<SnapScreenSettings>({ defaults })

export function getSettings(): SnapScreenSettings {
  return store.store
}

export function setSetting<K extends keyof SnapScreenSettings>(
  key: K,
  value: SnapScreenSettings[K]
): void {
  store.set(key, value)
}

export { store }
