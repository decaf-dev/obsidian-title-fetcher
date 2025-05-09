export const formatTitleForMacOS = (value: string) => {
	// Replace colon with hyphen
	value = value.replace(/:/g, "-");
	// Replace bach slash with space
	value = value.replace(/\\/g, " ");
	// Replace forward slash with space
	value = value.replace(/\//g, " ");
	// Replace carrot with nothing
	value = value.replace(/\^/g, "");
	// Replace left bracket with nothing
	value = value.replace(/\[/g, "");
	// Replace right bracket with nothing
	value = value.replace(/\]/g, "");
	// Replace hash tag with nothing
	value = value.replace(/#/g, "");
	// Replace pipe with nothing
	value = value.replace(/\|/g, "");

	const MAX_LENGTH_MAC_OS = 255;
	return value.substring(0, MAX_LENGTH_MAC_OS);
};
