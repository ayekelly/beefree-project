# Beefree SDK Email Builder — Integration Project

A React + Vite application that embeds the [Beefree SDK](https://docs.beefree.io/beefree-sdk) email builder with a heavily customized editor UI (inspired by Mailchimp), HTML export via the Content Services API, and edit-triggered design persistence.

This project was built as a hands-on integration exercise: authenticate securely, embed the official React wrapper, customize the builder experience, and wire up the core workflows a real product would need — save, export, and restore.

---

## Features

### Beefree SDK integration

- Uses the official [`@beefree.io/react-email-builder`](https://docs.beefree.io/beefree-sdk/quickstart-guides/react-no-code-email-builder) React wrapper (`Builder` + `useBuilder`)
- Server-side auth via a local Express proxy — client credentials never reach the browser
- Left sidebar layout, English locale, and a blank starter template with a fixed 660px centered content area (to match the new Mailchimp email builder's email size)

### UI customization

The editor is redesigned to feel more like Nuni (Mailchimp-inspired palette and layout) while retaining the native Beefree SDK topbar for Save, Preview, and other built-in actions.

Customization is split across two layers:

1. **SDK configuration** — translations, sidebar labels, block names, content defaults, and locked settings via typed config modules under `src/beefree/`
2. **Custom CSS** — modular stylesheets in `public/beefree/` bundled into a single `custom.css` file loaded by the SDK iframe

Styled areas include:

- Sidebar rail and panel (tabs, spacing, typography)
- Custom tab icons (Blocks, Rows, Styles)
- Block palette tiles and block icons
- Styles panel
- Stage toolbar (mobile/desktop toggle placement)

Design tokens (colors, spacing, sidebar dimensions) live in `public/beefree/tokens.css` and are referenced throughout the CSS modules.

### HTML export

A host-level **Export HTML** toolbar sits above the editor (separate from the SDK topbar). Clicking it:

1. Sends the current design JSON to the Beefree Content Services API via the proxy (`POST /v1/message/html`)
2. Opens a modal with the rendered HTML
3. Lets the user **copy to clipboard** or **download** as an `.html` file

Export uses the latest JSON tracked by `onChange`, not the SDK's `onSave` HTML output — this keeps export independent of the save flow and matches the [CS API export docs](https://docs.beefree.io/beefree-sdk/apis/content-services-api/export).

### Save and persistence

Designs persist across page refreshes using `localStorage`:

- **Explicit save** — Actions → Save in the SDK topbar writes JSON immediately and shows "Saved" in the topmost toolbar
- **Automatic save on edit** — `trackChanges: true` + debounced `onChange` (1.5s after editing stops) writes JSON and shows "Autosaved"
- **Restore on load** — saved JSON is passed back as the initial `template` when the editor mounts

This follows the [Tracking Message Changes](https://docs.beefree.io/beefree-sdk/getting-started/tracking-message-changes) guidance: persist when the user actually edits, rather than on a fixed timer. No backend required for this sample project.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React app (Vite, localhost:5173)                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ExportBar — Export HTML + save status              │  │
│  ├───────────────────────────────────────────────────┤  │
│  │  Beefree Builder (iframe)                           │  │
│  │  • custom.css (bundled from public/beefree/)       │  │
│  │  • SDK topbar (Save, Preview, Actions…)             │  │
│  └───────────────────────────────────────────────────┘  │
│         │ onChange / onSave          │ fetch            │
│         ▼                            ▼                  │
│  localStorage                  /proxy/*                 │
└─────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                          Express proxy (localhost:3001)
                          • POST /proxy/bee-auth → auth.getbee.io/loginV2
                          • POST /proxy/export/html → api.getbee.io/v1/message/html
```

| Layer | Role |
|-------|------|
| `src/components/BeefreeEditor.tsx` | Main integration — auth, Builder config, change tracking, save, export |
| `src/beefree/*.ts` | SDK config modules (sidebar, topbar, blocks, settings, template, storage, export) |
| `public/beefree/*.css` | Editor theming modules, bundled to `custom.css` |
| `proxy-server.js` | Keeps secrets server-side; proxies auth and CS API |
| `scripts/bundle-beefree-css.mjs` | Concatenates CSS modules (iframe cannot use `@import` cross-origin) |

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Beefree Developer Console](https://developers.beefree.io/) account with:
  - **Client ID** and **Client Secret** (for SDK auth)
  - **Content Services API key** (for HTML export)

### Setup

```bash
git clone <your-repo-url>
cd beefree-project
npm install
cp .env.example .env
```

Edit `.env`:

```env
BEE_CLIENT_ID=your-client-id
BEE_CLIENT_SECRET=your-client-secret
CS_API_TOKEN=your-cs-api-key
```

### Run locally

Start the proxy and dev server together:

```bash
npm run dev:all
```

Or in two terminals:

```bash
npm run proxy   # localhost:3001
npm run dev     # localhost:5173
```

Open [http://localhost:5173](http://localhost:5173).

After editing CSS under `public/beefree/`, rebuild the bundle:

```bash
npm run beefree:css
```

(`npm run dev` runs this automatically on startup.)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Bundle CSS, start proxy + Vite dev server |
| `npm run dev` | Bundle CSS and start Vite |
| `npm run proxy` | Start Express auth/export proxy |
| `npm run beefree:css` | Bundle `public/beefree/*.css` → `custom.css` |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

---

## Project structure

```
src/
├── components/
│   ├── BeefreeEditor.tsx    # SDK integration, save, export orchestration
│   ├── ExportBar.tsx        # Host toolbar above editor
│   └── ExportHtmlModal.tsx  # Copy / download exported HTML
├── beefree/
│   ├── blockConfig.ts       # Block display names
│   ├── customCss.ts         # custom.css URL helper
│   ├── defaultTemplate.ts   # Blank starter template
│   ├── exportHtml.ts        # CS API export client
│   ├── settingsConfig.ts    # Content defaults + locked settings
│   ├── sidebarConfig.ts     # Sidebar tab labels
│   ├── templateStorage.ts   # localStorage load/save
│   └── topbarConfig.ts      # Topbar label overrides
public/
├── beefree/                 # CSS modules + bundled custom.css
└── icons/tabs/              # Custom sidebar tab SVGs
proxy-server.js              # Auth + export proxy
scripts/
├── bundle-beefree-css.mjs   # CSS bundler
└── inspect-beefree-sidebar.mjs  # Playwright debug helper
```

---

## Key design decisions

**Host export bar vs. replacing the SDK topbar**  
The Beefree topbar (Save, Preview, Actions, etc.) is rendered inside the editor iframe. The SDK doesn't expose a supported way to inject custom buttons into that bar, so Export couldn't live there without unsupported DOM hacks. Decided to keep the SDK topbar intact and add a new, separate export bar for stability and speed.

**Content Services API for export**  
HTML is generated server-side via the CS API from the current JSON snapshot. This avoids depending on `onSave` HTML output and works at any point during editing.

**Debounced `onChange` over timer autosave**  
Beefree's tracking docs recommend saving on actual edits rather than fixed intervals. Debouncing `onChange` gives draft recovery without spurious writes when the user is idle.
I skipped Beefree's `autosave: 30` in favor of persisting 1.5s after the last edit via `onChange` + `trackChanges`. The goal was a smaller loss window and saves only when the design actually changes. Tradeoff: edits lost to a refresh within ~1.5s of the last change (without an explicit Save) won't be recovered + continuous editing also delays persistence until the user pauses.

**Modular CSS with a build step**  
Custom CSS is split into maintainable modules (tokens, sidebar, blocks, etc.) and bundled into one file because the SDK iframe loads styles cross-origin and cannot resolve `@import`.

**Fixed content area width**  
The content area is locked to 660px centered via `contentDefaults` and `advancedPermissions`, giving a consistent canvas without exposing width controls in the settings panel. We default emails to 660px in Mailchimp and I wanted this implementation to feel similar to our offering.

---

## Testing the main flows

1. **Edit and persist** — Add blocks, pause ~2s, see "Autosaved", hard-refresh — design should restore
2. **Explicit save** — Actions → Save, see "Saved", refresh — design should persist
3. **Export** — Click Export HTML, copy or download the result
4. **Reset** — Clear `beefree:design:demo-user` in browser devtools → Application → Local Storage, refresh — blank template loads

---

## References

- [Beefree SDK documentation](https://docs.beefree.io/beefree-sdk)
- [React quickstart](https://docs.beefree.io/beefree-sdk/quickstart-guides/react-no-code-email-builder)
- [Configuration parameters](https://docs.beefree.io/beefree-sdk/getting-started/readme/installation/configuration-parameters)
- [Tracking message changes](https://docs.beefree.io/beefree-sdk/getting-started/tracking-message-changes)
- [Content Services API — export](https://docs.beefree.io/beefree-sdk/apis/content-services-api/export)
