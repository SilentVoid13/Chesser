import { nanoid } from "nanoid";
import {
  App,
  EditorPosition,
  MarkdownPostProcessorContext,
  MarkdownRenderChild,
  MarkdownView,
  Notice,
  parseYaml,
  stringifyYaml,
} from "obsidian";
import { Chess, ChessInstance, Move, Square } from "chess.js";
import { Chessground } from "chessground";
import { Api } from "chessground/api";
import { Color, Key } from "chessground/types";
import { DrawShape } from "chessground/draw";

import { ChesserConfig, parse_user_config } from "./ChesserConfig";
import { ChesserSettings } from "./ChesserSettings";
import ChesserMenu from "./menu";
import { StartingPosition } from './startingPositions';

// To bundle all css files in styles.css with rollup
import "../assets/custom.css";
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
// Piece styles
import "../assets/piece-css/alpha.css";
import "../assets/piece-css/california.css";
import "../assets/piece-css/cardinal.css";
import "../assets/piece-css/cburnett.css";
import "../assets/piece-css/chess7.css";
import "../assets/piece-css/chessnut.css";
import "../assets/piece-css/companion.css";
import "../assets/piece-css/dubrovny.css";
import "../assets/piece-css/fantasy.css";
import "../assets/piece-css/fresca.css";
import "../assets/piece-css/gioco.css";
import "../assets/piece-css/governor.css";
import "../assets/piece-css/horsey.css";
import "../assets/piece-css/icpieces.css";
import "../assets/piece-css/kosal.css";
import "../assets/piece-css/leipzig.css";
import "../assets/piece-css/letter.css";
import "../assets/piece-css/libra.css";
import "../assets/piece-css/maestro.css";
import "../assets/piece-css/merida.css";
import "../assets/piece-css/pirouetti.css";
import "../assets/piece-css/pixel.css";
import "../assets/piece-css/reillycraig.css";
import "../assets/piece-css/riohacha.css";
import "../assets/piece-css/shapes.css";
import "../assets/piece-css/spatial.css";
import "../assets/piece-css/staunty.css";
import "../assets/piece-css/tatiana.css";
// Board styles
import "../assets/board-css/brown.css";
import "../assets/board-css/blue.css";
import "../assets/board-css/green.css";
import "../assets/board-css/purple.css";
import "../assets/board-css/ic.css";
import debug from "./debug";

export function draw_chessboard(app: App, settings: ChesserSettings) {
  return (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    let user_config = parse_user_config(settings, source);
    ctx.addChild(new Chesser(el, ctx, user_config, app));
  };
}

// PATCH : Replaces `localStorage` with persistent storage in the vault
declare const app: App;
async function write_state(id: string, state: any) {
  const fileName = `.ChesserStorage/${id}.json`;
  const content = JSON.stringify(state, null, 2);

  const adapter = app.vault.adapter;

  try {
    const exists = await adapter.exists(fileName);
    if (exists) {
      await adapter.write(fileName, content);
    } else {
      // Check that the folder exists
      const folderPath = `.ChesserStorage`;
      const folderExists = await adapter.exists(folderPath);
      if (!folderExists) {
        await adapter.mkdir(folderPath);
      }
      await adapter.write(fileName, content);
    }
  } catch (err) {
    console.error("Error writing file .json :", err);
  }
}

async function read_state(id: string) {
  const fileName = `.ChesserStorage/${id}.json`;
  const adapter = app.vault.adapter;

  try {
    const exists = await adapter.exists(fileName);
    if (!exists) return null;

    const content = await adapter.read(fileName);
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading or parsing JSON :", err);
    return null;
  }
}

export class Chesser extends MarkdownRenderChild {
  private ctx: MarkdownPostProcessorContext;
  private app: App;

  private id: string;
  private cg: Api;
  private chess: ChessInstance;

  private menu: ChesserMenu;
  private moves: Move[];

  private user_config: any;
  private startingPosition: StartingPosition;

  public currentMoveIdx: number;

