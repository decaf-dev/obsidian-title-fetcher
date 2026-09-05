import { describe, expect, test } from "bun:test";
import {
	buildDuplicateName,
	formatTitleForMacOS,
	stripSocialMediaSuffixes,
	titleCaseAllCaps,
} from "./clean-title";

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

	test("keeps the handle when only a single name precedes it", () => {
		expect(stripSocialMediaSuffixes("Ethan (@ethan.brooks)")).toBe(
			"Ethan (@ethan.brooks)",
		);
	});

	test("strips the handle when a first and last name precede it", () => {
		expect(stripSocialMediaSuffixes("Ethan Brooks (@ethan.brooks)")).toBe(
			"Ethan Brooks",
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

describe("buildDuplicateName", () => {
	test("labels the first collision without a number", () => {
		expect(buildDuplicateName("Olivia Parker", 1)).toBe(
			"Olivia Parker (Duplicate)",
		);
	});

	test("numbers later collisions", () => {
		expect(buildDuplicateName("Olivia Parker", 2)).toBe(
			"Olivia Parker (Duplicate 2)",
		);
		expect(buildDuplicateName("Olivia Parker", 3)).toBe(
			"Olivia Parker (Duplicate 3)",
		);
	});

	test("trims the base so the suffix fits the macOS limit", () => {
		const base = "a".repeat(250);
		const result = buildDuplicateName(base, 2);
		expect(result).toEndWith(" (Duplicate 2)");
		expect([...result].length).toBeLessThanOrEqual(252);
	});

	test("does not split emoji when trimming a long base", () => {
		const base = "🐻‍❄️".repeat(100);
		const result = buildDuplicateName(base, 1);
		expect(result).toEndWith(" (Duplicate)");
		expect([...result].length).toBeLessThanOrEqual(252);
		expect(result).not.toContain("\ufffd");
	});
});
