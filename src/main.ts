import { Plugin } from 'obsidian';
import { draw_chessboard } from './Chesser';
import { ChesserSettings, ChesserSettingTab, DEFAULT_SETTINGS } from './ChesserSettings';

export default class ChesserPlugin extends Plugin {
	settings: ChesserSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ChesserSettingTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor("chesser", draw_chessboard(this.settings));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}	
}