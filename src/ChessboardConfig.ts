export interface ChessboardConfig {
    fen: string;
    orientation: string;
    viewOnly: boolean;
    drawable: boolean;
    free: boolean;
    pieceStyle: string;
    boardStyle: string;
}

const default_chessboard_config: ChessboardConfig = {
    fen: "",
    orientation: "white",
    viewOnly: false,
    drawable: true,
    free: false,
    pieceStyle: "cburnett",
    boardStyle: "brown",
};

export function parse_user_config(content: string) {
    const user_config: ChessboardConfig = {
        fen: parse_field(content, "fen") ?? default_chessboard_config.fen,
        orientation: parse_field(content, "orientation") ?? default_chessboard_config.orientation,
        viewOnly: convert_boolean(parse_field(content, "viewOnly")) ?? default_chessboard_config.viewOnly,
        drawable: convert_boolean(parse_field(content, "drawable")) ?? default_chessboard_config.drawable,
        free: convert_boolean(parse_field(content, "free")) ?? default_chessboard_config.free,
        pieceStyle: parse_field(content, "pieceStyle") ?? default_chessboard_config.pieceStyle,
        boardStyle: parse_field(content, "boardStyle") ?? default_chessboard_config.boardStyle,
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

function convert_boolean(v: string) {
    switch (v) {
        case "true":
            return true;
        case "false":
            return false;
        default:
            return null;
    }
}