import { MarkdownPostProcessorContext } from "obsidian";

import { ChessboardConfig, parse_user_config } from "./ChessboardConfig";

import { Chess, ChessInstance } from 'chess.js';
import { Chessground }  from 'chessground';
import { Api } from "chessground/api";
import { Color, Key } from "chessground/types";

// To bundle it with rollup
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

export function draw_chessboard(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    let user_config = parse_user_config(source);
    console.log("user_config:", user_config);

    new Chessboard(el, user_config);
}

export class Chessboard {
    cg: Api;
    chess: ChessInstance;

    constructor(el: HTMLElement, user_config: ChessboardConfig) {
        let div = this.set_style(el, user_config.pieceStyle, user_config.boardStyle);

        if (user_config.fen === "") {
            this.chess = new Chess();
        }
        else {
            this.chess = new Chess(user_config.fen);
        }

        const cg_config = {
            fen: user_config.fen,
            orientation: user_config.orientation,
            viewOnly: user_config.viewOnly,
            drawable: {
                enabled: user_config.drawable,
            },
        };

        this.cg = Chessground(div, cg_config);

        // Activates the chess logic
        if (!user_config.viewOnly && !user_config.free) {
            this.cg.set({
                movable: {
                    free: false,
                    dests: this.dests(),
                    events: {
                        after: this.refresh_moves(),
                    }
                }
            });
        }

    }

    set_style(el: HTMLElement, pieceStyle: string, boardStyle: string) {
        let div = document.createElement("div");
        el.addClass(pieceStyle);
        el.addClass(`${boardStyle}-board`)
        el.appendChild(div);
        return div;
    }

    color_turn(): Color {
        return (this.chess.turn() === 'w') ? 'white' : 'black';
    }

    dests(): Map<Key, Key[]> {
        const dests = new Map();
        this.chess.SQUARES.forEach(s => {
            const ms = this.chess.moves({square: s, verbose: true});
            if (ms.length) dests.set(s, ms.map(m => m.to));
        });
        return dests;
    }

    check(): boolean {
        return this.chess.in_check();
    }

    refresh_moves() {
        return (orig: any, dest: any) => {
            this.chess.move({from: orig, to: dest});
            this.cg.set({
                check: this.check(),
                turnColor: this.color_turn(),
                movable: {
                    color: this.color_turn(),
                    dests: this.dests(),
                }
            });
        }
    }
}