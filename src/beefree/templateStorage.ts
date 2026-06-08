import type { IEntityContentJson } from '@beefree.io/react-email-builder'

const STORAGE_KEY = 'beefree:design:demo-user'

function isValidTemplate(value: unknown): value is IEntityContentJson {
  return (
    typeof value === 'object' &&
    value !== null &&
    'page' in value &&
    typeof (value as IEntityContentJson).page === 'object'
  )
}

export function loadSavedTemplate(): IEntityContentJson | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    return isValidTemplate(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveTemplate(json: IEntityContentJson): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
}

export function clearSavedTemplate(): void {
  localStorage.removeItem(STORAGE_KEY)
}
