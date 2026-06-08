import type { IEntityContentJson } from '@beefree.io/react-email-builder'
import { CONTENT_AREA_ALIGN, CONTENT_AREA_WIDTH } from './settingsConfig'

export const BLANK_TEMPLATE: IEntityContentJson = {
  comments: {},
  page: {
    body: {
      type: 'mailup-bee-page-properties',
      webFonts: [],
      container: {
        style: {
          'background-color': '#FFFFFF',
        },
      },
      content: {
        computedStyle: {
          align: CONTENT_AREA_ALIGN,
          linkColor: '#0068A5',
          messageBackgroundColor: 'transparent',
          messageWidth: CONTENT_AREA_WIDTH,
        },
        style: {
          color: '#000000',
          'font-family': 'Arial, Helvetica, sans-serif',
        },
      },
    },
    description: '',
    rows: [],
    template: {
      name: 'template-base',
      type: 'basic',
      version: '2.0.0',
    },
    title: '',
  },
}

export function ensureContentAreaAlign(page: IEntityContentJson['page']): boolean {
  const computedStyle = page.body?.content?.computedStyle
  if (!computedStyle) return false
  if (computedStyle.align === CONTENT_AREA_ALIGN) return false
  computedStyle.align = CONTENT_AREA_ALIGN
  return true
}
