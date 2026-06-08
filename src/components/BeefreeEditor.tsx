import { useEffect, useState } from 'react'
import {
  Builder,
  useBuilder,
  type IEntityContentJson,
  type IToken,
  type IBeeConfig,
} from '@beefree.io/react-email-builder'
import { getCustomCssUrl } from '../beefree/customCss'
import './BeefreeEditor.css'

const UID = 'demo-user'
const AUTH_URL = 'http://localhost:3001/proxy/bee-auth'

const BLANK_TEMPLATE: IEntityContentJson = {
  comments: {},
  page: {} as IEntityContentJson['page'],
}

const config: IBeeConfig = {
  uid: UID,
  container: 'beefree-sdk-builder',
  language: 'en-US',
  customCss: getCustomCssUrl(),
  sidebarPosition: 'left',
}

export default function BeefreeEditor() {
  const [token, setToken] = useState<IToken | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { id } = useBuilder(config)

  useEffect(() => {
    async function fetchToken() {
      try {
        const response = await fetch(AUTH_URL, {
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
      <Builder
        id={id}
        token={token}
        template={BLANK_TEMPLATE}
        height="100vh"
        onLoad={() => console.log('Builder is ready')}
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
  )
}
