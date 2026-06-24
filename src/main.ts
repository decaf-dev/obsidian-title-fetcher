import { Notice, Plugin, TFile, TFolder, normalizePath } from "obsidian";
import TitleFetcherSettingTab from "./obsidian/title-fetcher-setting-tab";
import { fetchTitleFromUrl } from "./utils/http-utils";
import {
	formatTitleForMacOS,
	stripSocialMediaSuffixes,
} from "./utils/title-utils";
interface TitleFetcherSettings {
	appendNumberOnDuplicate: boolean;
}

const DEFAULT_SETTINGS: TitleFetcherSettings = {
	appendNumberOnDuplicate: true,
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
				stripSocialMediaSuffixes(title),
			);

			const targetPath = this.settings.appendNumberOnDuplicate
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

		let candidate = build(baseName);
		let counter = 1;
		// Skip names already taken by a *different* file; renaming a file to its
		// own current name is a no-op and must not get a number appended.
		while (true) {
			const existing = this.app.vault.getAbstractFileByPath(candidate);
			if (!existing || existing.path === file.path) return candidate;
			candidate = build(`${baseName} ${counter}`);
			counter++;
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
