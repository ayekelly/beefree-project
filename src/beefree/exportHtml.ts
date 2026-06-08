import type { IEntityContentJson } from '@beefree.io/react-email-builder'

function parseHtmlResponse(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as {
      body?: { html?: string; result?: string } | string
    }
    const candidate =
      typeof parsed?.body === 'string'
        ? parsed.body
        : (parsed?.body?.html ?? parsed?.body?.result)
    if (typeof candidate === 'string') {
      return candidate
    }
  } catch {
    // Response is raw HTML
  }
  return raw
}

export async function fetchExportHtml(templateJson: IEntityContentJson): Promise<string> {
  const res = await fetch('/proxy/export/html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(templateJson),
  })

  if (!res.ok) {
    let message = 'Failed to export HTML'
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) message = data.error
    } catch {
      // Response was not JSON
    }
    throw new Error(message)
  }

  const raw = await res.text()
  return parseHtmlResponse(raw)
}
