import type { IBeeConfig } from '@beefree.io/react-email-builder'

export const CONTENT_AREA_WIDTH = '660px'
export const CONTENT_AREA_ALIGN = 'center'

export const contentDefaults: NonNullable<IBeeConfig['contentDefaults']> = {
  general: {
    contentAreaWidth: CONTENT_AREA_WIDTH,
  },
}

export const advancedPermissions: NonNullable<IBeeConfig['advancedPermissions']> = {
  settings: {
    contentAreaWidth: {
      show: false,
      locked: true,
    },
    contentAreaAlign: {
      show: false,
      locked: true,
    },
  },
}
