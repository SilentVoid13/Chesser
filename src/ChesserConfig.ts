import { parseYaml } from "obsidian";

import { ChesserSettings } from "./ChesserSettings";

export interface ChesserConfig extends ChesserSettings {
  id?: string;
  fen: string;
  pgn?: string;
  shapes?: any;
  currentMoveIdx?: number;
  moves?: string[];
}

const ORIENTATIONS = ["white", "black"];
export const PIECE_STYLES = [
  "alpha",
  "california",
  "cardinal",
  "cburnett",
  "chess7",
  "chessnut",
  "companion",
  "dubrovny",
  "fantasy",
  "fresca",
  "gioco",
  "governor",
  "horsey",
  "icpieces",
  "kosal",
  "leipzig",
  "letter",
  "libra",
  "maestro",
  "merida",
  "pirouetti",
  "pixel",
  "reillycraig",
  "riohacha",
  "shapes",
  "spatial",
  "staunty",
  "tatiana",
];
export const BOARD_STYLES = ["blue", "brown", "green", "ic", "purple"];

export function parse_user_config(
  settings: ChesserSettings,
  content: string
): ChesserConfig {
  let userConfig: ChesserConfig = {
    ...settings,
    fen: "",
  };

  try {
    return {
      ...userConfig,
      ...parseYaml(content),
    };
  } catch (e) {
    // failed to parse
    return userConfig;
  }
}
