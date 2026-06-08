import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCREENSHOT_PATH = join(__dirname, '..', 'beefree-inspect-screenshot.png')

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 60000 })

    // Wait for Beefree iframe to appear (auth + SDK load)
    const iframeHandle = await page.waitForSelector('iframe', { timeout: 90000 })
    const frame = await iframeHandle.contentFrame()
    if (!frame) throw new Error('Could not access iframe content')

    // Wait for sidebar tab labels inside iframe
    await frame.waitForSelector('.tabs__tablabel--cs, .tabs__tablabels--cs', { timeout: 90000 })

    const results = await frame.evaluate(() => {
      const stylesheets = [...document.styleSheets]
      const customCssLinks = [...document.querySelectorAll('link[rel="stylesheet"]')]
        .map((link) => link.href)
        .filter((href) => href.includes('custom.css'))

      const tabLabel = document.querySelector('.tabs__tablabel--cs')
      const tabLabels = document.querySelector('.tabs__tablabels--cs')

      const tabLabelStyles = tabLabel ? getComputedStyle(tabLabel) : null
      const tabLabelsStyles = tabLabels ? getComputedStyle(tabLabels) : null

      return {
        customCssLinks,
        stylesheetCount: stylesheets.length,
        tabLabelCount: document.querySelectorAll('.tabs__tablabel--cs').length,
        tabLabelWidth: tabLabelStyles?.width ?? null,
        tabLabelHeight: tabLabelStyles?.height ?? null,
        tabLabelsFlexDirection: tabLabelsStyles?.flexDirection ?? null,
        bodyClass: document.body.className,
        hasBeeCs: document.body.classList.contains('bee--cs'),
      }
    })

    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true })

    const customCssLoaded = results.customCssLinks.some((href) => /custom\.css\?v=\d+/.test(href))
    const latestVersion = results.customCssLinks
      .map((href) => href.match(/custom\.css\?v=(\d+)/)?.[1])
      .filter(Boolean)
      .pop()

    const widthOk = results.tabLabelWidth === '70px'
    const heightOk = results.tabLabelHeight === '84px'
    const flexOk = results.tabLabelsFlexDirection === 'column'
    const applied = customCssLoaded && widthOk && heightOk && flexOk

    console.log(JSON.stringify({
      customCssLinks: results.customCssLinks,
      customCssLoaded,
      latestVersion,
      tabLabelCount: results.tabLabelCount,
      tabLabelWidth: results.tabLabelWidth,
      tabLabelHeight: results.tabLabelHeight,
      tabLabelsFlexDirection: results.tabLabelsFlexDirection,
      widthOk,
      heightOk,
      flexOk,
      bodyClass: results.bodyClass,
      hasBeeCs: results.hasBeeCs,
      sidebarStylingApplied: applied,
      screenshot: SCREENSHOT_PATH,
    }, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
