import { useCallback, useEffect, useState } from 'react'
import {
  Builder,
  useBuilder,
  type IEntityContentJson,
  type IToken,
  type IBeeConfig,
} from '@beefree.io/react-email-builder'
import { getCustomCssUrl } from '../beefree/customCss'
import { sidebarTranslations } from '../beefree/sidebarConfig'
import { topbarTranslations } from '../beefree/topbarConfig'
import { blockTranslations } from '../beefree/blockConfig'
import { contentDefaults, advancedPermissions } from '../beefree/settingsConfig'
import { BLANK_TEMPLATE, ensureContentAreaAlign } from '../beefree/defaultTemplate'
import { fetchExportHtml } from '../beefree/exportHtml'
import ExportBar from './ExportBar'
import ExportHtmlModal from './ExportHtmlModal'
import './BeefreeEditor.css'

const editorTranslations = {
  ...sidebarTranslations,
  ...topbarTranslations,
  ...blockTranslations,
}

const UID = 'demo-user'

const config: IBeeConfig = {
  uid: UID,
  container: 'beefree-sdk-builder',
  language: 'en-US',
  customCss: getCustomCssUrl(),
  translations: editorTranslations,
  sidebarPosition: 'left',
  contentDefaults,
  advancedPermissions,
  trackChanges: true,
}

export default function BeefreeEditor() {
  const [token, setToken] = useState<IToken | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [templateJson, setTemplateJson] = useState<IEntityContentJson>(BLANK_TEMPLATE)
  const [exportHtml, setExportHtml] = useState('')
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const { id, load } = useBuilder(config)

  const handleLoad = useCallback(
    (page: IEntityContentJson['page']) => {
      setTemplateJson({ page, comments: {} })
      if (ensureContentAreaAlign(page)) {
        void load({ page, comments: {} })
      }
    },
    [load],
  )

  const handleChange = useCallback((json: string) => {
    setTemplateJson(JSON.parse(json) as IEntityContentJson)
  }, [])

  const handleExport = useCallback(async () => {
    setExporting(true)
    setExportError(null)
    setExportHtml('')
    try {
      const html = await fetchExportHtml(templateJson)
      setExportHtml(html)
      setExportModalOpen(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export HTML'
      setExportError(message)
      setExportModalOpen(true)
    } finally {
      setExporting(false)
    }
  }, [templateJson])

  const handleCloseModal = useCallback(() => {
    setExportModalOpen(false)
    setExportError(null)
  }, [])

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch('/proxy/bee-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: UID }),
        })

        if (!response.ok) {
          throw new Error('Authentication failed. Check your .env credentials and proxy server.')
        }

        const tokenData = await response.json()

        if (!tokenData.access_token) {
          throw new Error('No access token returned from auth server.')
        }

        setToken(tokenData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to authenticate')
      }
    }

    fetchToken()
  }, [])

  if (error) {
    return (
      <div className="beefree-status beefree-status--error">
        <p>{error}</p>
        <p className="beefree-status__hint">
          Make sure <code>npm run proxy</code> is running and your credentials are set in{' '}
          <code>.env</code>.
        </p>
      </div>
    )
  }

  if (!token) {
    return <div className="beefree-status">Loading editor...</div>
  }

  return (
    <div className="beefree-editor">
      <ExportBar onExport={() => void handleExport()} exporting={exporting} />
      <div className="beefree-editor__builder">
        <Builder
          id={id}
          token={token}
          template={BLANK_TEMPLATE}
          height="100%"
          onLoad={handleLoad}
          onChange={handleChange}
          onSave={(pageJson, pageHtml) => {
            console.log('Saved!', { pageJson, pageHtml })
          }}
          onSaveAsTemplate={(pageJson) => {
            console.log('Template saved!', pageJson)
          }}
          onError={(err) => {
            console.error('Builder error:', err)
          }}
        />
      </div>
      <ExportHtmlModal
        open={exportModalOpen}
        html={exportHtml}
        error={exportError}
        onClose={handleCloseModal}
      />
    </div>
  )
}
