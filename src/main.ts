import { Notice, Plugin, TFile, TFolder, normalizePath } from "obsidian";
import { fetchTitleFromUrl } from "./utils/http-utils";
import { formatTitleForMacOS } from "./utils/title-utils";
interface TitleFetcherSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: TitleFetcherSettings = {
	mySetting: "default",
};

export default class TitleFetcherPlugin extends Plugin {
	settings: TitleFetcherSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("file-code-2", "Rename to URL title", () => {
			this.renameToUrlTitle();
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (file instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Rename notes to URL titles")
							.setIcon("file-code-2")
							.onClick(async () => {
								await this.renameFolderNotesToUrlTitle(file);
							});
					});
				}
			})
		);

		this.addCommand({
			id: "rename-to-url-title",
			name: "Rename to URL title",
			callback: async () => {
				this.renameToUrlTitle();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		//this.addSettingTab(new TitleFetcherSettingTab(this.app, this));
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
				batch.map((file) => this.renameToUrlTitle(file))
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
			const formattedTitle = formatTitleForMacOS(title);

			let formattedTitleWithExtension = "";
			if (file.parent) {
				formattedTitleWithExtension = normalizePath(
					`${file.parent.path}/${formattedTitle}.md`
				);
			} else {
				formattedTitleWithExtension = `${formattedTitle}.md`;
			}

			await this.app.vault.rename(file, formattedTitleWithExtension);
			new Notice(`Renamed file to ${formattedTitleWithExtension}`);
		} catch (error) {
			new Notice("Failed to rename file");
			console.error(error);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
