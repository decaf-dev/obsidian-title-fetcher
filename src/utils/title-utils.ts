const MAX_LENGTH_MAC_OS = 255;
const MARKDOWN_EXTENSION = ".md";
const DEFAULT_TITLE = "Untitled";

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
