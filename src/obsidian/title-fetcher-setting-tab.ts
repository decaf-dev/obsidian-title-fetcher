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
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
