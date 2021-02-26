import { Plugin } from 'obsidian';
import { draw_chessboard } from './Chessboard';
import { ChessboardSettings, ChessboardSettingTab, DEFAULT_SETTINGS } from './ChessboardSettings';

export default class ChessboardPlugin extends Plugin {
	settings: ChessboardSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ChessboardSettingTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor("chessboard", draw_chessboard(this.settings));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}	
}