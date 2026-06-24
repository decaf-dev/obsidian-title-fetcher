# CLAUDE.md

Guidance for working in this repository.

## What this is

**Title Fetcher** is an Obsidian plugin that renames a note to the `<title>` of a URL stored in the note's frontmatter (`url:` property). It is desktop-only and targets Obsidian `1.8.0+`. Plugin id: `title-fetcher`.

## Commands

This project uses **Bun** as the package manager. Use `bun`, not `npm`.

```bash
bun install      # install dependencies
bun run dev      # esbuild watch build → dist/ (inline sourcemaps, no minify)
bun run build    # tsc -noEmit type-check, then a minified production build → dist/
bun run check    # svelte-check against tsconfig.json
```

There is no test suite. Verify changes with `bun run build` (which type-checks) before committing.

## Architecture

The entry point is `src/main.ts`; esbuild bundles it to `dist/main.js` and copies `manifest.json` alongside it.

- **`src/main.ts`** — `TitleFetcherPlugin`. Registers the ribbon icon, the `rename-to-url-title` command, the folder context-menu item, and the settings tab. Holds the rename logic:
  - `renameToUrlTitle(file?)` — reads the `url` frontmatter via `metadataCache`, fetches the title, cleans it, resolves a target path, and calls `vault.rename`. Surfaces all failures as `Notice` messages.
  - `renameFolderNotesToUrlTitle(folder)` — batch-renames markdown files directly in a folder, `BATCH_SIZE = 3` with a 100ms delay between batches.
  - `resolveAvailablePath(file, baseName)` — duplicate handling; appends ` 1`, ` 2`, … but treats the file's own current path as a no-op (never numbers a file against itself).
- **`src/utils/http-utils.ts`** — `fetchTitleFromUrl(url)`. Uses Obsidian's `requestUrl` (clears `Cookie`), parses the HTML with `DOMParser`, returns the `<title>` text or `null`.
- **`src/utils/title-utils.ts`** — pure string helpers, the place for filename/title-cleaning logic:
  - `stripSocialMediaSuffixes(value)` — removes Instagram/Threads suffixes, emoji (`EMOJI_PATTERN`), and trailing `(@handle)`.
  - `formatTitleForMacOS(value)` — strips illegal/disallowed chars, collapses whitespace, trims leading/trailing dots, truncates to 255 chars by whole code points (so emoji aren't split), falls back to `"Untitled"`.
  - These run in order: `formatTitleForMacOS(stripSocialMediaSuffixes(title))`.
- **`src/obsidian/title-fetcher-setting-tab.ts`** — the settings UI. One setting: `appendNumberOnDuplicate` (default `true`).
- **`src/svelte/`** — currently empty (`.gitkeep`). Svelte tooling (`esbuild-svelte`, `svelte-preprocess`) is wired into the build for future UI components but nothing uses it yet.

## Conventions

- TypeScript, strict null checks, tabs for indentation. Match the existing style.
- Keep pure string/title logic in `src/utils/title-utils.ts` and Obsidian API calls in `main.ts` / the setting tab.
- User-facing errors go through `new Notice(...)`; unexpected errors also `console.error`.
- Settings are persisted via `loadData`/`saveData` and merged over `DEFAULT_SETTINGS`.

## Releases

Version metadata lives in `manifest.json` and `versions.json`; `package.json` carries the npm-style version. The `version` script (`bun run version`) runs `version-bump.mjs` and stages `manifest.json` + `versions.json`. There is an `obsidian-plugin-release` skill that handles bumping across these files, committing, tagging, and pushing — prefer it when cutting a release.
