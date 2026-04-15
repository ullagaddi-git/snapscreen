interface Props {
  value: string
  onChange: (path: string) => void
}

export default function FolderPicker({ value, onChange }: Props) {
  const handleBrowse = async () => {
    const path = await window.snapscreen.openFolderDialog()
    if (path) onChange(path)
  }

  return (
    <div className="flex gap-2">
      <div
        className="flex-1 h-8 px-2 flex items-center text-base font-mono border border-border
                    rounded-md bg-surface-elevated overflow-hidden"
        title={value}
      >
        <span className="truncate">{value}</span>
      </div>
      <button
        onClick={handleBrowse}
        className="h-8 px-3 text-sm border border-border rounded-md
                   hover:bg-surface-elevated"
      >
        ···
      </button>
    </div>
  )
}
