import { BOARD_STYLES, PIECE_STYLES } from "./ChesserConfig";
import ChesserPlugin from "./main";

import { App, PluginSettingTab, Setting } from "obsidian";

export interface ChesserSettings {
  orientation: string;
  viewOnly: boolean;
  drawable: boolean;
  free: boolean;
  pieceStyle: string;
  boardStyle: string;
}

export const DEFAULT_SETTINGS: ChesserSettings = {
  orientation: "white",
  viewOnly: false,
  drawable: true,
  free: false,
  pieceStyle: "cburnett",
  boardStyle: "brown",
};

export class ChesserSettingTab extends PluginSettingTab {
  plugin: ChesserPlugin;

  constructor(app: App, plugin: ChesserPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Obsidian Chess Settings" });

    new Setting(containerEl)
      .setName("Piece Style")
      .setDesc("Sets the piece style.")
      .addDropdown((dropdown) => {
        let styles: Record<string, string> = {};
        PIECE_STYLES.map((style) => (styles[style] = style));
        dropdown.addOptions(styles);

        dropdown.setValue(this.plugin.settings.pieceStyle).onChange((pieceStyle) => {
          this.plugin.settings.pieceStyle = pieceStyle;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Board Style")
      .setDesc("Sets the board style.")
      .addDropdown((dropdown) => {
        let styles: Record<string, string> = {};
        BOARD_STYLES.map((style) => (styles[style] = style));
        dropdown.addOptions(styles);

        dropdown.setValue(this.plugin.settings.boardStyle).onChange((boardStyle) => {
          this.plugin.settings.boardStyle = boardStyle;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Orientation")
      .setDesc("Sets the default board orientation.")
      .addDropdown((dropdown) => {
        dropdown.addOption("white", "White");
        dropdown.addOption("black", "Black");

        dropdown.setValue(this.plugin.settings.orientation).onChange((orientation) => {
          this.plugin.settings.orientation = orientation;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Drawable")
      .setDesc("Controls the ability to draw annotations (arrows, circles) on the board.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.drawable).onChange((drawable) => {
          this.plugin.settings.drawable = drawable;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("View-only")
      .setDesc("If enabled, displays a static chess board (no moves, annotations, ...).")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.viewOnly).onChange((viewOnly) => {
          this.plugin.settings.viewOnly = viewOnly;
          this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Free")
      .setDesc("If enabled, disables the chess logic, all moves are valid.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.free).onChange((free) => {
          this.plugin.settings.free = free;
          this.plugin.saveSettings();
        });
      });
  }
}
