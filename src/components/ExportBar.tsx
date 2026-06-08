import './ExportBar.css'

export type SaveStatus = 'idle' | 'saved' | 'autosaved'

interface ExportBarProps {
  onExport: () => void
  exporting?: boolean
  saveStatus?: SaveStatus
}

export default function ExportBar({
  onExport,
  exporting = false,
  saveStatus = 'idle',
}: ExportBarProps) {
  return (
    <header className="export-bar">
      <div className="export-bar__status" aria-live="polite">
        {saveStatus === 'saved' && 'Saved'}
        {saveStatus === 'autosaved' && 'Autosaved'}
      </div>
      <div className="export-bar__actions">
        <button
          type="button"
          className="export-bar__btn"
          onClick={onExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting…' : 'Export HTML'}
        </button>
      </div>
    </header>
  )
}