  constructor(
    containerEl: HTMLElement,
    ctx: MarkdownPostProcessorContext,
    user_config: ChesserConfig,
    app: App
  ) {
    super(containerEl);

    this.app = app;
    this.ctx = ctx;
    this.id = user_config.id ?? nanoid(8);
    this.chess = new Chess();

    const saved_config = read_state(this.id);
    const config = Object.assign({}, user_config, saved_config);
    this.user_config = user_config;  // required for the function loadInitialPosition()

    this.sync_board_with_gamestate = this.sync_board_with_gamestate.bind(this);
    this.save_move = this.save_move.bind(this);
    this.save_shapes = this.save_shapes.bind(this);

    // Save `id` into the codeblock yaml
    if (user_config.id === undefined) {
      this.app.workspace.onLayoutReady(() => {
        window.setImmediate(() => {
          this.write_config({ id: this.id });
        });
      });
    }

    /* Allows user to define a PGN directly in the code block */
		if (config.pgn?.trim()) {
			try {
				const rawPgn = config.pgn.trim();
				const normalizedPgn = rawPgn.replace(/(\d+)\s*\./g, '$1.');

				if (!this.chess.load_pgn(normalizedPgn)) {
					throw new Error("Invalid or incompatible PGN.");
				}

				const moves = normalizedPgn.replace(/\d+\./g, '').trim().split(/\s+/);
				const movePairs = [];
				for (let i = 0; i < moves.length; i += 2) {
					movePairs.push(moves[i + 1] ? `${moves[i]} ${moves[i + 1]}` : moves[i]);
				}

				this.startingPosition = new StartingPosition(
					"Xxx", "Custom", this.chess.fen(), "Custom", movePairs
				);

			} catch (e) {
				console.error("PGN loading error:", e);
			}
		}

		if (config.fen) {
            debug(() => console.debug("loading from fen", config.fen));
            this.chess.load(config.fen);
        }

    this.moves = config.moves ?? this.chess.history({ verbose: true });
    this.currentMoveIdx = config.currentMoveIdx ?? this.moves.length - 1;

    let lastMove: [Key, Key] = undefined;
    if (this.currentMoveIdx >= 0) {
      const move = this.moves[this.currentMoveIdx];
      lastMove = [move.from, move.to];
    }

    // Setup UI
    this.set_style(containerEl, config.pieceStyle, config.boardStyle);
    try {
      this.cg = Chessground(containerEl.createDiv(), {
        fen: this.chess.fen(),
        addDimensionsCssVars: true,
        lastMove,
        orientation: config.orientation as Color,
        viewOnly: config.viewOnly,
        drawable: {
          enabled: config.drawable,
          onChange: this.save_shapes,
        },
      });
    } catch (e) {
      new Notice("Chesser error: Invalid config");
      console.error(e);
      return;
    }

    // Activates the chess logic
    this.setFreeMove(config.free);

    // Draw saved shapes
    if (config.shapes) {
      this.app.workspace.onLayoutReady(() => {
        window.setTimeout(() => {
          this.sync_board_with_gamestate(false);
          this.cg.setShapes(config.shapes);
        }, 100);
      });
    }

    this.menu = new ChesserMenu(containerEl, this);
  }

  private set_style(el: HTMLElement, pieceStyle: string, boardStyle: string) {
    el.addClasses([pieceStyle, `${boardStyle}-board`, "chesser-container"]);
  }

  private get_section_range(): [EditorPosition, EditorPosition] {
    const sectionInfo = this.ctx.getSectionInfo(this.containerEl);

    return [
      {
        line: sectionInfo.lineStart + 1,
        ch: 0,
      },
      {
        line: sectionInfo.lineEnd,
        ch: 0,
      },
    ];
  }

  private get_config(view: MarkdownView): ChesserConfig | undefined {
    const [from, to] = this.get_section_range();
    const codeblockText = view.editor.getRange(from, to);
    try {
      return parseYaml(codeblockText);
    } catch (e) {
      debug(() =>
        console.debug("failed to parse codeblock's yaml config", codeblockText)
      );
      // failed to parse. show error...
    }

    return undefined;
  }

