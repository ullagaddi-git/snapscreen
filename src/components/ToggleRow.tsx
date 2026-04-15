interface Props {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

export default function ToggleRow({ label, value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-base">{label}</label>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative w-9 h-5 rounded-full transition-colors"
        style={{
          backgroundColor: value ? 'var(--color-primary)' : 'var(--color-border)',
        }}
      >
        <span
          className="absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform"
          style={{
            left: '2px',
            transform: value ? 'translateX(16px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  )
}
