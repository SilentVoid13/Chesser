import { Plugin } from 'obsidian';
import { Chessboard, draw_chessboard } from './Chessboard';
import { ChessboardSettings, ChessboardSettingTab, DEFAULT_SETTINGS } from './settings';

export default class ChessboardPlugin extends Plugin {
	settings: ChessboardSettings;

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		this.addSettingTab(new ChessboardSettingTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor("chessboard", draw_chessboard);
	}

	onunload() {
		console.log('unloading plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}	
}