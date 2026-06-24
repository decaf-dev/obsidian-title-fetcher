# Title Fetcher

An [Obsidian](https://obsidian.md) plugin that renames a note to the title of a URL stored in its frontmatter.

Drop a `url` property in a note, run the command, and the file is renamed to the page's `<title>` — cleaned up for the filesystem, with social-media noise stripped out.

## Features

- **Rename from a URL title** — fetches the `<title>` of the page at the note's `url` frontmatter property and renames the file to it.
- **Three ways to trigger it:**
  - The ribbon icon ("Rename note from URL title") renames the active note.
  - The command palette command **Rename note from URL title** renames the active note.
  - Right-clicking a folder offers **Rename notes from URL titles**, which renames every markdown note directly inside that folder (processed in small batches to be respectful to servers).
- **Title cleanup** — strips social-media suffixes (e.g. Instagram's `• Instagram photos and videos`, Threads' `• Threads, Say more`), decorative emoji, and trailing `(@handle)` mentions.
- **Filesystem-safe names** — removes characters that are illegal on macOS or disallowed by Obsidian (`:`, `/`, `\`, `^`, `[`, `]`, `#`, `|`, control characters), collapses whitespace, and truncates to 255 characters.
- **Duplicate handling** — when a note with the same title already exists, appends the next available number (`Title 1`, `Title 2`, …) instead of failing. This can be turned off in settings.

## Usage

1. Add a `url` property to a note's frontmatter:

   ```yaml
   ---
   url: https://example.com/some-article
   ---
   ```

2. With that note open, click the ribbon icon or run **Rename note from URL title** from the command palette.
3. The note is renamed to the cleaned-up page title. A notice confirms the new path.

To rename a whole folder at once, right-click the folder in the file explorer and choose **Rename notes from URL titles**. Notes without a `url` property are skipped.

## Settings

- **Append number to duplicate file names** (default: on) — when a target title is already taken by another note, append the next available number rather than failing the rename.

## Installation

### From a release

1. Download `main.js` and `manifest.json` from the [latest release](https://github.com/decaf-dev/obsidian-title-fetcher/releases).
2. Create a folder named `title-fetcher` inside your vault's `.obsidian/plugins/` directory.
3. Copy `main.js` and `manifest.json` into it.
4. Reload Obsidian and enable **Title Fetcher** under Settings → Community plugins.

### Building from source

This project uses [Bun](https://bun.sh).

```bash
bun install      # install dependencies
bun run dev      # build to dist/ and watch for changes
bun run build    # type-check and produce a minified production build
```

The build outputs `main.js` and a copy of `manifest.json` to `dist/`.

## Notes

- This plugin is **desktop only** (`isDesktopOnly: true`) and requires Obsidian `1.8.0` or later.
- Filename sanitization is tuned for macOS; some other platforms allow characters that are stripped here.

## License

[MIT](LICENSE) © DecafDev
