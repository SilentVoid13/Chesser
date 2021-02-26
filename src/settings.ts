import { App, PluginSettingTab, Setting } from "obsidian";
import ChessboardPlugin from "./main";

export interface ChessboardSettings {
	mySetting: string;
}

export const DEFAULT_SETTINGS: ChessboardSettings = {
	mySetting: 'default'
}

export class ChessboardSettingTab extends PluginSettingTab {
	plugin: ChessboardPlugin;

	constructor(app: App, plugin: ChessboardPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});
	}
}


