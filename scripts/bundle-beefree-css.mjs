import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const beefreeDir = join(root, 'public', 'beefree')

const sections = [
  { label: 'tokens.css', file: 'tokens.css' },
  { label: 'sidebar.css', file: 'sidebar.css' },
]

const bundled = [
  '/* Bundled for Beefree iframe — do not @import (blocked by ORB cross-origin). */',
  '/* Source files: public/beefree/{tokens,sidebar}.css — run: npm run beefree:css */',
  '',
  ...sections.flatMap(({ label, file }) => [
    `/* ── ${label} ── */`,
    readFileSync(join(beefreeDir, file), 'utf8').trim(),
    '',
  ]),
].join('\n')

writeFileSync(join(beefreeDir, 'custom.css'), bundled)

console.log('Bundled public/beefree/custom.css')
