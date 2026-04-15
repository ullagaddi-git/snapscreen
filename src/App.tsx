import { useSettings } from './hooks/useSettings'

function App(): JSX.Element {
  const { settings } = useSettings()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">SnapScreen Settings</h1>
      <div className="bg-primary text-white p-4 rounded-md">
        Tailwind + Design Tokens working
      </div>
      {settings ? (
        <div className="mt-4 text-sm">
          <p>Hotkey: <span className="font-mono">{settings.hotkeyAccelerator}</span></p>
          <p>Output: <span className="font-mono">{settings.outputFolder}</span></p>
          <p>Version: {settings.appVersion}</p>
        </div>
      ) : (
        <p className="text-muted mt-2 text-sm">Loading settings...</p>
      )}
    </div>
  )
}

export default App
