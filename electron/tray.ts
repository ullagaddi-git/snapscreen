import { Tray, Menu, app, nativeImage, MenuItemConstructorOptions } from 'electron'
import path from 'path'
import { openSettingsWindow, toggleRecording, pauseRecordingFromUI, resumeRecordingFromUI } from './main'
import { openWidget, closeWidget, isWidgetOpen } from './widget'
import { listMonitors } from './monitors'
import { getSettings, setSetting } from './settings'
import { isRecording, getRecordingDuration, isRecordingPaused } from './recorder'

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
  const paused = isRecordingPaused()

  const recordingMenuItems: MenuItemConstructorOptions[] = []
  if (paused) {
    recordingMenuItems.push({
      label: '▶ Resume Recording',
      click: (): void => { resumeRecordingFromUI() }
    })
    recordingMenuItems.push({
      label: '⏹ Stop Recording',
      click: (): void => { toggleRecording() }
    })
  } else if (recording) {
    recordingMenuItems.push({
      label: '⏸ Pause Recording',
      click: (): void => { pauseRecordingFromUI() }
    })
    recordingMenuItems.push({
      label: '⏹ Stop Recording',
      click: (): void => { toggleRecording() }
    })
  } else {
    recordingMenuItems.push({
      label: '⏺ Start Recording',
      click: (): void => { toggleRecording() }
    })
  }

  return Menu.buildFromTemplate([
    ...recordingMenuItems,
    { type: 'separator' },
    {
      label: 'Select Monitor',
      submenu: monitorSubmenu
    },
    {
      label: isWidgetOpen() ? 'Hide Record Widget' : 'Show Record Widget',
      click: (): void => {
        if (isWidgetOpen()) {
          closeWidget()
        } else {
          openWidget()
        }
      }
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

let durationInterval: ReturnType<typeof setInterval> | null = null

export function setTrayState(state: 'idle' | 'recording' | 'error'): void {
  if (!tray) return

  // Clear any existing duration polling
  if (durationInterval) {
    clearInterval(durationInterval)
    durationInterval = null
  }

  switch (state) {
    case 'idle':
      tray.setImage(nativeImage.createFromPath(getAssetPath('tray-idle.ico')))
      tray.setToolTip('SnapScreen — Ready')
      break
    case 'recording':
      tray.setImage(nativeImage.createFromPath(getAssetPath('tray-recording.ico')))
      tray.setToolTip('SnapScreen — Recording: 00:00:00')
      // TASK-037: Update tooltip with elapsed time every second
      durationInterval = setInterval(() => {
        if (tray && isRecording()) {
          tray.setToolTip(`SnapScreen — Recording: ${getRecordingDuration()}`)
        }
      }, 1000)
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
