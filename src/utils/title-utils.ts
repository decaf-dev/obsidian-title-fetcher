const MAX_LENGTH_MAC_OS = 255;
const MARKDOWN_EXTENSION = ".md";
const DEFAULT_TITLE = "Untitled";

// Matches emoji and their modifiers: pictographs, regional-indicator flag
// halves, skin-tone modifiers, variation selectors, and zero-width joiners
// (so multi-codepoint sequences like 🐻‍❄️ are removed in full).
const EMOJI_PATTERN =
	/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u{FE0E}\u{FE0F}\u{200D}]/gu;

// Strip social-media noise that sites append to their <title>, e.g.
// "David Okafor (@david.okafor) • Instagram photos and videos" -> "David Okafor".
export const stripSocialMediaSuffixes = (value: string) => {
	return value
		.trim()
		// Strip Instagram's trailing " • Instagram photos and videos" suffix
		.replace(/\s*[•·]\s*Instagram photos and videos\s*$/i, "")
		// Strip Threads' trailing " • Threads, Say more" suffix
		.replace(/\s*[•·]\s*Threads, Say more\s*$/i, "")
		// Strip decorative emoji icons (e.g. "Diego Herrera 🔥⚽")
		.replace(EMOJI_PATTERN, "")
		// Collapse gaps left by removed emoji before detecting the handle
		.replace(/\s+/g, " ")
		// Strip a trailing "(@username)" handle, but only when other text
		// precedes it (keep it when the handle is the entire title)
		.replace(/(\S)\s*\(@[^)\s]+\)\s*$/, "$1")
		.trim();
};

export const formatTitleForMacOS = (value: string) => {
	let result = value
		.trim()
		// Strip control characters (newlines, tabs, etc.)
		.replace(/[\x00-\x1f\x7f]/g, "")
		// Colon is illegal in macOS filenames
		.replace(/:/g, "-")
		// Slashes act as path separators
		.replace(/[\\/]/g, " ")
		// Characters Obsidian disallows in note titles
		.replace(/[\^[\]#|]/g, "")
		// Collapse whitespace runs into single spaces
		.replace(/\s+/g, " ")
		// Leading dots create hidden files; trailing dots/spaces are invalid
		.replace(/^\.+/, "")
		.replace(/[. ]+$/, "")
		.trim();

	// Truncate by whole characters (not UTF-16 units) so emoji aren't split in
	// half, leaving room for the file extension.
	const maxLength = MAX_LENGTH_MAC_OS - MARKDOWN_EXTENSION.length;
	const characters = [...result];
	if (characters.length > maxLength) {
		result = characters.slice(0, maxLength).join("").trim();
	}

	return result || DEFAULT_TITLE;
};
