import { ChesserSettings } from "./ChesserSettings";

export interface ChesserConfig extends ChesserSettings {
    fen: string;
}

const ORIENTATIONS = ["white", "black"];
export const PIECE_STYLES = ["alpha", "california", "cardinal", "cburnett", "chess7", "chessnut", "companion", "dubrovny", "fantasy", "fresca", "gioco", "governor", "horsey", "icpieces", "kosal", "leipzig", "letter", "libra", "maestro", "merida", "pirouetti", "pixel", "reillycraig", "riohacha", "shapes", "spatial", "staunty", "tatiana"];
export const BOARD_STYLES = ["blue", "brown", "green", "ic", "purple"];

export function parse_user_config(settings: ChesserSettings, content: string) {
    let default_chesser_config: ChesserConfig = {
        ...settings,
        fen: "",
    };

    // Kinda ugly way of parsing the user config, but I couldn't find something better
    const user_config: ChesserConfig = {
        fen: parse_field(content, "fen") ?? default_chesser_config.fen,
        orientation: check_valid_value(parse_field(content, "orientation"), ORIENTATIONS) ?? default_chesser_config.orientation,
        viewOnly: convert_boolean(parse_field(content, "viewOnly")) ?? default_chesser_config.viewOnly,
        drawable: convert_boolean(parse_field(content, "drawable")) ?? default_chesser_config.drawable,
        free: convert_boolean(parse_field(content, "free")) ?? default_chesser_config.free,
        pieceStyle: check_valid_value(parse_field(content, "pieceStyle"), PIECE_STYLES) ?? default_chesser_config.pieceStyle,
        boardStyle: check_valid_value(parse_field(content, "boardStyle"), BOARD_STYLES) ?? default_chesser_config.boardStyle,
    };

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
    if (!v) {
        return null;
    }
    switch (v.toLowerCase()) {
        case "true":
            return true;
        case "false":
            return false;
        default:
            return null;
    }
}