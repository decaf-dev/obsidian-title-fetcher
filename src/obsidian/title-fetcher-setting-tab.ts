import { PluginSettingTab, Setting, type App } from "obsidian";
import type TitleFetcherPlugin from "src/main";

export default class TitleFetcherSettingTab extends PluginSettingTab {
	plugin: TitleFetcherPlugin;

	constructor(app: App, plugin: TitleFetcherPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Mark duplicate file names")
			.setDesc(
				'If another note already has the name, add a number to the end, like "My Note (1)". When off, the note keeps its old name.'
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.appendDuplicateSuffix)
					.onChange(async (value) => {
						this.plugin.settings.appendDuplicateSuffix = value;
						await this.plugin.saveSettings();
						// Re-render so the vault-wide toggle's disabled state follows.
						this.display();
					})
			);

		new Setting(containerEl)
			.setName("Check entire vault for duplicates")
			.setDesc(
				"Count a name as taken if any note in your vault has it, not just notes in the same folder. Requires \"Mark duplicate file names\" to be enabled."
			)
			.setDisabled(!this.plugin.settings.appendDuplicateSuffix)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.searchVaultForDuplicates)
					.setDisabled(!this.plugin.settings.appendDuplicateSuffix)
					.onChange(async (value) => {
						this.plugin.settings.searchVaultForDuplicates = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
