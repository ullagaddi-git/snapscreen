import { Tray, Menu, app, nativeImage, MenuItemConstructorOptions } from 'electron'
import path from 'path'
import { openSettingsWindow, toggleRecording } from './main'
import { listMonitors } from './monitors'
import { getSettings, setSetting } from './settings'
import { isRecording } from './recorder'

let tray: Tray | null = null

function getAssetPath(filename: string): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', filename)
  }
  return path.join(__dirname, '../../assets', filename)
}

function buildContextMenu(): Menu {
  const monitors = listMonitors()
  const settings = getSettings()

  let monitorSubmenu: MenuItemConstructorOptions[]

  if (monitors.length === 0) {
    monitorSubmenu = [{ label: 'No monitors detected', enabled: false }]
  } else {
    monitorSubmenu = monitors.map((monitor) => ({
      label: monitor.label,
      type: 'radio' as const,
      checked: monitor.id === settings.selectedDisplayId,
      click: (): void => {
        setSetting('selectedDisplayId', monitor.id)
        setSetting('selectedDisplayLabel', monitor.label)
      }
    }))
  }

  const recording = isRecording()

  return Menu.buildFromTemplate([
    {
      label: recording ? '⏹ Stop Recording' : '⏺ Start Recording',
      click: (): void => {
        toggleRecording()
      }
    },
    { type: 'separator' },
    {
      label: 'Select Monitor',
      submenu: monitorSubmenu
    },
    {
      label: 'Settings',
      click: (): void => {
        openSettingsWindow()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit SnapScreen',
      click: (): void => {
        app.quit()
      }
    }
  ])
}

export function createTray(): Tray {
  const iconPath = getAssetPath('tray-idle.ico')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)
  tray.setToolTip('SnapScreen — Ready')

  // Rebuild menu on each click to re-enumerate monitors
  tray.on('right-click', () => {
    tray?.setContextMenu(buildContextMenu())
  })

  // Set initial menu
  tray.setContextMenu(buildContextMenu())
  return tray
}

export function setTrayState(state: 'idle' | 'recording' | 'error'): void {
  if (!tray) return

  switch (state) {
    case 'idle':
      tray.setImage(nativeImage.createFromPath(getAssetPath('tray-idle.ico')))
      tray.setToolTip('SnapScreen — Ready')
      break
    case 'recording':
      tray.setImage(nativeImage.createFromPath(getAssetPath('tray-recording.ico')))
      tray.setToolTip('SnapScreen — Recording in progress')
      break
    case 'error':
      tray.setImage(nativeImage.createFromPath(getAssetPath('tray-error.ico')))
      tray.setToolTip('SnapScreen — Error')
      break
  }
}

export function getTray(): Tray | null {
  return tray
}
