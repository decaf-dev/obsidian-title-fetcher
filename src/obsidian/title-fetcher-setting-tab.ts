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
			.setName("Append number to duplicate file names")
			.setDesc(
				'If a note with the same title already exists, append the next available number (e.g. "Title 1") instead of failing.'
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.appendNumberOnDuplicate)
					.onChange(async (value) => {
						this.plugin.settings.appendNumberOnDuplicate = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
