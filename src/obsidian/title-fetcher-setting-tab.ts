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
				'If a note with the same title already exists, append "(Duplicate)" — and "(Duplicate 2)", "(Duplicate 3)", … for further collisions — instead of failing.'
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.appendDuplicateSuffix)
					.onChange(async (value) => {
						this.plugin.settings.appendDuplicateSuffix = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
