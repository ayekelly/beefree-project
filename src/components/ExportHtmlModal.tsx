import { useCallback, useEffect, useRef, useState } from 'react'
import './ExportHtmlModal.css'

interface ExportHtmlModalProps {
  open: boolean
  html: string
  error: string | null
  onClose: () => void
}

export default function ExportHtmlModal({ open, html, error, onClose }: ExportHtmlModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      setCopied(false)
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const handleCopy = useCallback(async () => {
    if (!html) return
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [html])

  const handleDownload = useCallback(() => {
    if (!html) return
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'email.html'
    anchor.click()
    URL.revokeObjectURL(url)
  }, [html])

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === dialogRef.current) {
        onClose()
      }
    },
    [onClose],
  )

  return (
    <dialog
      ref={dialogRef}
      className="export-modal"
      aria-labelledby="export-modal-title"
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      <div className="export-modal__panel">
        <header className="export-modal__header">
          <h2 id="export-modal-title" className="export-modal__title">
            Export HTML
          </h2>
          <button
            type="button"
            className="export-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="export-modal__body">
          {error ? (
            <p className="export-modal__error" role="alert">
              {error}
            </p>
          ) : (
            <textarea
              className="export-modal__code"
              readOnly
              value={html}
              aria-label="Exported HTML"
            />
          )}
        </div>

        <footer className="export-modal__footer">
          <button type="button" className="export-modal__btn export-modal__btn--secondary" onClick={onClose}>
            Close
          </button>
          {!error && (
            <>
              <button
                type="button"
                className="export-modal__btn export-modal__btn--secondary"
                onClick={handleCopy}
              >
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
              <button
                type="button"
                className="export-modal__btn export-modal__btn--primary"
                onClick={handleDownload}
              >
                Download HTML
              </button>
            </>
          )}
        </footer>
      </div>
    </dialog>
  )
}
