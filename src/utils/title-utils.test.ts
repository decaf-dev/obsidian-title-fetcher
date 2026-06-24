import { describe, expect, test } from "bun:test";
import {
	formatTitleForMacOS,
	stripSocialMediaSuffixes,
	titleCaseAllCaps,
} from "./title-utils";

describe("stripSocialMediaSuffixes", () => {
	test("removes the Instagram suffix", () => {
		expect(
			stripSocialMediaSuffixes(
				"James Whitfield • Instagram photos and videos",
			),
		).toBe("James Whitfield");
	});

	test("removes the Threads suffix", () => {
		expect(
			stripSocialMediaSuffixes("Marcus Lee • Threads, Say more"),
		).toBe("Marcus Lee");
	});

	test("removes a trailing handle when other text precedes it", () => {
		expect(stripSocialMediaSuffixes("David Okafor (@david.okafor)")).toBe(
			"David Okafor",
		);
	});

	test("keeps a handle when it is the entire title", () => {
		expect(stripSocialMediaSuffixes("(@noahbennett)")).toBe(
			"(@noahbennett)",
		);
	});

	test("removes trailing decorative emoji", () => {
		expect(stripSocialMediaSuffixes("Diego Herrera 🔥⚽")).toBe(
			"Diego Herrera",
		);
	});

	test("removes a zero-width-joiner emoji sequence in full", () => {
		expect(stripSocialMediaSuffixes("Liam Carter 🧑‍🚀")).toBe(
			"Liam Carter",
		);
	});

	test("removes flag and skin-tone emoji", () => {
		expect(stripSocialMediaSuffixes("Mateo Ramírez 🇲🇽👨🏽‍🎤")).toBe(
			"Mateo Ramírez",
		);
	});

	test("removes emoji from the middle and collapses the gap", () => {
		expect(stripSocialMediaSuffixes("Noah ⚡ Bennett")).toBe(
			"Noah Bennett",
		);
	});

	test("strips emoji, handle, and platform suffix together", () => {
		expect(
			stripSocialMediaSuffixes(
				"Kai Sullivan 🎸🍻 (@kai.s) • Instagram photos and videos",
			),
		).toBe("Kai Sullivan");
	});

	test("leaves an ordinary title untouched", () => {
		expect(stripSocialMediaSuffixes("How to Brew Better Coffee")).toBe(
			"How to Brew Better Coffee",
		);
	});
});

describe("titleCaseAllCaps", () => {
	test("title-cases an all-caps name", () => {
		expect(titleCaseAllCaps("OLIVIA PARKER")).toBe("Olivia Parker");
	});

	test("capitalizes after hyphens and apostrophes", () => {
		expect(titleCaseAllCaps("MARY-JANE O'BRIEN")).toBe("Mary-Jane O'Brien");
	});

	test("leaves a normal mixed-case title untouched", () => {
		expect(titleCaseAllCaps("How to Brew Better Coffee")).toBe(
			"How to Brew Better Coffee",
		);
	});

	test("leaves an already title-cased name untouched", () => {
		expect(titleCaseAllCaps("Olivia Parker")).toBe("Olivia Parker");
	});

	test("ignores values without letters", () => {
		expect(titleCaseAllCaps("12345")).toBe("12345");
	});
});

describe("formatTitleForMacOS", () => {
	test("replaces characters that are illegal on macOS", () => {
		expect(formatTitleForMacOS("Notes: drafts / ideas")).toBe(
			"Notes- drafts ideas",
		);
	});

	test("falls back to Untitled when nothing usable remains", () => {
		expect(formatTitleForMacOS("   ")).toBe("Untitled");
	});
});
