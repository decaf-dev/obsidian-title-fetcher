import { Notice, Plugin, TFile, TFolder, normalizePath } from "obsidian";
import TitleFetcherSettingTab from "./obsidian/title-fetcher-setting-tab";
import { fetchTitleFromUrl } from "./utils/fetch-page-title";
import {
	buildDuplicateName,
	formatTitleForMacOS,
	stripSocialMediaSuffixes,
	titleCaseAllCaps,
} from "./utils/clean-title";
interface TitleFetcherSettings {
	appendDuplicateSuffix: boolean;
	searchVaultForDuplicates: boolean;
}

const DEFAULT_SETTINGS: TitleFetcherSettings = {
	appendDuplicateSuffix: true,
	searchVaultForDuplicates: false,
};

export default class TitleFetcherPlugin extends Plugin {
	settings: TitleFetcherSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("file-code-2", "Rename note from URL property", () => {
			this.renameToUrlTitle();
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (file instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Rename notes from URL property")
							.setIcon("file-code-2")
							.onClick(async () => {
								await this.renameFolderNotesToUrlTitle(file);
							});
					});
				}
			}),
		);

		this.addCommand({
			id: "rename-to-url-property",
			name: "Rename note from URL property",
			callback: async () => {
				this.renameToUrlTitle();
			},
		});

		this.addSettingTab(new TitleFetcherSettingTab(this.app, this));
	}

	onunload() {}

	private async renameFolderNotesToUrlTitle(folder: TFolder) {
		const markdownFiles = this.app.vault
			.getMarkdownFiles()
			.filter((file) => file.parent === folder);

		const BATCH_SIZE = 3; // Process 3 files at a time

		for (let i = 0; i < markdownFiles.length; i += BATCH_SIZE) {
			const batch = markdownFiles.slice(i, i + BATCH_SIZE);
			await Promise.allSettled(
				batch.map((file) => this.renameToUrlTitle(file)),
			);

			// Optional: small delay between batches to be respectful
			if (i + BATCH_SIZE < markdownFiles.length) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}
	}

	private async renameToUrlTitle(file?: TFile) {
		if (!file) {
			const activeFile = this.app.workspace.getActiveFile();
			if (!activeFile) {
				new Notice("No file is open");
				return;
			}
			file = activeFile;
		}

		const frontmatter =
			this.app.metadataCache.getFileCache(file)?.frontmatter;
		if (!frontmatter) {
			new Notice("No frontmatter found in the current file");
			return;
		}

		const url = frontmatter.url;
		if (!url) {
			new Notice("No url property found in the current file");
			return;
		}

		const title = await fetchTitleFromUrl(url);
		if (!title) {
			new Notice("Failed to fetch title from URL");
			return;
		}

		try {
			const formattedTitle = formatTitleForMacOS(
				titleCaseAllCaps(stripSocialMediaSuffixes(title)),
			);

			const targetPath = this.settings.appendDuplicateSuffix
				? this.resolveAvailablePath(file, formattedTitle)
				: normalizePath(
						file.parent
							? `${file.parent.path}/${formattedTitle}.md`
							: `${formattedTitle}.md`,
					);

			await this.app.vault.rename(file, targetPath);
			new Notice(`Renamed file to ${targetPath}`);
		} catch (error) {
			new Notice("Failed to rename file");
			console.error(error);
		}
	}

	private resolveAvailablePath(file: TFile, baseName: string): string {
		const dir = file.parent ? file.parent.path : "";
		const build = (name: string) =>
			normalizePath(dir ? `${dir}/${name}.md` : `${name}.md`);

		// With vault-wide search on, a name is also taken if any other note in
		// the vault already uses it, regardless of folder.
		const vaultNames = new Set<string>();
		if (this.settings.searchVaultForDuplicates) {
			for (const other of this.app.vault.getMarkdownFiles()) {
				if (other.path !== file.path) vaultNames.add(other.basename);
			}
		}

		let name = baseName;
		let counter = 1;
		// Skip names already taken by a *different* file; renaming a file to its
		// own current name is a no-op and must not get a suffix appended.
		while (true) {
			const candidate = build(name);
			const existing = this.app.vault.getAbstractFileByPath(candidate);
			const takenInFolder = existing && existing.path !== file.path;
			if (!takenInFolder && !vaultNames.has(name)) return candidate;
			name = buildDuplicateName(baseName, counter);
			counter++;
		}
	}

	async loadSettings() {
		const savedData = await this.loadData();
		this.settings = Object.assign({}, DEFAULT_SETTINGS, savedData);

		// Migrate the pre-0.3 `appendNumberOnDuplicate` key so anyone who turned
		// duplicate naming off keeps it off, then drop the stale key.
		const legacy = savedData?.appendNumberOnDuplicate;
		if (typeof legacy === "boolean") {
			if (savedData?.appendDuplicateSuffix === undefined) {
				this.settings.appendDuplicateSuffix = legacy;
			}
			delete (this.settings as unknown as Record<string, unknown>)
				.appendNumberOnDuplicate;
			await this.saveSettings();
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
