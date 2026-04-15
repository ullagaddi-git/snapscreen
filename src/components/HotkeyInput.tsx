import { useState, useRef } from 'react'

interface Props {
  value: string
  onChange: (accelerator: string) => void
  disabled?: boolean
}

function formatAccelerator(accelerator: string): string {
  return accelerator
    .replace('CommandOrControl', 'Ctrl')
    .replace('Super', 'Win')
}

function keyEventToAccelerator(e: React.KeyboardEvent): string | null {
  const parts: string[] = []
  if (e.ctrlKey) parts.push('CommandOrControl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  if (e.metaKey) parts.push('Super')

  const key = e.key
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return null

  if (key.length === 1) {
    parts.push(key.toUpperCase())
  } else if (key.startsWith('F') && key.length <= 3) {
    parts.push(key)
  } else {
    return null
  }

  if (parts.length < 2) return null
  return parts.join('+')
}

export default function HotkeyInput({ value, onChange, disabled }: Props) {
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (disabled) return
    setCapturing(true)
    setError(null)
    inputRef.current?.focus()
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (!capturing) return
    e.preventDefault()

    const accelerator = keyEventToAccelerator(e)
    if (!accelerator) return

    const result = await window.snapscreen.validateHotkey(accelerator)
    if (result.valid) {
      onChange(accelerator)
      setCapturing(false)
      setError(null)
      setWarning(result.conflict ? `May conflict with ${result.conflict}` : null)
    } else {
      setError(result.conflict || "This key combination can't be registered.")
      setWarning(null)
    }
  }

  const handleBlur = () => {
    setCapturing(false)
  }

  const handleReset = () => {
    onChange('CommandOrControl+Shift+R')
    setError(null)
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={capturing ? 'Press keys...' : formatAccelerator(value)}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={disabled}
          className="flex-1 h-8 px-2 text-base font-mono border border-border rounded-md
                     bg-surface-elevated cursor-pointer
                     focus:border-primary focus:outline-none
                     disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleReset}
          disabled={disabled}
          className="h-8 px-3 text-sm border border-border rounded-md
                     hover:bg-surface-elevated
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
      {warning && !error && <p className="text-warning text-xs mt-1">{warning}</p>}
    </div>
  )
}
