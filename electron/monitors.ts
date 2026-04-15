import { screen } from 'electron'

export interface DisplayInfo {
  id: number
  label: string
  isPrimary: boolean
  bounds: { x: number; y: number; width: number; height: number }
  scaleFactor: number
}

export function listMonitors(): DisplayInfo[] {
  const displays = screen.getAllDisplays()
  const primaryId = screen.getPrimaryDisplay().id

  return displays.map((display, index) => {
    const isPrimary = display.id === primaryId
    const { width, height } = display.bounds
    const label = `Display ${index + 1} (${width}x${height})${isPrimary ? ' — Primary' : ''}`

    return {
      id: display.id,
      label,
      isPrimary,
      bounds: display.bounds,
      scaleFactor: display.scaleFactor,
    }
  })
}
