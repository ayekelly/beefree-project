const CUSTOM_CSS_PATH = '/beefree/custom.css'

export function getCustomCssUrl(): string {
  return `${window.location.origin}${CUSTOM_CSS_PATH}?v=30`
}