  private write_config(config: Partial<ChesserConfig>) {
    debug(() => console.debug("writing config to localStorage", config));
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      new Notice("Chesser: Failed to retrieve active view");
      console.error("Chesser: Failed to retrieve view when writing config");
    }
    try {
      const updated = stringifyYaml({
        ...this.get_config(view),
        ...config,
      });

      const [from, to] = this.get_section_range();
      view.editor.replaceRange(updated, from, to);
    } catch (e) {
      // failed to parse. show error...
      console.error("failed to write config", e);
    }
  }

  private save_move() {
    const config = read_state(this.id);
    write_state(this.id, {
      ...config,
      currentMoveIdx: this.currentMoveIdx,
      moves: this.moves,
      pgn: this.chess.pgn(),
    });
  }

  private save_shapes(shapes: DrawShape[]) {
    const config = read_state(this.id);
    write_state(this.id, {
      ...config,
      shapes,
    });
  }

  private sync_board_with_gamestate(shouldSave: boolean = true) {
    this.cg.set({
      check: this.check(),
      turnColor: this.color_turn(),
      movable: {
        free: false,
        color: this.color_turn(),
        dests: this.dests(),
      },
    });

    this.menu?.redrawMoveList();
    if (shouldSave) {
      this.save_move();
    }
  }

  public color_turn(): Color {
    return this.chess.turn() === "w" ? "white" : "black";
  }

  public dests(): Map<Key, Key[]> {
    const dests = new Map();
    this.chess.SQUARES.forEach((s) => {
      const ms = this.chess.moves({ square: s, verbose: true });
      if (ms.length)
        dests.set(
          s,
          ms.map((m) => m.to)
        );
    });
    return dests;
  }

  public check(): boolean {
    return this.chess.in_check();
  }

  public undo_move() {
    this.update_turn_idx(this.currentMoveIdx - 1);
  }

  public redo_move() {
    this.update_turn_idx(this.currentMoveIdx + 1);
  }

  public update_turn_idx(moveIdx: number): void {
    if (moveIdx < -1 || moveIdx >= this.moves.length) {
      return;
    }

    const isUndoing = moveIdx < this.currentMoveIdx;
    if (isUndoing) {
      while (this.currentMoveIdx > moveIdx) {
        this.currentMoveIdx--;
        this.chess.undo();
      }
    } else {
      while (this.currentMoveIdx < moveIdx) {
        this.currentMoveIdx++;
        const move = this.moves[this.currentMoveIdx];
        this.chess.move(move);
      }
    }

    let lastMove: [Key, Key] = undefined;
    if (this.currentMoveIdx >= 0) {
      const move = this.moves[this.currentMoveIdx];
      lastMove = [move.from, move.to];
    }

    this.cg.set({
      fen: this.chess.fen(),
      lastMove,
    });
    this.sync_board_with_gamestate();
  }

  public setFreeMove(enabled: boolean): void {
    if (enabled) {
      this.cg.set({
        events: {
          move: this.save_move,
        },
        movable: {
          free: true,
          color: "both",
          dests: undefined,
        },
      });
    } else {
      this.cg.set({
        events: {
          move: (orig: any, dest: any) => {
            const move = this.chess.move({ from: orig, to: dest });
            this.currentMoveIdx++;
            this.moves = [...this.moves.slice(0, this.currentMoveIdx), move];
            this.sync_board_with_gamestate();
          },
        },
      });
      this.sync_board_with_gamestate();
    }
  }

  public turn() {
    return this.chess.turn();
  }

  public history() {
    return this.moves;
  }

  public flipBoard() {
    return this.cg.toggleOrientation();
  }

  public getBoardState() {
    return this.cg.state;
  }

  public getFen() {
    return this.chess.fen();
  }

  public getPgn() {
    const pgn = this.chess.pgn();
    return pgn && pgn.trim() !== '' ? pgn : '1...';
  }

  public loadFen(fen: string, moves?: string[]): void {
    let lastMove: [Key, Key] = undefined;
    if (moves) {
      this.currentMoveIdx = -1;
      this.moves = [];
      this.chess.reset();

      moves.forEach((fullMove) => {
        fullMove.split(" ").forEach((halfMove) => {
          const move = this.chess.move(halfMove);
          this.moves.push(move);
          this.currentMoveIdx++;
        });
      });

      if (this.currentMoveIdx >= 0) {
        const move = this.moves[this.currentMoveIdx];
        lastMove = [move.from, move.to];
      }
    } else {
      this.chess.load(fen);
    }

    this.cg.set({ fen: this.chess.fen(), lastMove });
    this.sync_board_with_gamestate();
  }

	/* Adds an "Init" button to reset the board to the PGN/FEN-defined starting position */
	async loadInitialPosition() {
		console.log("Init via user_config");

		if (this.user_config?.pgn && this.user_config.pgn.trim() !== "") {
			console.log("PGN to load :", this.user_config.pgn);
			const loaded = this.chess.load_pgn(this.user_config.pgn);

			if (!loaded) {
				console.warn("Invalid PGN !");
				new Notice("Invalid PGN !");
				return;
			}

			this.moves = this.chess.history({ verbose: true });
			this.currentMoveIdx = -1;

			console.log("Replay moves via update_turn_idx()");
			this.update_turn_idx(this.moves.length - 1); // ← that's what updates the visual
		} else {
			console.log("No PGN defined → complete reset");
			this.chess.reset();
			this.moves = [];
			this.currentMoveIdx = -1;
			this.sync_board_with_gamestate();
		}
	}
}
