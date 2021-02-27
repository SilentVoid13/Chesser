import { App, PluginSettingTab, Setting } from "obsidian";
import { BOARD_STYLES, convert_boolean, PIECE_STYLES } from "./ChesserConfig";
import ChesserPlugin from "./main";

export interface ChesserSettings {
	orientation: string;
	viewOnly: boolean;
	drawable: boolean;
	free: boolean;
    pieceStyle: string,
    boardStyle: string,
}

export const DEFAULT_SETTINGS: ChesserSettings = {
    orientation: "white",
    viewOnly: false,
    drawable: true,
    free: false,
    pieceStyle: "cburnett",
    boardStyle: "brown",
}

export class ChesserSettingTab extends PluginSettingTab {
	plugin: ChesserPlugin;

	constructor(app: App, plugin: ChesserPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Obsidian Chess Settings'});

		new Setting(containerEl)
			.setName("Piece Style")
			.setDesc("Sets the piece style.")
			.addDropdown(dropdown => {
				let styles: Record<string, string> = {};
				PIECE_STYLES.map(style => styles[style] = style);
				dropdown.addOptions(styles);

				dropdown
					.setValue(this.plugin.settings.pieceStyle)
					.onChange(pieceStyle => {
						this.plugin.settings.pieceStyle = pieceStyle;
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Board Style")
			.setDesc("Sets the board style.")
			.addDropdown(dropdown => {
				let styles: Record<string, string> = {};
				BOARD_STYLES.map(style => styles[style] = style);
				dropdown.addOptions(styles);

				dropdown
					.setValue(this.plugin.settings.boardStyle)
					.onChange(boardStyle => {
						this.plugin.settings.boardStyle = boardStyle;
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Orientation")
			.setDesc("Sets the default board orientation.")
			.addDropdown(dropdown => {
				dropdown.addOption("white", "White");
				dropdown.addOption("black", "Black");

				dropdown
					.setValue(this.plugin.settings.orientation)
					.onChange(orientation => {
						this.plugin.settings.orientation = orientation;
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Drawable")
			.setDesc("Controls the ability to draw annotations (arrows, circles) on the board.")
			.addDropdown(dropdown => {
				dropdown.addOption("true", "True");
				dropdown.addOption("false", "False");

				dropdown
					.setValue(this.plugin.settings.drawable.toString())
					.onChange(drawable => {
						this.plugin.settings.drawable = convert_boolean(drawable);
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("View Only")
			.setDesc("If set to True, displays a static chess board (no moves, annotations, ...).")
			.addDropdown(dropdown => {
				dropdown.addOption("true", "True");
				dropdown.addOption("false", "False");

				dropdown
					.setValue(this.plugin.settings.viewOnly.toString())
					.onChange(viewOnly => {
						this.plugin.settings.viewOnly = convert_boolean(viewOnly);
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Free")
			.setDesc("If set to True, disables the chess logic, all moves are valid.")
			.addDropdown(dropdown => {
				dropdown.addOption("true", "True");
				dropdown.addOption("false", "False");

				dropdown
					.setValue(this.plugin.settings.free.toString())
					.onChange(free => {
						this.plugin.settings.free = convert_boolean(free);
						this.plugin.saveSettings();
					});
			});
	}
}


