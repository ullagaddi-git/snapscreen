import { Tray, Menu, app, nativeImage } from 'electron'
import path from 'path'
import { openSettingsWindow } from './main'

let tray: Tray | null = null

function getAssetPath(filename: string): string {
  // In dev, assets are at the project root; in production, they're in resources
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', filename)
  }
  return path.join(__dirname, '../../assets', filename)
}

export function createTray(): Tray {
  const iconPath = getAssetPath('tray-idle.ico')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)
  tray.setToolTip('SnapScreen — Ready')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Select Monitor',
      submenu: [
        { label: 'No monitors detected', enabled: false }
      ]
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

  tray.setContextMenu(contextMenu)
  return tray
}

export function getTray(): Tray | null {
  return tray
}
