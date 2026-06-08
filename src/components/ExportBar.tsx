import './ExportBar.css'

interface ExportBarProps {
  onExport: () => void
  exporting?: boolean
}

export default function ExportBar({ onExport, exporting = false }: ExportBarProps) {
  return (
    <header className="export-bar">
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
