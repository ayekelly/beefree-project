import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'docs', 'screenshots')

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForSelector('iframe', { timeout: 120000 })
    await page.waitForTimeout(3000)

    await page.screenshot({
      path: join(OUT_DIR, 'editor-overview.png'),
      fullPage: false,
    })

    const exportBtn = page.locator('.export-bar__btn')
    await exportBtn.waitFor({ timeout: 30000 })
    await exportBtn.click()
    await page.waitForSelector('.export-modal[open], dialog.export-modal', { timeout: 30000 })
    await page.waitForTimeout(500)

    await page.screenshot({
      path: join(OUT_DIR, 'export-modal.png'),
      fullPage: false,
    })

    console.log('Saved screenshots to docs/screenshots/')
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
