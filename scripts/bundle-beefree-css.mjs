import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const beefreeDir = join(root, 'public', 'beefree')

const sections = [
  { label: 'tokens.css', file: 'tokens.css' },
  { label: 'stage-toolbar.css', file: 'stage-toolbar.css' },
  { label: 'sidebar.css', file: 'sidebar.css' },
  { label: 'tab-icons.css', file: 'tab-icons.css' },
  { label: 'block-icons.css', file: 'block-icons.css' },
]

const bundled = [
  '/* Bundled for Beefree iframe — do not @import (blocked by ORB cross-origin). */',
  '/* Source files: public/beefree/{tokens,stage-toolbar,sidebar,tab-icons,block-icons}.css — run: npm run beefree:css */',
  '',
  ...sections.flatMap(({ label, file }) => [
    `/* ── ${label} ── */`,
    readFileSync(join(beefreeDir, file), 'utf8').trim(),
    '',
  ]),
].join('\n')

writeFileSync(join(beefreeDir, 'custom.css'), bundled)

console.log('Bundled public/beefree/custom.css')
