import { useState, useEffect } from 'react'

interface DisplayInfo {
  id: number
  label: string
  isPrimary: boolean
}

interface Props {
  selectedId: number | null
  onChange: (id: number, label: string) => void
  disabled?: boolean
}

export default function MonitorSelector({ selectedId, onChange, disabled }: Props) {
  const [monitors, setMonitors] = useState<DisplayInfo[] | null>(null)

  useEffect(() => {
    window.snapscreen.listMonitors().then(setMonitors)
  }, [])

  if (monitors === null) {
    return <span className="text-muted text-sm">Loading monitors...</span>
  }

  if (monitors.length === 0) {
    return <span className="text-muted text-sm">No displays found</span>
  }

  return (
    <select
      aria-label="Recording monitor"
      value={selectedId ?? ''}
      onChange={(e) => {
        const id = Number(e.target.value)
        const monitor = monitors.find(m => m.id === id)
        if (monitor) onChange(id, monitor.label)
      }}
      disabled={disabled}
      className="w-full h-8 px-2 text-base border border-border rounded-md bg-surface
                 focus:border-primary focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <option value="">Select a monitor...</option>
      {monitors.map((m) => (
        <option key={m.id} value={m.id}>{m.label}</option>
      ))}
    </select>
  )
}
