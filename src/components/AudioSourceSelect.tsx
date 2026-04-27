interface Props {
  value: 'system' | 'mic' | 'both' | 'none'
  onChange: (value: 'system' | 'mic' | 'both' | 'none') => void
}

const options = [
  { value: 'system', label: 'System Audio (videos, meetings)' },
  { value: 'mic', label: 'Microphone (your voice)' },
  { value: 'both', label: 'Both (microphone + system)' },
  { value: 'none', label: 'None (video only)' },
] as const

export default function AudioSourceSelect({ value, onChange }: Props) {
  return (
    <select
      aria-label="Audio source"
      value={value}
      onChange={(e) => onChange(e.target.value as Props['value'])}
      className="w-full h-8 px-2 text-base border border-border rounded-md bg-surface
                 focus:border-primary focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
