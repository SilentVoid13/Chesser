import { ChessboardSettings } from "./ChessboardSettings";

export interface ChessboardConfig extends ChessboardSettings {
    fen: string;
}

const ORIENTATIONS = ["white", "black"];
export const PIECE_STYLES = ["alpha", "california", "cardinal", "cburnett", "chess7", "chessnut", "companion", "dubrovny", "fantasy", "fresca", "gioco", "governor", "horsey", "icpieces", "kosal", "leipzig", "letter", "libra", "maestro", "merida", "pirouetti", "pixel", "reillycraig", "riohacha", "shapes", "spatial", "staunty", "tatiana"];
export const BOARD_STYLES = ["blue", "brown", "green", "ic", "purple"];

export function parse_user_config(settings: ChessboardSettings, content: string) {
    let default_chessboard_config: ChessboardConfig = {
        ...settings,
        fen: "",
    };

    const user_config: ChessboardConfig = {
        fen: parse_field(content, "fen") ?? default_chessboard_config.fen,
        orientation: check_valid_value(parse_field(content, "orientation"), ORIENTATIONS) ?? default_chessboard_config.orientation,
        viewOnly: convert_boolean(parse_field(content, "viewOnly")) ?? default_chessboard_config.viewOnly,
        drawable: convert_boolean(parse_field(content, "drawable")) ?? default_chessboard_config.drawable,
        free: convert_boolean(parse_field(content, "free")) ?? default_chessboard_config.free,
        pieceStyle: check_valid_value(parse_field(content, "pieceStyle"), PIECE_STYLES) ?? default_chessboard_config.pieceStyle,
        boardStyle: check_valid_value(parse_field(content, "boardStyle"), BOARD_STYLES) ?? default_chessboard_config.boardStyle,
    };
    console.log("user_config:", user_config);

    return user_config;
}

function parse_field(content: string, field_name: string): string {
    let regex = new RegExp(`${field_name}:(.*)`);
    let matches = regex.exec(content);
    if (!matches) {
        return null;
    }
    return matches[1].trim();
}

function check_valid_value(v: string, values: string[]) {
    if (values.contains(v)) {
        return v;
    }
    return null;
}

export function convert_boolean(v: string) {
    switch (v) {
        case "true":
            return true;
        case "false":
            return false;
        default:
            return null;
    }
}