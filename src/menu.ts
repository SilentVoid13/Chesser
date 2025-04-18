import { setIcon, Setting } from "obsidian";
import { Chesser } from "./Chesser";
import startingPositons from "./startingPositions";

export default class ChesserMenu {
  private chesser: Chesser;
  private containerEl: HTMLElement;

  private movesListEl: HTMLElement;

  constructor(parentEl: HTMLElement, chesser: Chesser) {
    this.chesser = chesser;

    this.containerEl = parentEl.createDiv("chess-menu-container", (containerEl) => {
      containerEl.createDiv({ cls: "chess-menu-section" }, (sectionEl) => {
        const selectEl = sectionEl.createEl(
          "select",
          {
            cls: "dropdown chess-starting-position-dropdown",
          },
          (el) => {
            el.createEl("option", {
              value: "starting-position",
              text: "Starting Position",
            });
            el.createEl("option", {
              value: "custom",
              text: "Custom",
            });
            el.createEl("optgroup", {}, (optgroup) => {
              optgroup.label = "Popular Openings";
              startingPositons.forEach((category) => {
                category.items.forEach((item) => {
                  optgroup.createEl("option", {
                    value: item.eco,
                    text: item.name,
                  });
                });
              });
            });

            const startingPosition = this.getStartingPositionFromFen(chesser.getFen());
            const startingPositionName = startingPosition
              ? startingPosition.eco
              : "custom";
            el.value = startingPositionName;
          }
        );

        selectEl.addEventListener("change", (ev) => {
          const value = (ev.target as any).value;

          if (value === "starting-position") {
            this.chesser.loadFen(
              "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
              []
            );
            return;
          }

          const startingPosition = startingPositons
            .flatMap((cat) => cat.items)
            .find((item) => item.eco === value);

          this.chesser.loadFen(startingPosition.fen, startingPosition.moves);
        });

        new Setting(sectionEl).setName("Enable Free Move?").addToggle((toggle) => {
          toggle.setValue(this.chesser.getBoardState().movable.free);
          toggle.onChange((value) => {
            this.chesser.setFreeMove(value);
          });
        }).settingEl.classList.add("chesser-hide-setting");
      });
    });

    this.movesListEl = this.containerEl.createDiv({
      cls: "chess-menu-section chess-menu-section-tall",
    });

    this.redrawMoveList();
    this.createToolbar();
  }

  getStartingPositionFromFen(fen: string) {
    return startingPositons.flatMap((cat) => cat.items).find((item) => item.eco === fen);
  }

  createToolbar() {
      const btnContainer = this.containerEl.createDiv("chess-toolbar-container");
      btnContainer.createEl("a", "view-action", (btn) => {
          btn.ariaLabel = "Flip board";
          obsidian.setIcon(btn, "switch");
          btn.addEventListener("click", (e) => {
              e.preventDefault();
              this.chesser.flipBoard();
          });
      });
      btnContainer.createEl("a", "view-action", (btn) => {
          btn.ariaLabel = "Home";
          obsidian.setIcon(btn, "house");
          btn.addEventListener("click", (e) => {
              e.preventDefault();
              while (this.chesser.currentMoveIdx >= 0) {
                  this.chesser.undo_move();
              }
          });
      });
  btnContainer.createEl("a", "view-action", (btn) => {
          btn.ariaLabel = "Init";
          obsidian.setIcon(btn, "rotate-ccw");
          btn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
              e.preventDefault();
              yield this.chesser.loadInitialPosition();
          }));
      });
  btnContainer.createEl("a", "view-action", (btn) => {
          btn.ariaLabel = "Copy FEN";
          obsidian.setIcon(btn, "two-blank-pages");
          btn.addEventListener("click", (e) => {
              e.preventDefault();
              navigator.clipboard.writeText(this.chesser.getFen());
          });
      });
  btnContainer.createEl("a", "view-action", (btn) => {
    btn.ariaLabel = "Copy PGN";
    obsidian.setIcon(btn, "scroll-text");
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const pgn = this.chesser.chess?.pgn?.();
      const fallback = '1...';
      const content = (pgn && pgn.trim() !== '') ? pgn : fallback;

      navigator.clipboard.writeText(content).then(() => {
        new obsidian.Notice("PGN copié !");
      }).catch(() => {
        new obsidian.Notice("Erreur lors de la copie du PGN");
      });
    });
  });
      btnContainer.createEl("a", "view-action", (btn) => {
          btn.ariaLabel = "Undo";
          obsidian.setIcon(btn, "left-arrow");
          btn.addEventListener("click", (e) => {
              e.preventDefault();
              this.chesser.undo_move();
          });
      });
      btnContainer.createEl("a", "view-action", (btn) => {
          btn.ariaLabel = "Redo";
          obsidian.setIcon(btn, "right-arrow");
          btn.addEventListener("click", (e) => {
              e.preventDefault();
              this.chesser.redo_move();
          });
      });
  }

  redrawMoveList() {
    this.movesListEl.empty();
    this.movesListEl.createDiv({
      text: this.chesser.turn() === "b" ? "Black's turn" : "White's turn",
      cls: "chess-turn-text",
    });
    this.movesListEl.createDiv("chess-move-list", (moveListEl) => {
      this.chesser.history().forEach((move, idx) => {
        const moveEl = moveListEl.createDiv({
          cls: `chess-move ${
            this.chesser.currentMoveIdx === idx ? "chess-move-active" : ""
          }`,
          text: move.san,
        });
        moveEl.addEventListener("click", (ev) => {
          ev.preventDefault();
          this.chesser.update_turn_idx(idx);
        });
      });
    });
  }
}
