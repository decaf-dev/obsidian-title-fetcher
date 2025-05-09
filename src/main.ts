import { Notice, Plugin } from "obsidian";
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

		this.addCommand({
			id: "fetch-title-from-url-property",
			name: "Fetch title from URL property",
			callback: async () => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					new Notice("No file is open");
					return;
				}

				const frontmatter =
					this.app.metadataCache.getFileCache(
						activeFile
					)?.frontmatter;
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
					await this.app.vault.rename(activeFile, formattedTitle);
					new Notice(`Renamed file to ${formattedTitle}`);
				} catch (error) {
					new Notice("Failed to rename file");
					console.error(error);
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		//this.addSettingTab(new TitleFetcherSettingTab(this.app, this));
	}

	onunload() {}

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
