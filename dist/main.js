'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

let nanoid = (size = 21) =>
  crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
    byte &= 63;
    if (byte < 36) {
      id += byte.toString(36);
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte > 62) {
      id += '-';
    } else {
      id += '_';
    }
    return id
  }, '');

var chess = {};

/*
 * Copyright (c) 2021, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/

(function (exports) {
var Chess = function (fen) {
  var BLACK = 'b';
  var WHITE = 'w';

  var EMPTY = -1;

  var PAWN = 'p';
  var KNIGHT = 'n';
  var BISHOP = 'b';
  var ROOK = 'r';
  var QUEEN = 'q';
  var KING = 'k';

  var SYMBOLS = 'pnbrqkPNBRQK';

  var DEFAULT_POSITION =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  var TERMINATION_MARKERS = ['1-0', '0-1', '1/2-1/2', '*'];

  var PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15],
  };

  var PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1],
  };

  // prettier-ignore
  var ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
  ];

  // prettier-ignore
  var RAYS = [
     17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
      0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
      0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
      0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
      0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
      1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
      0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
      0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
      0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
      0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
    -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
  ];

  var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

  var FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b',
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q',
  };

  var BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64,
  };

  var RANK_1 = 7;
  var RANK_2 = 6;
  var RANK_7 = 1;
  var RANK_8 = 0;

  // prettier-ignore
  var SQUARES = {
    a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
    a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
    a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
    a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
    a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
    a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
    a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
  };

  var ROOKS = {
    w: [
      { square: SQUARES.a1, flag: BITS.QSIDE_CASTLE },
      { square: SQUARES.h1, flag: BITS.KSIDE_CASTLE },
    ],
    b: [
      { square: SQUARES.a8, flag: BITS.QSIDE_CASTLE },
      { square: SQUARES.h8, flag: BITS.KSIDE_CASTLE },
    ],
  };

  var board = new Array(128);
  var kings = { w: EMPTY, b: EMPTY };
  var turn = WHITE;
  var castling = { w: 0, b: 0 };
  var ep_square = EMPTY;
  var half_moves = 0;
  var move_number = 1;
  var history = [];
  var header = {};
  var comments = {};

  /* if the user passes in a fen string, load it, else default to
   * starting position
   */
  if (typeof fen === 'undefined') {
    load(DEFAULT_POSITION);
  } else {
    load(fen);
  }

  function clear(keep_headers) {
    if (typeof keep_headers === 'undefined') {
      keep_headers = false;
    }

    board = new Array(128);
    kings = { w: EMPTY, b: EMPTY };
    turn = WHITE;
    castling = { w: 0, b: 0 };
    ep_square = EMPTY;
    half_moves = 0;
    move_number = 1;
    history = [];
    if (!keep_headers) header = {};
    comments = {};
    update_setup(generate_fen());
  }

  function prune_comments() {
    var reversed_history = [];
    var current_comments = {};
    var copy_comment = function (fen) {
      if (fen in comments) {
        current_comments[fen] = comments[fen];
      }
    };
    while (history.length > 0) {
      reversed_history.push(undo_move());
    }
    copy_comment(generate_fen());
    while (reversed_history.length > 0) {
      make_move(reversed_history.pop());
      copy_comment(generate_fen());
    }
    comments = current_comments;
  }

  function reset() {
    load(DEFAULT_POSITION);
  }

  function load(fen, keep_headers) {
    if (typeof keep_headers === 'undefined') {
      keep_headers = false;
    }

    var tokens = fen.split(/\s+/);
    var position = tokens[0];
    var square = 0;

    if (!validate_fen(fen).valid) {
      return false
    }

    clear(keep_headers);

    for (var i = 0; i < position.length; i++) {
      var piece = position.charAt(i);

      if (piece === '/') {
        square += 8;
      } else if (is_digit(piece)) {
        square += parseInt(piece, 10);
      } else {
        var color = piece < 'a' ? WHITE : BLACK;
        put({ type: piece.toLowerCase(), color: color }, algebraic(square));
        square++;
      }
    }

    turn = tokens[1];

    if (tokens[2].indexOf('K') > -1) {
      castling.w |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('Q') > -1) {
      castling.w |= BITS.QSIDE_CASTLE;
    }
    if (tokens[2].indexOf('k') > -1) {
      castling.b |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('q') > -1) {
      castling.b |= BITS.QSIDE_CASTLE;
    }

    ep_square = tokens[3] === '-' ? EMPTY : SQUARES[tokens[3]];
    half_moves = parseInt(tokens[4], 10);
    move_number = parseInt(tokens[5], 10);

    update_setup(generate_fen());

    return true
  }

  /* TODO: this function is pretty much crap - it validates structure but
   * completely ignores content (e.g. doesn't verify that each side has a king)
   * ... we should rewrite this, and ditch the silly error_number field while
   * we're at it
   */
  function validate_fen(fen) {
    var errors = {
      0: 'No errors.',
      1: 'FEN string must contain six space-delimited fields.',
      2: '6th field (move number) must be a positive integer.',
      3: '5th field (half move counter) must be a non-negative integer.',
      4: '4th field (en-passant square) is invalid.',
      5: '3rd field (castling availability) is invalid.',
      6: '2nd field (side to move) is invalid.',
      7: "1st field (piece positions) does not contain 8 '/'-delimited rows.",
      8: '1st field (piece positions) is invalid [consecutive numbers].',
      9: '1st field (piece positions) is invalid [invalid piece].',
      10: '1st field (piece positions) is invalid [row too large].',
      11: 'Illegal en-passant square',
    };

    /* 1st criterion: 6 space-seperated fields? */
    var tokens = fen.split(/\s+/);
    if (tokens.length !== 6) {
      return { valid: false, error_number: 1, error: errors[1] }
    }

    /* 2nd criterion: move number field is a integer value > 0? */
    if (isNaN(tokens[5]) || parseInt(tokens[5], 10) <= 0) {
      return { valid: false, error_number: 2, error: errors[2] }
    }

    /* 3rd criterion: half move counter is an integer >= 0? */
    if (isNaN(tokens[4]) || parseInt(tokens[4], 10) < 0) {
      return { valid: false, error_number: 3, error: errors[3] }
    }

    /* 4th criterion: 4th field is a valid e.p.-string? */
    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
      return { valid: false, error_number: 4, error: errors[4] }
    }

    /* 5th criterion: 3th field is a valid castle-string? */
    if (!/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
      return { valid: false, error_number: 5, error: errors[5] }
    }

    /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
    if (!/^(w|b)$/.test(tokens[1])) {
      return { valid: false, error_number: 6, error: errors[6] }
    }

    /* 7th criterion: 1st field contains 8 rows? */
    var rows = tokens[0].split('/');
    if (rows.length !== 8) {
      return { valid: false, error_number: 7, error: errors[7] }
    }

    /* 8th criterion: every row is valid? */
    for (var i = 0; i < rows.length; i++) {
      /* check for right sum of fields AND not two numbers in succession */
      var sum_fields = 0;
      var previous_was_number = false;

      for (var k = 0; k < rows[i].length; k++) {
        if (!isNaN(rows[i][k])) {
          if (previous_was_number) {
            return { valid: false, error_number: 8, error: errors[8] }
          }
          sum_fields += parseInt(rows[i][k], 10);
          previous_was_number = true;
        } else {
          if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
            return { valid: false, error_number: 9, error: errors[9] }
          }
          sum_fields += 1;
          previous_was_number = false;
        }
      }
      if (sum_fields !== 8) {
        return { valid: false, error_number: 10, error: errors[10] }
      }
    }

    if (
      (tokens[3][1] == '3' && tokens[1] == 'w') ||
      (tokens[3][1] == '6' && tokens[1] == 'b')
    ) {
      return { valid: false, error_number: 11, error: errors[11] }
    }

    /* everything's okay! */
    return { valid: true, error_number: 0, error: errors[0] }
  }

  function generate_fen() {
    var empty = 0;
    var fen = '';

    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (board[i] == null) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        var color = board[i].color;
        var piece = board[i].type;

        fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
      }

      if ((i + 1) & 0x88) {
        if (empty > 0) {
          fen += empty;
        }

        if (i !== SQUARES.h1) {
          fen += '/';
        }

        empty = 0;
        i += 8;
      }
    }

    var cflags = '';
    if (castling[WHITE] & BITS.KSIDE_CASTLE) {
      cflags += 'K';
    }
    if (castling[WHITE] & BITS.QSIDE_CASTLE) {
      cflags += 'Q';
    }
    if (castling[BLACK] & BITS.KSIDE_CASTLE) {
      cflags += 'k';
    }
    if (castling[BLACK] & BITS.QSIDE_CASTLE) {
      cflags += 'q';
    }

    /* do we have an empty castling flag? */
    cflags = cflags || '-';
    var epflags = ep_square === EMPTY ? '-' : algebraic(ep_square);

    return [fen, turn, cflags, epflags, half_moves, move_number].join(' ')
  }

  function set_header(args) {
    for (var i = 0; i < args.length; i += 2) {
      if (typeof args[i] === 'string' && typeof args[i + 1] === 'string') {
        header[args[i]] = args[i + 1];
      }
    }
    return header
  }

  /* called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object.  if the FEN is
   * equal to the default position, the SetUp and FEN are deleted
   * the setup is only updated if history.length is zero, ie moves haven't been
   * made.
   */
  function update_setup(fen) {
    if (history.length > 0) return

    if (fen !== DEFAULT_POSITION) {
      header['SetUp'] = '1';
      header['FEN'] = fen;
    } else {
      delete header['SetUp'];
      delete header['FEN'];
    }
  }

  function get(square) {
    var piece = board[SQUARES[square]];
    return piece ? { type: piece.type, color: piece.color } : null
  }

  function put(piece, square) {
    /* check for valid piece object */
    if (!('type' in piece && 'color' in piece)) {
      return false
    }

    /* check for piece */
    if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
      return false
    }

    /* check for valid square */
    if (!(square in SQUARES)) {
      return false
    }

    var sq = SQUARES[square];

    /* don't let the user place more than one king */
    if (
      piece.type == KING &&
      !(kings[piece.color] == EMPTY || kings[piece.color] == sq)
    ) {
      return false
    }

    board[sq] = { type: piece.type, color: piece.color };
    if (piece.type === KING) {
      kings[piece.color] = sq;
    }

    update_setup(generate_fen());

    return true
  }

  function remove(square) {
    var piece = get(square);
    board[SQUARES[square]] = null;
    if (piece && piece.type === KING) {
      kings[piece.color] = EMPTY;
    }

    update_setup(generate_fen());

    return piece
  }

  function build_move(board, from, to, flags, promotion) {
    var move = {
      color: turn,
      from: from,
      to: to,
      flags: flags,
      piece: board[from].type,
    };

    if (promotion) {
      move.flags |= BITS.PROMOTION;
      move.promotion = promotion;
    }

    if (board[to]) {
      move.captured = board[to].type;
    } else if (flags & BITS.EP_CAPTURE) {
      move.captured = PAWN;
    }
    return move
  }

  function generate_moves(options) {
    function add_move(board, moves, from, to, flags) {
      /* if pawn promotion */
      if (
        board[from].type === PAWN &&
        (rank(to) === RANK_8 || rank(to) === RANK_1)
      ) {
        var pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
        for (var i = 0, len = pieces.length; i < len; i++) {
          moves.push(build_move(board, from, to, flags, pieces[i]));
        }
      } else {
        moves.push(build_move(board, from, to, flags));
      }
    }

    var moves = [];
    var us = turn;
    var them = swap_color(us);
    var second_rank = { b: RANK_7, w: RANK_2 };

    var first_sq = SQUARES.a8;
    var last_sq = SQUARES.h1;
    var single_square = false;

    /* do we want legal moves? */
    var legal =
      typeof options !== 'undefined' && 'legal' in options
        ? options.legal
        : true;

    var piece_type =
      typeof options !== 'undefined' &&
      'piece' in options &&
      typeof options.piece === 'string'
        ? options.piece.toLowerCase()
        : true;

    /* are we generating moves for a single square? */
    if (typeof options !== 'undefined' && 'square' in options) {
      if (options.square in SQUARES) {
        first_sq = last_sq = SQUARES[options.square];
        single_square = true;
      } else {
        /* invalid square */
        return []
      }
    }

    for (var i = first_sq; i <= last_sq; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) {
        i += 7;
        continue
      }

      var piece = board[i];
      if (piece == null || piece.color !== us) {
        continue
      }

      if (piece.type === PAWN && (piece_type === true || piece_type === PAWN)) {
        /* single square, non-capturing */
        var square = i + PAWN_OFFSETS[us][0];
        if (board[square] == null) {
          add_move(board, moves, i, square, BITS.NORMAL);

          /* double square */
          var square = i + PAWN_OFFSETS[us][1];
          if (second_rank[us] === rank(i) && board[square] == null) {
            add_move(board, moves, i, square, BITS.BIG_PAWN);
          }
        }

        /* pawn captures */
        for (j = 2; j < 4; j++) {
          var square = i + PAWN_OFFSETS[us][j];
          if (square & 0x88) continue

          if (board[square] != null && board[square].color === them) {
            add_move(board, moves, i, square, BITS.CAPTURE);
          } else if (square === ep_square) {
            add_move(board, moves, i, ep_square, BITS.EP_CAPTURE);
          }
        }
      } else if (piece_type === true || piece_type === piece.type) {
        for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
          var offset = PIECE_OFFSETS[piece.type][j];
          var square = i;

          while (true) {
            square += offset;
            if (square & 0x88) break

            if (board[square] == null) {
              add_move(board, moves, i, square, BITS.NORMAL);
            } else {
              if (board[square].color === us) break
              add_move(board, moves, i, square, BITS.CAPTURE);
              break
            }

            /* break, if knight or king */
            if (piece.type === 'n' || piece.type === 'k') break
          }
        }
      }
    }

    /* check for castling if: a) we're generating all moves, or b) we're doing
     * single square move generation on the king's square
     */
    if (piece_type === true || piece_type === KING) {
      if (!single_square || last_sq === kings[us]) {
        /* king-side castling */
        if (castling[us] & BITS.KSIDE_CASTLE) {
          var castling_from = kings[us];
          var castling_to = castling_from + 2;

          if (
            board[castling_from + 1] == null &&
            board[castling_to] == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from + 1) &&
            !attacked(them, castling_to)
          ) {
            add_move(board, moves, kings[us], castling_to, BITS.KSIDE_CASTLE);
          }
        }

        /* queen-side castling */
        if (castling[us] & BITS.QSIDE_CASTLE) {
          var castling_from = kings[us];
          var castling_to = castling_from - 2;

          if (
            board[castling_from - 1] == null &&
            board[castling_from - 2] == null &&
            board[castling_from - 3] == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from - 1) &&
            !attacked(them, castling_to)
          ) {
            add_move(board, moves, kings[us], castling_to, BITS.QSIDE_CASTLE);
          }
        }
      }
    }

    /* return all pseudo-legal moves (this includes moves that allow the king
     * to be captured)
     */
    if (!legal) {
      return moves
    }

    /* filter out illegal moves */
    var legal_moves = [];
    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i]);
      if (!king_attacked(us)) {
        legal_moves.push(moves[i]);
      }
      undo_move();
    }

    return legal_moves
  }

  /* convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   *
   * @param {boolean} sloppy Use the sloppy SAN generator to work around over
   * disambiguation bugs in Fritz and Chessbase.  See below:
   *
   * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
   * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
   * 4. ... Ne7 is technically the valid SAN
   */
  function move_to_san(move, moves) {
    var output = '';

    if (move.flags & BITS.KSIDE_CASTLE) {
      output = 'O-O';
    } else if (move.flags & BITS.QSIDE_CASTLE) {
      output = 'O-O-O';
    } else {
      if (move.piece !== PAWN) {
        var disambiguator = get_disambiguator(move, moves);
        output += move.piece.toUpperCase() + disambiguator;
      }

      if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        if (move.piece === PAWN) {
          output += algebraic(move.from)[0];
        }
        output += 'x';
      }

      output += algebraic(move.to);

      if (move.flags & BITS.PROMOTION) {
        output += '=' + move.promotion.toUpperCase();
      }
    }

    make_move(move);
    if (in_check()) {
      if (in_checkmate()) {
        output += '#';
      } else {
        output += '+';
      }
    }
    undo_move();

    return output
  }
  // parses all of the decorators out of a SAN string
  function stripped_san(move) {
    return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '')
  }

  function attacked(color, square) {
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) {
        i += 7;
        continue
      }

      /* if empty square or wrong color */
      if (board[i] == null || board[i].color !== color) continue

      var piece = board[i];
      var difference = i - square;
      var index = difference + 119;

      if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
        if (piece.type === PAWN) {
          if (difference > 0) {
            if (piece.color === WHITE) return true
          } else {
            if (piece.color === BLACK) return true
          }
          continue
        }

        /* if the piece is a knight or a king */
        if (piece.type === 'n' || piece.type === 'k') return true

        var offset = RAYS[index];
        var j = i + offset;

        var blocked = false;
        while (j !== square) {
          if (board[j] != null) {
            blocked = true;
            break
          }
          j += offset;
        }

        if (!blocked) return true
      }
    }

    return false
  }

  function king_attacked(color) {
    return attacked(swap_color(color), kings[color])
  }

  function in_check() {
    return king_attacked(turn)
  }

  function in_checkmate() {
    return in_check() && generate_moves().length === 0
  }

  function in_stalemate() {
    return !in_check() && generate_moves().length === 0
  }

  function insufficient_material() {
    var pieces = {};
    var bishops = [];
    var num_pieces = 0;
    var sq_color = 0;

    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      sq_color = (sq_color + 1) % 2;
      if (i & 0x88) {
        i += 7;
        continue
      }

      var piece = board[i];
      if (piece) {
        pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1;
        if (piece.type === BISHOP) {
          bishops.push(sq_color);
        }
        num_pieces++;
      }
    }

    /* k vs. k */
    if (num_pieces === 2) {
      return true
    } else if (
      /* k vs. kn .... or .... k vs. kb */
      num_pieces === 3 &&
      (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)
    ) {
      return true
    } else if (num_pieces === pieces[BISHOP] + 2) {
      /* kb vs. kb where any number of bishops are all on the same color */
      var sum = 0;
      var len = bishops.length;
      for (var i = 0; i < len; i++) {
        sum += bishops[i];
      }
      if (sum === 0 || sum === len) {
        return true
      }
    }

    return false
  }

  function in_threefold_repetition() {
    /* TODO: while this function is fine for casual use, a better
     * implementation would use a Zobrist key (instead of FEN). the
     * Zobrist key would be maintained in the make_move/undo_move functions,
     * avoiding the costly that we do below.
     */
    var moves = [];
    var positions = {};
    var repetition = false;

    while (true) {
      var move = undo_move();
      if (!move) break
      moves.push(move);
    }

    while (true) {
      /* remove the last two fields in the FEN string, they're not needed
       * when checking for draw by rep */
      var fen = generate_fen().split(' ').slice(0, 4).join(' ');

      /* has the position occurred three or move times */
      positions[fen] = fen in positions ? positions[fen] + 1 : 1;
      if (positions[fen] >= 3) {
        repetition = true;
      }

      if (!moves.length) {
        break
      }
      make_move(moves.pop());
    }

    return repetition
  }

  function push(move) {
    history.push({
      move: move,
      kings: { b: kings.b, w: kings.w },
      turn: turn,
      castling: { b: castling.b, w: castling.w },
      ep_square: ep_square,
      half_moves: half_moves,
      move_number: move_number,
    });
  }

  function make_move(move) {
    var us = turn;
    var them = swap_color(us);
    push(move);

    board[move.to] = board[move.from];
    board[move.from] = null;

    /* if ep capture, remove the captured pawn */
    if (move.flags & BITS.EP_CAPTURE) {
      if (turn === BLACK) {
        board[move.to - 16] = null;
      } else {
        board[move.to + 16] = null;
      }
    }

    /* if pawn promotion, replace with new piece */
    if (move.flags & BITS.PROMOTION) {
      board[move.to] = { type: move.promotion, color: us };
    }

    /* if we moved the king */
    if (board[move.to].type === KING) {
      kings[board[move.to].color] = move.to;

      /* if we castled, move the rook next to the king */
      if (move.flags & BITS.KSIDE_CASTLE) {
        var castling_to = move.to - 1;
        var castling_from = move.to + 1;
        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        var castling_to = move.to + 1;
        var castling_from = move.to - 2;
        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      }

      /* turn off castling */
      castling[us] = '';
    }

    /* turn off castling if we move a rook */
    if (castling[us]) {
      for (var i = 0, len = ROOKS[us].length; i < len; i++) {
        if (
          move.from === ROOKS[us][i].square &&
          castling[us] & ROOKS[us][i].flag
        ) {
          castling[us] ^= ROOKS[us][i].flag;
          break
        }
      }
    }

    /* turn off castling if we capture a rook */
    if (castling[them]) {
      for (var i = 0, len = ROOKS[them].length; i < len; i++) {
        if (
          move.to === ROOKS[them][i].square &&
          castling[them] & ROOKS[them][i].flag
        ) {
          castling[them] ^= ROOKS[them][i].flag;
          break
        }
      }
    }

    /* if big pawn move, update the en passant square */
    if (move.flags & BITS.BIG_PAWN) {
      if (turn === 'b') {
        ep_square = move.to - 16;
      } else {
        ep_square = move.to + 16;
      }
    } else {
      ep_square = EMPTY;
    }

    /* reset the 50 move counter if a pawn is moved or a piece is captured */
    if (move.piece === PAWN) {
      half_moves = 0;
    } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      half_moves = 0;
    } else {
      half_moves++;
    }

    if (turn === BLACK) {
      move_number++;
    }
    turn = swap_color(turn);
  }

  function undo_move() {
    var old = history.pop();
    if (old == null) {
      return null
    }

    var move = old.move;
    kings = old.kings;
    turn = old.turn;
    castling = old.castling;
    ep_square = old.ep_square;
    half_moves = old.half_moves;
    move_number = old.move_number;

    var us = turn;
    var them = swap_color(turn);

    board[move.from] = board[move.to];
    board[move.from].type = move.piece; // to undo any promotions
    board[move.to] = null;

    if (move.flags & BITS.CAPTURE) {
      board[move.to] = { type: move.captured, color: them };
    } else if (move.flags & BITS.EP_CAPTURE) {
      var index;
      if (us === BLACK) {
        index = move.to - 16;
      } else {
        index = move.to + 16;
      }
      board[index] = { type: PAWN, color: them };
    }

    if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
      var castling_to, castling_from;
      if (move.flags & BITS.KSIDE_CASTLE) {
        castling_to = move.to + 1;
        castling_from = move.to - 1;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        castling_to = move.to - 2;
        castling_from = move.to + 1;
      }

      board[castling_to] = board[castling_from];
      board[castling_from] = null;
    }

    return move
  }

  /* this function is used to uniquely identify ambiguous moves */
  function get_disambiguator(move, moves) {
    var from = move.from;
    var to = move.to;
    var piece = move.piece;

    var ambiguities = 0;
    var same_rank = 0;
    var same_file = 0;

    for (var i = 0, len = moves.length; i < len; i++) {
      var ambig_from = moves[i].from;
      var ambig_to = moves[i].to;
      var ambig_piece = moves[i].piece;

      /* if a move of the same piece type ends on the same to square, we'll
       * need to add a disambiguator to the algebraic notation
       */
      if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
        ambiguities++;

        if (rank(from) === rank(ambig_from)) {
          same_rank++;
        }

        if (file(from) === file(ambig_from)) {
          same_file++;
        }
      }
    }

    if (ambiguities > 0) {
      /* if there exists a similar moving piece on the same rank and file as
       * the move in question, use the square as the disambiguator
       */
      if (same_rank > 0 && same_file > 0) {
        return algebraic(from)
      } else if (same_file > 0) {
        /* if the moving piece rests on the same file, use the rank symbol as the
         * disambiguator
         */
        return algebraic(from).charAt(1)
      } else {
        /* else use the file symbol */
        return algebraic(from).charAt(0)
      }
    }

    return ''
  }

  function infer_piece_type(san) {
    var piece_type = san.charAt(0);
    if (piece_type >= 'a' && piece_type <= 'h') {
      var matches = san.match(/[a-h]\d.*[a-h]\d/);
      if (matches) {
        return undefined
      }
      return PAWN
    }
    piece_type = piece_type.toLowerCase();
    if (piece_type === 'o') {
      return KING
    }
    return piece_type
  }
  function ascii() {
    var s = '   +------------------------+\n';
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* display the rank */
      if (file(i) === 0) {
        s += ' ' + '87654321'[rank(i)] + ' |';
      }

      /* empty piece */
      if (board[i] == null) {
        s += ' . ';
      } else {
        var piece = board[i].type;
        var color = board[i].color;
        var symbol = color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
        s += ' ' + symbol + ' ';
      }

      if ((i + 1) & 0x88) {
        s += '|\n';
        i += 8;
      }
    }
    s += '   +------------------------+\n';
    s += '     a  b  c  d  e  f  g  h\n';

    return s
  }

  // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
  function move_from_san(move, sloppy) {
    // strip off any move decorations: e.g Nf3+?! becomes Nf3
    var clean_move = stripped_san(move);

    var overly_disambiguated = false;

    if (sloppy) {
      // The sloppy parser allows the user to parse non-standard chess
      // notations. This parser is opt-in (by specifying the
      // '{ sloppy: true }' setting) and is only run after the Standard
      // Algebraic Notation (SAN) parser has failed.
      //
      // When running the sloppy parser, we'll run a regex to grab the piece,
      // the to/from square, and an optional promotion piece. This regex will
      // parse common non-standard notation like: Pe2-e4, Rc1c4, Qf3xf7, f7f8q,
      // b1c3

      // NOTE: Some positions and moves may be ambiguous when using the sloppy
      // parser. For example, in this position: 6k1/8/8/B7/8/8/8/BN4K1 w - - 0 1,
      // the move b1c3 may be interpreted as Nc3 or B1c3 (a disambiguated
      // bishop move). In these cases, the sloppy parser will default to the
      // most most basic interpretation - b1c3 parses to Nc3.

      var matches = clean_move.match(
        /([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/
      );
      if (matches) {
        var piece = matches[1];
        var from = matches[2];
        var to = matches[3];
        var promotion = matches[4];

        if (from.length == 1) {
          overly_disambiguated = true;
        }
      } else {
        // The [a-h]?[1-8]? portion of the regex below handles moves that may
        // be overly disambiguated (e.g. Nge7 is unnecessary and non-standard
        // when there is one legal knight move to e7). In this case, the value
        // of 'from' variable will be a rank or file, not a square.
        var matches = clean_move.match(
          /([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/
        );

        if (matches) {
          var piece = matches[1];
          var from = matches[2];
          var to = matches[3];
          var promotion = matches[4];

          if (from.length == 1) {
            var overly_disambiguated = true;
          }
        }
      }
    }

    var piece_type = infer_piece_type(clean_move);
    var moves = generate_moves({
      legal: true,
      piece: piece ? piece : piece_type,
    });

    for (var i = 0, len = moves.length; i < len; i++) {
      // try the strict parser first, then the sloppy parser if requested
      // by the user
      if (clean_move === stripped_san(move_to_san(moves[i], moves))) {
        return moves[i]
      } else {
        if (sloppy && matches) {
          // hand-compare move properties with the results from our sloppy
          // regex
          if (
            (!piece || piece.toLowerCase() == moves[i].piece) &&
            SQUARES[from] == moves[i].from &&
            SQUARES[to] == moves[i].to &&
            (!promotion || promotion.toLowerCase() == moves[i].promotion)
          ) {
            return moves[i]
          } else if (overly_disambiguated) {
            // SPECIAL CASE: we parsed a move string that may have an unneeded
            // rank/file disambiguator (e.g. Nge7).  The 'from' variable will
            var square = algebraic(moves[i].from);
            if (
              (!piece || piece.toLowerCase() == moves[i].piece) &&
              SQUARES[to] == moves[i].to &&
              (from == square[0] || from == square[1]) &&
              (!promotion || promotion.toLowerCase() == moves[i].promotion)
            ) {
              return moves[i]
            }
          }
        }
      }
    }

    return null
  }

  /*****************************************************************************
   * UTILITY FUNCTIONS
   ****************************************************************************/
  function rank(i) {
    return i >> 4
  }

  function file(i) {
    return i & 15
  }

  function algebraic(i) {
    var f = file(i),
      r = rank(i);
    return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1)
  }

  function swap_color(c) {
    return c === WHITE ? BLACK : WHITE
  }

  function is_digit(c) {
    return '0123456789'.indexOf(c) !== -1
  }

  /* pretty = external move object */
  function make_pretty(ugly_move) {
    var move = clone(ugly_move);
    move.san = move_to_san(move, generate_moves({ legal: true }));
    move.to = algebraic(move.to);
    move.from = algebraic(move.from);

    var flags = '';

    for (var flag in BITS) {
      if (BITS[flag] & move.flags) {
        flags += FLAGS[flag];
      }
    }
    move.flags = flags;

    return move
  }

  function clone(obj) {
    var dupe = obj instanceof Array ? [] : {};

    for (var property in obj) {
      if (typeof property === 'object') {
        dupe[property] = clone(obj[property]);
      } else {
        dupe[property] = obj[property];
      }
    }

    return dupe
  }

  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '')
  }

  /*****************************************************************************
   * DEBUGGING UTILITIES
   ****************************************************************************/
  function perft(depth) {
    var moves = generate_moves({ legal: false });
    var nodes = 0;
    var color = turn;

    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i]);
      if (!king_attacked(color)) {
        if (depth - 1 > 0) {
          var child_nodes = perft(depth - 1);
          nodes += child_nodes;
        } else {
          nodes++;
        }
      }
      undo_move();
    }

    return nodes
  }

  return {
    /***************************************************************************
     * PUBLIC CONSTANTS (is there a better way to do this?)
     **************************************************************************/
    WHITE: WHITE,
    BLACK: BLACK,
    PAWN: PAWN,
    KNIGHT: KNIGHT,
    BISHOP: BISHOP,
    ROOK: ROOK,
    QUEEN: QUEEN,
    KING: KING,
    SQUARES: (function () {
      /* from the ECMA-262 spec (section 12.6.4):
       * "The mechanics of enumerating the properties ... is
       * implementation dependent"
       * so: for (var sq in SQUARES) { keys.push(sq); } might not be
       * ordered correctly
       */
      var keys = [];
      for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
        if (i & 0x88) {
          i += 7;
          continue
        }
        keys.push(algebraic(i));
      }
      return keys
    })(),
    FLAGS: FLAGS,

    /***************************************************************************
     * PUBLIC API
     **************************************************************************/
    load: function (fen) {
      return load(fen)
    },

    reset: function () {
      return reset()
    },

    moves: function (options) {
      /* The internal representation of a chess move is in 0x88 format, and
       * not meant to be human-readable.  The code below converts the 0x88
       * square coordinates to algebraic coordinates.  It also prunes an
       * unnecessary move keys resulting from a verbose call.
       */

      var ugly_moves = generate_moves(options);
      var moves = [];

      for (var i = 0, len = ugly_moves.length; i < len; i++) {
        /* does the user want a full move object (most likely not), or just
         * SAN
         */
        if (
          typeof options !== 'undefined' &&
          'verbose' in options &&
          options.verbose
        ) {
          moves.push(make_pretty(ugly_moves[i]));
        } else {
          moves.push(
            move_to_san(ugly_moves[i], generate_moves({ legal: true }))
          );
        }
      }

      return moves
    },

    in_check: function () {
      return in_check()
    },

    in_checkmate: function () {
      return in_checkmate()
    },

    in_stalemate: function () {
      return in_stalemate()
    },

    in_draw: function () {
      return (
        half_moves >= 100 ||
        in_stalemate() ||
        insufficient_material() ||
        in_threefold_repetition()
      )
    },

    insufficient_material: function () {
      return insufficient_material()
    },

    in_threefold_repetition: function () {
      return in_threefold_repetition()
    },

    game_over: function () {
      return (
        half_moves >= 100 ||
        in_checkmate() ||
        in_stalemate() ||
        insufficient_material() ||
        in_threefold_repetition()
      )
    },

    validate_fen: function (fen) {
      return validate_fen(fen)
    },

    fen: function () {
      return generate_fen()
    },

    board: function () {
      var output = [],
        row = [];

      for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
        if (board[i] == null) {
          row.push(null);
        } else {
          row.push({ type: board[i].type, color: board[i].color });
        }
        if ((i + 1) & 0x88) {
          output.push(row);
          row = [];
          i += 8;
        }
      }

      return output
    },

    pgn: function (options) {
      /* using the specification from http://www.chessclub.com/help/PGN-spec
       * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
       */
      var newline =
        typeof options === 'object' && typeof options.newline_char === 'string'
          ? options.newline_char
          : '\n';
      var max_width =
        typeof options === 'object' && typeof options.max_width === 'number'
          ? options.max_width
          : 0;
      var result = [];
      var header_exists = false;

      /* add the PGN header headerrmation */
      for (var i in header) {
        /* TODO: order of enumerated properties in header object is not
         * guaranteed, see ECMA-262 spec (section 12.6.4)
         */
        result.push('[' + i + ' "' + header[i] + '"]' + newline);
        header_exists = true;
      }

      if (header_exists && history.length) {
        result.push(newline);
      }

      var append_comment = function (move_string) {
        var comment = comments[generate_fen()];
        if (typeof comment !== 'undefined') {
          var delimiter = move_string.length > 0 ? ' ' : '';
          move_string = `${move_string}${delimiter}{${comment}}`;
        }
        return move_string
      };

      /* pop all of history onto reversed_history */
      var reversed_history = [];
      while (history.length > 0) {
        reversed_history.push(undo_move());
      }

      var moves = [];
      var move_string = '';

      /* special case of a commented starting position with no moves */
      if (reversed_history.length === 0) {
        moves.push(append_comment(''));
      }

      /* build the list of moves.  a move_string looks like: "3. e3 e6" */
      while (reversed_history.length > 0) {
        move_string = append_comment(move_string);
        var move = reversed_history.pop();

        /* if the position started with black to move, start PGN with 1. ... */
        if (!history.length && move.color === 'b') {
          move_string = move_number + '. ...';
        } else if (move.color === 'w') {
          /* store the previous generated move_string if we have one */
          if (move_string.length) {
            moves.push(move_string);
          }
          move_string = move_number + '.';
        }

        move_string =
          move_string + ' ' + move_to_san(move, generate_moves({ legal: true }));
        make_move(move);
      }

      /* are there any other leftover moves? */
      if (move_string.length) {
        moves.push(append_comment(move_string));
      }

      /* is there a result? */
      if (typeof header.Result !== 'undefined') {
        moves.push(header.Result);
      }

      /* history should be back to what it was before we started generating PGN,
       * so join together moves
       */
      if (max_width === 0) {
        return result.join('') + moves.join(' ')
      }

      var strip = function () {
        if (result.length > 0 && result[result.length - 1] === ' ') {
          result.pop();
          return true
        }
        return false
      };

      /* NB: this does not preserve comment whitespace. */
      var wrap_comment = function (width, move) {
        for (var token of move.split(' ')) {
          if (!token) {
            continue
          }
          if (width + token.length > max_width) {
            while (strip()) {
              width--;
            }
            result.push(newline);
            width = 0;
          }
          result.push(token);
          width += token.length;
          result.push(' ');
          width++;
        }
        if (strip()) {
          width--;
        }
        return width
      };

      /* wrap the PGN output at max_width */
      var current_width = 0;
      for (var i = 0; i < moves.length; i++) {
        if (current_width + moves[i].length > max_width) {
          if (moves[i].includes('{')) {
            current_width = wrap_comment(current_width, moves[i]);
            continue
          }
        }
        /* if the current move will push past max_width */
        if (current_width + moves[i].length > max_width && i !== 0) {
          /* don't end the line with whitespace */
          if (result[result.length - 1] === ' ') {
            result.pop();
          }

          result.push(newline);
          current_width = 0;
        } else if (i !== 0) {
          result.push(' ');
          current_width++;
        }
        result.push(moves[i]);
        current_width += moves[i].length;
      }

      return result.join('')
    },

    load_pgn: function (pgn, options) {
      // allow the user to specify the sloppy move parser to work around over
      // disambiguation bugs in Fritz and Chessbase
      var sloppy =
        typeof options !== 'undefined' && 'sloppy' in options
          ? options.sloppy
          : false;

      function mask(str) {
        return str.replace(/\\/g, '\\')
      }

      function parse_pgn_header(header, options) {
        var newline_char =
          typeof options === 'object' &&
          typeof options.newline_char === 'string'
            ? options.newline_char
            : '\r?\n';
        var header_obj = {};
        var headers = header.split(new RegExp(mask(newline_char)));
        var key = '';
        var value = '';

        for (var i = 0; i < headers.length; i++) {
          key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1');
          value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\ *\]$/, '$1');
          if (trim(key).length > 0) {
            header_obj[key] = value;
          }
        }

        return header_obj
      }

      var newline_char =
        typeof options === 'object' && typeof options.newline_char === 'string'
          ? options.newline_char
          : '\r?\n';

      // RegExp to split header. Takes advantage of the fact that header and movetext
      // will always have a blank line between them (ie, two newline_char's).
      // With default newline_char, will equal: /^(\[((?:\r?\n)|.)*\])(?:\r?\n){2}/
      var header_regex = new RegExp(
        '^(\\[((?:' +
          mask(newline_char) +
          ')|.)*\\])' +
          '(?:' +
          mask(newline_char) +
          '){2}'
      );

      // If no header given, begin with moves.
      var header_string = header_regex.test(pgn)
        ? header_regex.exec(pgn)[1]
        : '';

      // Put the board in the starting position
      reset();

      /* parse PGN header */
      var headers = parse_pgn_header(header_string, options);
      for (var key in headers) {
        set_header([key, headers[key]]);
      }

      /* load the starting position indicated by [Setup '1'] and
       * [FEN position] */
      if (headers['SetUp'] === '1') {
        if (!('FEN' in headers && load(headers['FEN'], true))) {
          // second argument to load: don't clear the headers
          return false
        }
      }

      /* NB: the regexes below that delete move numbers, recursive
       * annotations, and numeric annotation glyphs may also match
       * text in comments. To prevent this, we transform comments
       * by hex-encoding them in place and decoding them again after
       * the other tokens have been deleted.
       *
       * While the spec states that PGN files should be ASCII encoded,
       * we use {en,de}codeURIComponent here to support arbitrary UTF8
       * as a convenience for modern users */

      var to_hex = function (string) {
        return Array.from(string)
          .map(function (c) {
            /* encodeURI doesn't transform most ASCII characters,
             * so we handle these ourselves */
            return c.charCodeAt(0) < 128
              ? c.charCodeAt(0).toString(16)
              : encodeURIComponent(c).replace(/\%/g, '').toLowerCase()
          })
          .join('')
      };

      var from_hex = function (string) {
        return string.length == 0
          ? ''
          : decodeURIComponent('%' + string.match(/.{1,2}/g).join('%'))
      };

      var encode_comment = function (string) {
        string = string.replace(new RegExp(mask(newline_char), 'g'), ' ');
        return `{${to_hex(string.slice(1, string.length - 1))}}`
      };

      var decode_comment = function (string) {
        if (string.startsWith('{') && string.endsWith('}')) {
          return from_hex(string.slice(1, string.length - 1))
        }
      };

      /* delete header to get the moves */
      var ms = pgn
        .replace(header_string, '')
        .replace(
          /* encode comments so they don't get deleted below */
          new RegExp(`(\{[^}]*\})+?|;([^${mask(newline_char)}]*)`, 'g'),
          function (match, bracket, semicolon) {
            return bracket !== undefined
              ? encode_comment(bracket)
              : ' ' + encode_comment(`{${semicolon.slice(1)}}`)
          }
        )
        .replace(new RegExp(mask(newline_char), 'g'), ' ');

      /* delete recursive annotation variations */
      var rav_regex = /(\([^\(\)]+\))+?/g;
      while (rav_regex.test(ms)) {
        ms = ms.replace(rav_regex, '');
      }

      /* delete move numbers */
      ms = ms.replace(/\d+\.(\.\.)?/g, '');

      /* delete ... indicating black to move */
      ms = ms.replace(/\.\.\./g, '');

      /* delete numeric annotation glyphs */
      ms = ms.replace(/\$\d+/g, '');

      /* trim and get array of moves */
      var moves = trim(ms).split(new RegExp(/\s+/));

      /* delete empty entries */
      moves = moves.join(',').replace(/,,+/g, ',').split(',');
      var move = '';

      var result = '';

      for (var half_move = 0; half_move < moves.length; half_move++) {
        var comment = decode_comment(moves[half_move]);
        if (comment !== undefined) {
          comments[generate_fen()] = comment;
          continue
        }

        move = move_from_san(moves[half_move], sloppy);

        /* invalid move */
        if (move == null) {
          /* was the move an end of game marker */
          if (TERMINATION_MARKERS.indexOf(moves[half_move]) > -1) {
            result = moves[half_move];
          } else {
            return false
          }
        } else {
          /* reset the end of game marker if making a valid move */
          result = '';
          make_move(move);
        }
      }

      /* Per section 8.2.6 of the PGN spec, the Result tag pair must match
       * match the termination marker. Only do this when headers are present,
       * but the result tag is missing
       */
      if (result && Object.keys(header).length && !header['Result']) {
        set_header(['Result', result]);
      }

      return true
    },

    header: function () {
      return set_header(arguments)
    },

    ascii: function () {
      return ascii()
    },

    turn: function () {
      return turn
    },

    move: function (move, options) {
      /* The move function can be called with in the following parameters:
       *
       * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
       *
       * .move({ from: 'h7', <- where the 'move' is a move object (additional
       *         to :'h8',      fields are ignored)
       *         promotion: 'q',
       *      })
       */

      // allow the user to specify the sloppy move parser to work around over
      // disambiguation bugs in Fritz and Chessbase
      var sloppy =
        typeof options !== 'undefined' && 'sloppy' in options
          ? options.sloppy
          : false;

      var move_obj = null;

      if (typeof move === 'string') {
        move_obj = move_from_san(move, sloppy);
      } else if (typeof move === 'object') {
        var moves = generate_moves();

        /* convert the pretty move object to an ugly move object */
        for (var i = 0, len = moves.length; i < len; i++) {
          if (
            move.from === algebraic(moves[i].from) &&
            move.to === algebraic(moves[i].to) &&
            (!('promotion' in moves[i]) ||
              move.promotion === moves[i].promotion)
          ) {
            move_obj = moves[i];
            break
          }
        }
      }

      /* failed to find move */
      if (!move_obj) {
        return null
      }

      /* need to make a copy of move because we can't generate SAN after the
       * move is made
       */
      var pretty_move = make_pretty(move_obj);

      make_move(move_obj);

      return pretty_move
    },

    undo: function () {
      var move = undo_move();
      return move ? make_pretty(move) : null
    },

    clear: function () {
      return clear()
    },

    put: function (piece, square) {
      return put(piece, square)
    },

    get: function (square) {
      return get(square)
    },

    remove: function (square) {
      return remove(square)
    },

    perft: function (depth) {
      return perft(depth)
    },

    square_color: function (square) {
      if (square in SQUARES) {
        var sq_0x88 = SQUARES[square];
        return (rank(sq_0x88) + file(sq_0x88)) % 2 === 0 ? 'light' : 'dark'
      }

      return null
    },

    history: function (options) {
      var reversed_history = [];
      var move_history = [];
      var verbose =
        typeof options !== 'undefined' &&
        'verbose' in options &&
        options.verbose;

      while (history.length > 0) {
        reversed_history.push(undo_move());
      }

      while (reversed_history.length > 0) {
        var move = reversed_history.pop();
        if (verbose) {
          move_history.push(make_pretty(move));
        } else {
          move_history.push(move_to_san(move, generate_moves({ legal: true })));
        }
        make_move(move);
      }

      return move_history
    },

    get_comment: function () {
      return comments[generate_fen()]
    },

    set_comment: function (comment) {
      comments[generate_fen()] = comment.replace('{', '[').replace('}', ']');
    },

    delete_comment: function () {
      var comment = comments[generate_fen()];
      delete comments[generate_fen()];
      return comment
    },

    get_comments: function () {
      prune_comments();
      return Object.keys(comments).map(function (fen) {
        return { fen: fen, comment: comments[fen] }
      })
    },

    delete_comments: function () {
      prune_comments();
      return Object.keys(comments).map(function (fen) {
        var comment = comments[fen];
        delete comments[fen];
        return { fen: fen, comment: comment }
      })
    },
  }
};

/* export Chess object if using node or any other CommonJS compatible
 * environment */
exports.Chess = Chess;
}(chess));

const colors = ['white', 'black'];
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

const invRanks = [...ranks].reverse();
const allKeys = Array.prototype.concat(...files.map(c => ranks.map(r => c + r)));
const pos2key = (pos) => allKeys[8 * pos[0] + pos[1]];
const key2pos = (k) => [k.charCodeAt(0) - 97, k.charCodeAt(1) - 49];
const allPos = allKeys.map(key2pos);
function memo(f) {
    let v;
    const ret = () => {
        if (v === undefined)
            v = f();
        return v;
    };
    ret.clear = () => {
        v = undefined;
    };
    return ret;
}
const timer = () => {
    let startAt;
    return {
        start() {
            startAt = performance.now();
        },
        cancel() {
            startAt = undefined;
        },
        stop() {
            if (!startAt)
                return 0;
            const time = performance.now() - startAt;
            startAt = undefined;
            return time;
        },
    };
};
const opposite = (c) => (c === 'white' ? 'black' : 'white');
const distanceSq = (pos1, pos2) => {
    const dx = pos1[0] - pos2[0], dy = pos1[1] - pos2[1];
    return dx * dx + dy * dy;
};
const samePiece = (p1, p2) => p1.role === p2.role && p1.color === p2.color;
const posToTranslate = (bounds) => (pos, asWhite) => [((asWhite ? pos[0] : 7 - pos[0]) * bounds.width) / 8, ((asWhite ? 7 - pos[1] : pos[1]) * bounds.height) / 8];
const translate = (el, pos) => {
    el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};
const translateAndScale = (el, pos, scale = 1) => {
    el.style.transform = `translate(${pos[0]}px,${pos[1]}px) scale(${scale})`;
};
const setVisible = (el, v) => {
    el.style.visibility = v ? 'visible' : 'hidden';
};
const eventPosition = (e) => {
    var _a;
    if (e.clientX || e.clientX === 0)
        return [e.clientX, e.clientY];
    if ((_a = e.targetTouches) === null || _a === void 0 ? void 0 : _a[0])
        return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    return; // touchend has no position!
};
const isRightButton = (e) => e.buttons === 2 || e.button === 2;
const createEl = (tagName, className) => {
    const el = document.createElement(tagName);
    if (className)
        el.className = className;
    return el;
};
function computeSquareCenter(key, asWhite, bounds) {
    const pos = key2pos(key);
    if (!asWhite) {
        pos[0] = 7 - pos[0];
        pos[1] = 7 - pos[1];
    }
    return [
        bounds.left + (bounds.width * pos[0]) / 8 + bounds.width / 16,
        bounds.top + (bounds.height * (7 - pos[1])) / 8 + bounds.height / 16,
    ];
}

function diff(a, b) {
    return Math.abs(a - b);
}
function pawn(color) {
    return (x1, y1, x2, y2) => diff(x1, x2) < 2 &&
        (color === 'white'
            ? // allow 2 squares from first two ranks, for horde
                y2 === y1 + 1 || (y1 <= 1 && y2 === y1 + 2 && x1 === x2)
            : y2 === y1 - 1 || (y1 >= 6 && y2 === y1 - 2 && x1 === x2));
}
const knight = (x1, y1, x2, y2) => {
    const xd = diff(x1, x2);
    const yd = diff(y1, y2);
    return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
};
const bishop = (x1, y1, x2, y2) => {
    return diff(x1, x2) === diff(y1, y2);
};
const rook = (x1, y1, x2, y2) => {
    return x1 === x2 || y1 === y2;
};
const queen = (x1, y1, x2, y2) => {
    return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
};
function king(color, rookFiles, canCastle) {
    return (x1, y1, x2, y2) => (diff(x1, x2) < 2 && diff(y1, y2) < 2) ||
        (canCastle &&
            y1 === y2 &&
            y1 === (color === 'white' ? 0 : 7) &&
            ((x1 === 4 && ((x2 === 2 && rookFiles.includes(0)) || (x2 === 6 && rookFiles.includes(7)))) ||
                rookFiles.includes(x2)));
}
function rookFilesOf(pieces, color) {
    const backrank = color === 'white' ? '1' : '8';
    const files = [];
    for (const [key, piece] of pieces) {
        if (key[1] === backrank && piece.color === color && piece.role === 'rook') {
            files.push(key2pos(key)[0]);
        }
    }
    return files;
}
function premove(pieces, key, canCastle) {
    const piece = pieces.get(key);
    if (!piece)
        return [];
    const pos = key2pos(key), r = piece.role, mobility = r === 'pawn'
        ? pawn(piece.color)
        : r === 'knight'
            ? knight
            : r === 'bishop'
                ? bishop
                : r === 'rook'
                    ? rook
                    : r === 'queen'
                        ? queen
                        : king(piece.color, rookFilesOf(pieces, piece.color), canCastle);
    return allPos
        .filter(pos2 => (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]))
        .map(pos2key);
}

function callUserFunction(f, ...args) {
    if (f)
        setTimeout(() => f(...args), 1);
}
function toggleOrientation(state) {
    state.orientation = opposite(state.orientation);
    state.animation.current = state.draggable.current = state.selected = undefined;
}
function setPieces(state, pieces) {
    for (const [key, piece] of pieces) {
        if (piece)
            state.pieces.set(key, piece);
        else
            state.pieces.delete(key);
    }
}
function setCheck(state, color) {
    state.check = undefined;
    if (color === true)
        color = state.turnColor;
    if (color)
        for (const [k, p] of state.pieces) {
            if (p.role === 'king' && p.color === color) {
                state.check = k;
            }
        }
}
function setPremove(state, orig, dest, meta) {
    unsetPredrop(state);
    state.premovable.current = [orig, dest];
    callUserFunction(state.premovable.events.set, orig, dest, meta);
}
function unsetPremove(state) {
    if (state.premovable.current) {
        state.premovable.current = undefined;
        callUserFunction(state.premovable.events.unset);
    }
}
function setPredrop(state, role, key) {
    unsetPremove(state);
    state.predroppable.current = { role, key };
    callUserFunction(state.predroppable.events.set, role, key);
}
function unsetPredrop(state) {
    const pd = state.predroppable;
    if (pd.current) {
        pd.current = undefined;
        callUserFunction(pd.events.unset);
    }
}
function tryAutoCastle(state, orig, dest) {
    if (!state.autoCastle)
        return false;
    const king = state.pieces.get(orig);
    if (!king || king.role !== 'king')
        return false;
    const origPos = key2pos(orig);
    const destPos = key2pos(dest);
    if ((origPos[1] !== 0 && origPos[1] !== 7) || origPos[1] !== destPos[1])
        return false;
    if (origPos[0] === 4 && !state.pieces.has(dest)) {
        if (destPos[0] === 6)
            dest = pos2key([7, destPos[1]]);
        else if (destPos[0] === 2)
            dest = pos2key([0, destPos[1]]);
    }
    const rook = state.pieces.get(dest);
    if (!rook || rook.color !== king.color || rook.role !== 'rook')
        return false;
    state.pieces.delete(orig);
    state.pieces.delete(dest);
    if (origPos[0] < destPos[0]) {
        state.pieces.set(pos2key([6, destPos[1]]), king);
        state.pieces.set(pos2key([5, destPos[1]]), rook);
    }
    else {
        state.pieces.set(pos2key([2, destPos[1]]), king);
        state.pieces.set(pos2key([3, destPos[1]]), rook);
    }
    return true;
}
function baseMove(state, orig, dest) {
    const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
    if (orig === dest || !origPiece)
        return false;
    const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined;
    if (dest === state.selected)
        unselect(state);
    callUserFunction(state.events.move, orig, dest, captured);
    if (!tryAutoCastle(state, orig, dest)) {
        state.pieces.set(dest, origPiece);
        state.pieces.delete(orig);
    }
    state.lastMove = [orig, dest];
    state.check = undefined;
    callUserFunction(state.events.change);
    return captured || true;
}
function baseNewPiece(state, piece, key, force) {
    if (state.pieces.has(key)) {
        if (force)
            state.pieces.delete(key);
        else
            return false;
    }
    callUserFunction(state.events.dropNewPiece, piece, key);
    state.pieces.set(key, piece);
    state.lastMove = [key];
    state.check = undefined;
    callUserFunction(state.events.change);
    state.movable.dests = undefined;
    state.turnColor = opposite(state.turnColor);
    return true;
}
function baseUserMove(state, orig, dest) {
    const result = baseMove(state, orig, dest);
    if (result) {
        state.movable.dests = undefined;
        state.turnColor = opposite(state.turnColor);
        state.animation.current = undefined;
    }
    return result;
}
function userMove(state, orig, dest) {
    if (canMove(state, orig, dest)) {
        const result = baseUserMove(state, orig, dest);
        if (result) {
            const holdTime = state.hold.stop();
            unselect(state);
            const metadata = {
                premove: false,
                ctrlKey: state.stats.ctrlKey,
                holdTime,
            };
            if (result !== true)
                metadata.captured = result;
            callUserFunction(state.movable.events.after, orig, dest, metadata);
            return true;
        }
    }
    else if (canPremove(state, orig, dest)) {
        setPremove(state, orig, dest, {
            ctrlKey: state.stats.ctrlKey,
        });
        unselect(state);
        return true;
    }
    unselect(state);
    return false;
}
function dropNewPiece(state, orig, dest, force) {
    const piece = state.pieces.get(orig);
    if (piece && (canDrop(state, orig, dest) || force)) {
        state.pieces.delete(orig);
        baseNewPiece(state, piece, dest, force);
        callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
            premove: false,
            predrop: false,
        });
    }
    else if (piece && canPredrop(state, orig, dest)) {
        setPredrop(state, piece.role, dest);
    }
    else {
        unsetPremove(state);
        unsetPredrop(state);
    }
    state.pieces.delete(orig);
    unselect(state);
}
function selectSquare(state, key, force) {
    callUserFunction(state.events.select, key);
    if (state.selected) {
        if (state.selected === key && !state.draggable.enabled) {
            unselect(state);
            state.hold.cancel();
            return;
        }
        else if ((state.selectable.enabled || force) && state.selected !== key) {
            if (userMove(state, state.selected, key)) {
                state.stats.dragged = false;
                return;
            }
        }
    }
    if (isMovable(state, key) || isPremovable(state, key)) {
        setSelected(state, key);
        state.hold.start();
    }
}
function setSelected(state, key) {
    state.selected = key;
    if (isPremovable(state, key)) {
        state.premovable.dests = premove(state.pieces, key, state.premovable.castle);
    }
    else
        state.premovable.dests = undefined;
}
function unselect(state) {
    state.selected = undefined;
    state.premovable.dests = undefined;
    state.hold.cancel();
}
function isMovable(state, orig) {
    const piece = state.pieces.get(orig);
    return (!!piece &&
        (state.movable.color === 'both' || (state.movable.color === piece.color && state.turnColor === piece.color)));
}
function canMove(state, orig, dest) {
    var _a, _b;
    return (orig !== dest && isMovable(state, orig) && (state.movable.free || !!((_b = (_a = state.movable.dests) === null || _a === void 0 ? void 0 : _a.get(orig)) === null || _b === void 0 ? void 0 : _b.includes(dest))));
}
function canDrop(state, orig, dest) {
    const piece = state.pieces.get(orig);
    return (!!piece &&
        (orig === dest || !state.pieces.has(dest)) &&
        (state.movable.color === 'both' || (state.movable.color === piece.color && state.turnColor === piece.color)));
}
function isPremovable(state, orig) {
    const piece = state.pieces.get(orig);
    return !!piece && state.premovable.enabled && state.movable.color === piece.color && state.turnColor !== piece.color;
}
function canPremove(state, orig, dest) {
    return (orig !== dest && isPremovable(state, orig) && premove(state.pieces, orig, state.premovable.castle).includes(dest));
}
function canPredrop(state, orig, dest) {
    const piece = state.pieces.get(orig);
    const destPiece = state.pieces.get(dest);
    return (!!piece &&
        (!destPiece || destPiece.color !== state.movable.color) &&
        state.predroppable.enabled &&
        (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
        state.movable.color === piece.color &&
        state.turnColor !== piece.color);
}
function isDraggable(state, orig) {
    const piece = state.pieces.get(orig);
    return (!!piece &&
        state.draggable.enabled &&
        (state.movable.color === 'both' ||
            (state.movable.color === piece.color && (state.turnColor === piece.color || state.premovable.enabled))));
}
function playPremove(state) {
    const move = state.premovable.current;
    if (!move)
        return false;
    const orig = move[0], dest = move[1];
    let success = false;
    if (canMove(state, orig, dest)) {
        const result = baseUserMove(state, orig, dest);
        if (result) {
            const metadata = { premove: true };
            if (result !== true)
                metadata.captured = result;
            callUserFunction(state.movable.events.after, orig, dest, metadata);
            success = true;
        }
    }
    unsetPremove(state);
    return success;
}
function playPredrop(state, validate) {
    const drop = state.predroppable.current;
    let success = false;
    if (!drop)
        return false;
    if (validate(drop)) {
        const piece = {
            role: drop.role,
            color: state.movable.color,
        };
        if (baseNewPiece(state, piece, drop.key)) {
            callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
                premove: false,
                predrop: true,
            });
            success = true;
        }
    }
    unsetPredrop(state);
    return success;
}
function cancelMove(state) {
    unsetPremove(state);
    unsetPredrop(state);
    unselect(state);
}
function stop(state) {
    state.movable.color = state.movable.dests = state.animation.current = undefined;
    cancelMove(state);
}
function getKeyAtDomPos(pos, asWhite, bounds) {
    let file = Math.floor((8 * (pos[0] - bounds.left)) / bounds.width);
    if (!asWhite)
        file = 7 - file;
    let rank = 7 - Math.floor((8 * (pos[1] - bounds.top)) / bounds.height);
    if (!asWhite)
        rank = 7 - rank;
    return file >= 0 && file < 8 && rank >= 0 && rank < 8 ? pos2key([file, rank]) : undefined;
}
function getSnappedKeyAtDomPos(orig, pos, asWhite, bounds) {
    const origPos = key2pos(orig);
    const validSnapPos = allPos.filter(pos2 => {
        return queen(origPos[0], origPos[1], pos2[0], pos2[1]) || knight(origPos[0], origPos[1], pos2[0], pos2[1]);
    });
    const validSnapCenters = validSnapPos.map(pos2 => computeSquareCenter(pos2key(pos2), asWhite, bounds));
    const validSnapDistances = validSnapCenters.map(pos2 => distanceSq(pos, pos2));
    const [, closestSnapIndex] = validSnapDistances.reduce((a, b, index) => (a[0] < b ? a : [b, index]), [validSnapDistances[0], 0]);
    return pos2key(validSnapPos[closestSnapIndex]);
}
function whitePov(s) {
    return s.orientation === 'white';
}

const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const roles = {
    p: 'pawn',
    r: 'rook',
    n: 'knight',
    b: 'bishop',
    q: 'queen',
    k: 'king',
};
const letters = {
    pawn: 'p',
    rook: 'r',
    knight: 'n',
    bishop: 'b',
    queen: 'q',
    king: 'k',
};
function read(fen) {
    if (fen === 'start')
        fen = initial;
    const pieces = new Map();
    let row = 7, col = 0;
    for (const c of fen) {
        switch (c) {
            case ' ':
            case '[':
                return pieces;
            case '/':
                --row;
                if (row < 0)
                    return pieces;
                col = 0;
                break;
            case '~': {
                const piece = pieces.get(pos2key([col - 1, row]));
                if (piece)
                    piece.promoted = true;
                break;
            }
            default: {
                const nb = c.charCodeAt(0);
                if (nb < 57)
                    col += nb - 48;
                else {
                    const role = c.toLowerCase();
                    pieces.set(pos2key([col, row]), {
                        role: roles[role],
                        color: c === role ? 'black' : 'white',
                    });
                    ++col;
                }
            }
        }
    }
    return pieces;
}
function write(pieces) {
    return invRanks
        .map(y => files
        .map(x => {
        const piece = pieces.get((x + y));
        if (piece) {
            let p = letters[piece.role];
            if (piece.color === 'white')
                p = p.toUpperCase();
            if (piece.promoted)
                p += '~';
            return p;
        }
        else
            return '1';
    })
        .join(''))
        .join('/')
        .replace(/1{2,}/g, s => s.length.toString());
}

function applyAnimation(state, config) {
    if (config.animation) {
        deepMerge(state.animation, config.animation);
        // no need for such short animations
        if ((state.animation.duration || 0) < 70)
            state.animation.enabled = false;
    }
}
function configure(state, config) {
    var _a, _b;
    // don't merge destinations and autoShapes. Just override.
    if ((_a = config.movable) === null || _a === void 0 ? void 0 : _a.dests)
        state.movable.dests = undefined;
    if ((_b = config.drawable) === null || _b === void 0 ? void 0 : _b.autoShapes)
        state.drawable.autoShapes = [];
    deepMerge(state, config);
    // if a fen was provided, replace the pieces
    if (config.fen) {
        state.pieces = read(config.fen);
        state.drawable.shapes = [];
    }
    // apply config values that could be undefined yet meaningful
    if ('check' in config)
        setCheck(state, config.check || false);
    if ('lastMove' in config && !config.lastMove)
        state.lastMove = undefined;
    // in case of ZH drop last move, there's a single square.
    // if the previous last move had two squares,
    // the merge algorithm will incorrectly keep the second square.
    else if (config.lastMove)
        state.lastMove = config.lastMove;
    // fix move/premove dests
    if (state.selected)
        setSelected(state, state.selected);
    applyAnimation(state, config);
    if (!state.movable.rookCastle && state.movable.dests) {
        const rank = state.movable.color === 'white' ? '1' : '8', kingStartPos = ('e' + rank), dests = state.movable.dests.get(kingStartPos), king = state.pieces.get(kingStartPos);
        if (!dests || !king || king.role !== 'king')
            return;
        state.movable.dests.set(kingStartPos, dests.filter(d => !(d === 'a' + rank && dests.includes(('c' + rank))) &&
            !(d === 'h' + rank && dests.includes(('g' + rank)))));
    }
}
function deepMerge(base, extend) {
    for (const key in extend) {
        if (isObject(base[key]) && isObject(extend[key]))
            deepMerge(base[key], extend[key]);
        else
            base[key] = extend[key];
    }
}
function isObject(o) {
    return typeof o === 'object';
}

function anim(mutation, state) {
    return state.animation.enabled ? animate(mutation, state) : render$2(mutation, state);
}
function render$2(mutation, state) {
    const result = mutation(state);
    state.dom.redraw();
    return result;
}
function makePiece(key, piece) {
    return {
        key: key,
        pos: key2pos(key),
        piece: piece,
    };
}
function closer(piece, pieces) {
    return pieces.sort((p1, p2) => {
        return distanceSq(piece.pos, p1.pos) - distanceSq(piece.pos, p2.pos);
    })[0];
}
function computePlan(prevPieces, current) {
    const anims = new Map(), animedOrigs = [], fadings = new Map(), missings = [], news = [], prePieces = new Map();
    let curP, preP, vector;
    for (const [k, p] of prevPieces) {
        prePieces.set(k, makePiece(k, p));
    }
    for (const key of allKeys) {
        curP = current.pieces.get(key);
        preP = prePieces.get(key);
        if (curP) {
            if (preP) {
                if (!samePiece(curP, preP.piece)) {
                    missings.push(preP);
                    news.push(makePiece(key, curP));
                }
            }
            else
                news.push(makePiece(key, curP));
        }
        else if (preP)
            missings.push(preP);
    }
    for (const newP of news) {
        preP = closer(newP, missings.filter(p => samePiece(newP.piece, p.piece)));
        if (preP) {
            vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
            anims.set(newP.key, vector.concat(vector));
            animedOrigs.push(preP.key);
        }
    }
    for (const p of missings) {
        if (!animedOrigs.includes(p.key))
            fadings.set(p.key, p.piece);
    }
    return {
        anims: anims,
        fadings: fadings,
    };
}
function step(state, now) {
    const cur = state.animation.current;
    if (cur === undefined) {
        // animation was canceled :(
        if (!state.dom.destroyed)
            state.dom.redrawNow();
        return;
    }
    const rest = 1 - (now - cur.start) * cur.frequency;
    if (rest <= 0) {
        state.animation.current = undefined;
        state.dom.redrawNow();
    }
    else {
        const ease = easing(rest);
        for (const cfg of cur.plan.anims.values()) {
            cfg[2] = cfg[0] * ease;
            cfg[3] = cfg[1] * ease;
        }
        state.dom.redrawNow(true); // optimisation: don't render SVG changes during animations
        requestAnimationFrame((now = performance.now()) => step(state, now));
    }
}
function animate(mutation, state) {
    // clone state before mutating it
    const prevPieces = new Map(state.pieces);
    const result = mutation(state);
    const plan = computePlan(prevPieces, state);
    if (plan.anims.size || plan.fadings.size) {
        const alreadyRunning = state.animation.current && state.animation.current.start;
        state.animation.current = {
            start: performance.now(),
            frequency: 1 / state.animation.duration,
            plan: plan,
        };
        if (!alreadyRunning)
            step(state, performance.now());
    }
    else {
        // don't animate, just render right away
        state.dom.redraw();
    }
    return result;
}
// https://gist.github.com/gre/1650294
function easing(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

const brushes = ['green', 'red', 'blue', 'yellow'];
function start$2(state, e) {
    // support one finger touch only
    if (e.touches && e.touches.length > 1)
        return;
    e.stopPropagation();
    e.preventDefault();
    e.ctrlKey ? unselect(state) : cancelMove(state);
    const pos = eventPosition(e), orig = getKeyAtDomPos(pos, whitePov(state), state.dom.bounds());
    if (!orig)
        return;
    state.drawable.current = {
        orig,
        pos,
        brush: eventBrush(e),
        snapToValidMove: state.drawable.defaultSnapToValidMove,
    };
    processDraw(state);
}
function processDraw(state) {
    requestAnimationFrame(() => {
        const cur = state.drawable.current;
        if (cur) {
            const keyAtDomPos = getKeyAtDomPos(cur.pos, whitePov(state), state.dom.bounds());
            if (!keyAtDomPos) {
                cur.snapToValidMove = false;
            }
            const mouseSq = cur.snapToValidMove
                ? getSnappedKeyAtDomPos(cur.orig, cur.pos, whitePov(state), state.dom.bounds())
                : keyAtDomPos;
            if (mouseSq !== cur.mouseSq) {
                cur.mouseSq = mouseSq;
                cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
                state.dom.redrawNow();
            }
            processDraw(state);
        }
    });
}
function move$1(state, e) {
    if (state.drawable.current)
        state.drawable.current.pos = eventPosition(e);
}
function end$1(state) {
    const cur = state.drawable.current;
    if (cur) {
        if (cur.mouseSq)
            addShape(state.drawable, cur);
        cancel$1(state);
    }
}
function cancel$1(state) {
    if (state.drawable.current) {
        state.drawable.current = undefined;
        state.dom.redraw();
    }
}
function clear(state) {
    if (state.drawable.shapes.length) {
        state.drawable.shapes = [];
        state.dom.redraw();
        onChange(state.drawable);
    }
}
function eventBrush(e) {
    var _a;
    const modA = (e.shiftKey || e.ctrlKey) && isRightButton(e);
    const modB = e.altKey || e.metaKey || ((_a = e.getModifierState) === null || _a === void 0 ? void 0 : _a.call(e, 'AltGraph'));
    return brushes[(modA ? 1 : 0) + (modB ? 2 : 0)];
}
function addShape(drawable, cur) {
    const sameShape = (s) => s.orig === cur.orig && s.dest === cur.dest;
    const similar = drawable.shapes.find(sameShape);
    if (similar)
        drawable.shapes = drawable.shapes.filter(s => !sameShape(s));
    if (!similar || similar.brush !== cur.brush)
        drawable.shapes.push(cur);
    onChange(drawable);
}
function onChange(drawable) {
    if (drawable.onChange)
        drawable.onChange(drawable.shapes);
}

function start$1(s, e) {
    if (!e.isTrusted || (e.button !== undefined && e.button !== 0))
        return; // only touch or left click
    if (e.touches && e.touches.length > 1)
        return; // support one finger touch only
    const bounds = s.dom.bounds(), position = eventPosition(e), orig = getKeyAtDomPos(position, whitePov(s), bounds);
    if (!orig)
        return;
    const piece = s.pieces.get(orig);
    const previouslySelected = s.selected;
    if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || !piece || piece.color !== s.turnColor))
        clear(s);
    // Prevent touch scroll and create no corresponding mouse event, if there
    // is an intent to interact with the board.
    if (e.cancelable !== false &&
        (!e.touches || s.blockTouchScroll || piece || previouslySelected || pieceCloseTo(s, position)))
        e.preventDefault();
    const hadPremove = !!s.premovable.current;
    const hadPredrop = !!s.predroppable.current;
    s.stats.ctrlKey = e.ctrlKey;
    if (s.selected && canMove(s, s.selected, orig)) {
        anim(state => selectSquare(state, orig), s);
    }
    else {
        selectSquare(s, orig);
    }
    const stillSelected = s.selected === orig;
    const element = pieceElementByKey(s, orig);
    if (piece && element && stillSelected && isDraggable(s, orig)) {
        s.draggable.current = {
            orig,
            piece,
            origPos: position,
            pos: position,
            started: s.draggable.autoDistance && s.stats.dragged,
            element,
            previouslySelected,
            originTarget: e.target,
            keyHasChanged: false,
        };
        element.cgDragging = true;
        element.classList.add('dragging');
        // place ghost
        const ghost = s.dom.elements.ghost;
        if (ghost) {
            ghost.className = `ghost ${piece.color} ${piece.role}`;
            translate(ghost, posToTranslate(bounds)(key2pos(orig), whitePov(s)));
            setVisible(ghost, true);
        }
        processDrag(s);
    }
    else {
        if (hadPremove)
            unsetPremove(s);
        if (hadPredrop)
            unsetPredrop(s);
    }
    s.dom.redraw();
}
function pieceCloseTo(s, pos) {
    const asWhite = whitePov(s), bounds = s.dom.bounds(), radiusSq = Math.pow(bounds.width / 8, 2);
    for (const key of s.pieces.keys()) {
        const center = computeSquareCenter(key, asWhite, bounds);
        if (distanceSq(center, pos) <= radiusSq)
            return true;
    }
    return false;
}
function dragNewPiece(s, piece, e, force) {
    const key = 'a0';
    s.pieces.set(key, piece);
    s.dom.redraw();
    const position = eventPosition(e);
    s.draggable.current = {
        orig: key,
        piece,
        origPos: position,
        pos: position,
        started: true,
        element: () => pieceElementByKey(s, key),
        originTarget: e.target,
        newPiece: true,
        force: !!force,
        keyHasChanged: false,
    };
    processDrag(s);
}
function processDrag(s) {
    requestAnimationFrame(() => {
        var _a;
        const cur = s.draggable.current;
        if (!cur)
            return;
        // cancel animations while dragging
        if ((_a = s.animation.current) === null || _a === void 0 ? void 0 : _a.plan.anims.has(cur.orig))
            s.animation.current = undefined;
        // if moving piece is gone, cancel
        const origPiece = s.pieces.get(cur.orig);
        if (!origPiece || !samePiece(origPiece, cur.piece))
            cancel(s);
        else {
            if (!cur.started && distanceSq(cur.pos, cur.origPos) >= Math.pow(s.draggable.distance, 2))
                cur.started = true;
            if (cur.started) {
                // support lazy elements
                if (typeof cur.element === 'function') {
                    const found = cur.element();
                    if (!found)
                        return;
                    found.cgDragging = true;
                    found.classList.add('dragging');
                    cur.element = found;
                }
                const bounds = s.dom.bounds();
                translate(cur.element, [
                    cur.pos[0] - bounds.left - bounds.width / 16,
                    cur.pos[1] - bounds.top - bounds.height / 16,
                ]);
                cur.keyHasChanged || (cur.keyHasChanged = cur.orig !== getKeyAtDomPos(cur.pos, whitePov(s), bounds));
            }
        }
        processDrag(s);
    });
}
function move(s, e) {
    // support one finger touch only
    if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
        s.draggable.current.pos = eventPosition(e);
    }
}
function end(s, e) {
    const cur = s.draggable.current;
    if (!cur)
        return;
    // create no corresponding mouse event
    if (e.type === 'touchend' && e.cancelable !== false)
        e.preventDefault();
    // comparing with the origin target is an easy way to test that the end event
    // has the same touch origin
    if (e.type === 'touchend' && cur.originTarget !== e.target && !cur.newPiece) {
        s.draggable.current = undefined;
        return;
    }
    unsetPremove(s);
    unsetPredrop(s);
    // touchend has no position; so use the last touchmove position instead
    const eventPos = eventPosition(e) || cur.pos;
    const dest = getKeyAtDomPos(eventPos, whitePov(s), s.dom.bounds());
    if (dest && cur.started && cur.orig !== dest) {
        if (cur.newPiece)
            dropNewPiece(s, cur.orig, dest, cur.force);
        else {
            s.stats.ctrlKey = e.ctrlKey;
            if (userMove(s, cur.orig, dest))
                s.stats.dragged = true;
        }
    }
    else if (cur.newPiece) {
        s.pieces.delete(cur.orig);
    }
    else if (s.draggable.deleteOnDropOff && !dest) {
        s.pieces.delete(cur.orig);
        callUserFunction(s.events.change);
    }
    if ((cur.orig === cur.previouslySelected || cur.keyHasChanged) && (cur.orig === dest || !dest))
        unselect(s);
    else if (!s.selectable.enabled)
        unselect(s);
    removeDragElements(s);
    s.draggable.current = undefined;
    s.dom.redraw();
}
function cancel(s) {
    const cur = s.draggable.current;
    if (cur) {
        if (cur.newPiece)
            s.pieces.delete(cur.orig);
        s.draggable.current = undefined;
        unselect(s);
        removeDragElements(s);
        s.dom.redraw();
    }
}
function removeDragElements(s) {
    const e = s.dom.elements;
    if (e.ghost)
        setVisible(e.ghost, false);
}
function pieceElementByKey(s, key) {
    let el = s.dom.elements.board.firstChild;
    while (el) {
        if (el.cgKey === key && el.tagName === 'PIECE')
            return el;
        el = el.nextSibling;
    }
    return;
}

function explosion(state, keys) {
    state.exploding = { stage: 1, keys };
    state.dom.redraw();
    setTimeout(() => {
        setStage(state, 2);
        setTimeout(() => setStage(state, undefined), 120);
    }, 120);
}
function setStage(state, stage) {
    if (state.exploding) {
        if (stage)
            state.exploding.stage = stage;
        else
            state.exploding = undefined;
        state.dom.redraw();
    }
}

// see API types and documentations in dts/api.d.ts
function start(state, redrawAll) {
    function toggleOrientation$1() {
        toggleOrientation(state);
        redrawAll();
    }
    return {
        set(config) {
            if (config.orientation && config.orientation !== state.orientation)
                toggleOrientation$1();
            applyAnimation(state, config);
            (config.fen ? anim : render$2)(state => configure(state, config), state);
        },
        state,
        getFen: () => write(state.pieces),
        toggleOrientation: toggleOrientation$1,
        setPieces(pieces) {
            anim(state => setPieces(state, pieces), state);
        },
        selectSquare(key, force) {
            if (key)
                anim(state => selectSquare(state, key, force), state);
            else if (state.selected) {
                unselect(state);
                state.dom.redraw();
            }
        },
        move(orig, dest) {
            anim(state => baseMove(state, orig, dest), state);
        },
        newPiece(piece, key) {
            anim(state => baseNewPiece(state, piece, key), state);
        },
        playPremove() {
            if (state.premovable.current) {
                if (anim(playPremove, state))
                    return true;
                // if the premove couldn't be played, redraw to clear it up
                state.dom.redraw();
            }
            return false;
        },
        playPredrop(validate) {
            if (state.predroppable.current) {
                const result = playPredrop(state, validate);
                state.dom.redraw();
                return result;
            }
            return false;
        },
        cancelPremove() {
            render$2(unsetPremove, state);
        },
        cancelPredrop() {
            render$2(unsetPredrop, state);
        },
        cancelMove() {
            render$2(state => {
                cancelMove(state);
                cancel(state);
            }, state);
        },
        stop() {
            render$2(state => {
                stop(state);
                cancel(state);
            }, state);
        },
        explode(keys) {
            explosion(state, keys);
        },
        setAutoShapes(shapes) {
            render$2(state => (state.drawable.autoShapes = shapes), state);
        },
        setShapes(shapes) {
            render$2(state => (state.drawable.shapes = shapes), state);
        },
        getKeyAtDomPos(pos) {
            return getKeyAtDomPos(pos, whitePov(state), state.dom.bounds());
        },
        redrawAll,
        dragNewPiece(piece, event, force) {
            dragNewPiece(state, piece, event, force);
        },
        destroy() {
            stop(state);
            state.dom.unbind && state.dom.unbind();
            state.dom.destroyed = true;
        },
    };
}

function defaults() {
    return {
        pieces: read(initial),
        orientation: 'white',
        turnColor: 'white',
        coordinates: true,
        ranksPosition: 'right',
        autoCastle: true,
        viewOnly: false,
        disableContextMenu: false,
        addPieceZIndex: false,
        addDimensionsCssVars: false,
        blockTouchScroll: false,
        pieceKey: false,
        highlight: {
            lastMove: true,
            check: true,
        },
        animation: {
            enabled: true,
            duration: 200,
        },
        movable: {
            free: true,
            color: 'both',
            showDests: true,
            events: {},
            rookCastle: true,
        },
        premovable: {
            enabled: true,
            showDests: true,
            castle: true,
            events: {},
        },
        predroppable: {
            enabled: false,
            events: {},
        },
        draggable: {
            enabled: true,
            distance: 3,
            autoDistance: true,
            showGhost: true,
            deleteOnDropOff: false,
        },
        dropmode: {
            active: false,
        },
        selectable: {
            enabled: true,
        },
        stats: {
            // on touchscreen, default to "tap-tap" moves
            // instead of drag
            dragged: !('ontouchstart' in window),
        },
        events: {},
        drawable: {
            enabled: true,
            visible: true,
            defaultSnapToValidMove: true,
            eraseOnClick: true,
            shapes: [],
            autoShapes: [],
            brushes: {
                green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
                red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
                blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
                yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
                paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
                paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
                paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
                paleGrey: {
                    key: 'pgr',
                    color: '#4a4a4a',
                    opacity: 0.35,
                    lineWidth: 15,
                },
            },
            prevSvgHash: '',
        },
        hold: timer(),
    };
}

// append and remove only. No updates.
function syncShapes(shapes, root, renderShape) {
    const hashesInDom = new Map(), // by hash
    toRemove = [];
    for (const sc of shapes)
        hashesInDom.set(sc.hash, false);
    let el = root.firstChild, elHash;
    while (el) {
        elHash = el.getAttribute('cgHash');
        // found a shape element that's here to stay
        if (hashesInDom.has(elHash))
            hashesInDom.set(elHash, true);
        // or remove it
        else
            toRemove.push(el);
        el = el.nextSibling;
    }
    // remove old shapes
    for (const el of toRemove)
        root.removeChild(el);
    // insert shapes that are not yet in dom
    for (const sc of shapes) {
        if (!hashesInDom.get(sc.hash))
            root.appendChild(renderShape(sc));
    }
}

function createElement(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}
function renderSvg(state, svg, customSvg) {
    const d = state.drawable, curD = d.current, cur = curD && curD.mouseSq ? curD : undefined, arrowDests = new Map(), bounds = state.dom.bounds(), nonPieceAutoShapes = d.autoShapes.filter(autoShape => !autoShape.piece);
    for (const s of d.shapes.concat(nonPieceAutoShapes).concat(cur ? [cur] : [])) {
        if (s.dest)
            arrowDests.set(s.dest, (arrowDests.get(s.dest) || 0) + 1);
    }
    const shapes = d.shapes.concat(nonPieceAutoShapes).map((s) => {
        return {
            shape: s,
            current: false,
            hash: shapeHash(s, arrowDests, false, bounds),
        };
    });
    if (cur)
        shapes.push({
            shape: cur,
            current: true,
            hash: shapeHash(cur, arrowDests, true, bounds),
        });
    const fullHash = shapes.map(sc => sc.hash).join(';');
    if (fullHash === state.drawable.prevSvgHash)
        return;
    state.drawable.prevSvgHash = fullHash;
    /*
      -- DOM hierarchy --
      <svg class="cg-shapes">      (<= svg)
        <defs>
          ...(for brushes)...
        </defs>
        <g>
          ...(for arrows and circles)...
        </g>
      </svg>
      <svg class="cg-custom-svgs"> (<= customSvg)
        <g>
          ...(for custom svgs)...
        </g>
      </svg>
    */
    const defsEl = svg.querySelector('defs');
    const shapesEl = svg.querySelector('g');
    const customSvgsEl = customSvg.querySelector('g');
    syncDefs(d, shapes, defsEl);
    syncShapes(shapes.filter(s => !s.shape.customSvg), shapesEl, shape => renderShape$1(state, shape, d.brushes, arrowDests, bounds));
    syncShapes(shapes.filter(s => s.shape.customSvg), customSvgsEl, shape => renderShape$1(state, shape, d.brushes, arrowDests, bounds));
}
// append only. Don't try to update/remove.
function syncDefs(d, shapes, defsEl) {
    const brushes = new Map();
    let brush;
    for (const s of shapes) {
        if (s.shape.dest) {
            brush = d.brushes[s.shape.brush];
            if (s.shape.modifiers)
                brush = makeCustomBrush(brush, s.shape.modifiers);
            brushes.set(brush.key, brush);
        }
    }
    const keysInDom = new Set();
    let el = defsEl.firstChild;
    while (el) {
        keysInDom.add(el.getAttribute('cgKey'));
        el = el.nextSibling;
    }
    for (const [key, brush] of brushes.entries()) {
        if (!keysInDom.has(key))
            defsEl.appendChild(renderMarker(brush));
    }
}
function shapeHash({ orig, dest, brush, piece, modifiers, customSvg }, arrowDests, current, bounds) {
    return [
        bounds.width,
        bounds.height,
        current,
        orig,
        dest,
        brush,
        dest && (arrowDests.get(dest) || 0) > 1,
        piece && pieceHash(piece),
        modifiers && modifiersHash(modifiers),
        customSvg && customSvgHash(customSvg),
    ]
        .filter(x => x)
        .join(',');
}
function pieceHash(piece) {
    return [piece.color, piece.role, piece.scale].filter(x => x).join(',');
}
function modifiersHash(m) {
    return '' + (m.lineWidth || '');
}
function customSvgHash(s) {
    // Rolling hash with base 31 (cf. https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript)
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
    }
    return 'custom-' + h.toString();
}
function renderShape$1(state, { shape, current, hash }, brushes, arrowDests, bounds) {
    let el;
    const orig = orient(key2pos(shape.orig), state.orientation);
    if (shape.customSvg) {
        el = renderCustomSvg(shape.customSvg, orig, bounds);
    }
    else {
        if (shape.dest) {
            let brush = brushes[shape.brush];
            if (shape.modifiers)
                brush = makeCustomBrush(brush, shape.modifiers);
            el = renderArrow(brush, orig, orient(key2pos(shape.dest), state.orientation), current, (arrowDests.get(shape.dest) || 0) > 1, bounds);
        }
        else
            el = renderCircle(brushes[shape.brush], orig, current, bounds);
    }
    el.setAttribute('cgHash', hash);
    return el;
}
function renderCustomSvg(customSvg, pos, bounds) {
    const [x, y] = pos2user(pos, bounds);
    // Translate to top-left of `orig` square
    const g = setAttributes(createElement('g'), { transform: `translate(${x},${y})` });
    // Give 100x100 coordinate system to the user for `orig` square
    const svg = setAttributes(createElement('svg'), { width: 1, height: 1, viewBox: '0 0 100 100' });
    g.appendChild(svg);
    svg.innerHTML = customSvg;
    return g;
}
function renderCircle(brush, pos, current, bounds) {
    const o = pos2user(pos, bounds), widths = circleWidth(), radius = (bounds.width + bounds.height) / (4 * Math.max(bounds.width, bounds.height));
    return setAttributes(createElement('circle'), {
        stroke: brush.color,
        'stroke-width': widths[current ? 0 : 1],
        fill: 'none',
        opacity: opacity(brush, current),
        cx: o[0],
        cy: o[1],
        r: radius - widths[1] / 2,
    });
}
function renderArrow(brush, orig, dest, current, shorten, bounds) {
    const m = arrowMargin(shorten && !current), a = pos2user(orig, bounds), b = pos2user(dest, bounds), dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
    return setAttributes(createElement('line'), {
        stroke: brush.color,
        'stroke-width': lineWidth(brush, current),
        'stroke-linecap': 'round',
        'marker-end': 'url(#arrowhead-' + brush.key + ')',
        opacity: opacity(brush, current),
        x1: a[0],
        y1: a[1],
        x2: b[0] - xo,
        y2: b[1] - yo,
    });
}
function renderMarker(brush) {
    const marker = setAttributes(createElement('marker'), {
        id: 'arrowhead-' + brush.key,
        orient: 'auto',
        markerWidth: 4,
        markerHeight: 8,
        refX: 2.05,
        refY: 2.01,
    });
    marker.appendChild(setAttributes(createElement('path'), {
        d: 'M0,0 V4 L3,2 Z',
        fill: brush.color,
    }));
    marker.setAttribute('cgKey', brush.key);
    return marker;
}
function setAttributes(el, attrs) {
    for (const key in attrs)
        el.setAttribute(key, attrs[key]);
    return el;
}
function orient(pos, color) {
    return color === 'white' ? pos : [7 - pos[0], 7 - pos[1]];
}
function makeCustomBrush(base, modifiers) {
    return {
        color: base.color,
        opacity: Math.round(base.opacity * 10) / 10,
        lineWidth: Math.round(modifiers.lineWidth || base.lineWidth),
        key: [base.key, modifiers.lineWidth].filter(x => x).join(''),
    };
}
function circleWidth() {
    return [3 / 64, 4 / 64];
}
function lineWidth(brush, current) {
    return ((brush.lineWidth || 10) * (current ? 0.85 : 1)) / 64;
}
function opacity(brush, current) {
    return (brush.opacity || 1) * (current ? 0.9 : 1);
}
function arrowMargin(shorten) {
    return (shorten ? 20 : 10) / 64;
}
function pos2user(pos, bounds) {
    const xScale = Math.min(1, bounds.width / bounds.height);
    const yScale = Math.min(1, bounds.height / bounds.width);
    return [(pos[0] - 3.5) * xScale, (3.5 - pos[1]) * yScale];
}

function renderWrap(element, s) {
    // .cg-wrap (element passed to Chessground)
    //   cg-container
    //     cg-board
    //     svg.cg-shapes
    //       defs
    //       g
    //     svg.cg-custom-svgs
    //       g
    //     cg-auto-pieces
    //     coords.ranks
    //     coords.files
    //     piece.ghost
    element.innerHTML = '';
    // ensure the cg-wrap class is set
    // so bounds calculation can use the CSS width/height values
    // add that class yourself to the element before calling chessground
    // for a slight performance improvement! (avoids recomputing style)
    element.classList.add('cg-wrap');
    for (const c of colors)
        element.classList.toggle('orientation-' + c, s.orientation === c);
    element.classList.toggle('manipulable', !s.viewOnly);
    const container = createEl('cg-container');
    element.appendChild(container);
    const board = createEl('cg-board');
    container.appendChild(board);
    let svg;
    let customSvg;
    let autoPieces;
    if (s.drawable.visible) {
        svg = setAttributes(createElement('svg'), {
            class: 'cg-shapes',
            viewBox: '-4 -4 8 8',
            preserveAspectRatio: 'xMidYMid slice',
        });
        svg.appendChild(createElement('defs'));
        svg.appendChild(createElement('g'));
        customSvg = setAttributes(createElement('svg'), {
            class: 'cg-custom-svgs',
            viewBox: '-3.5 -3.5 8 8',
            preserveAspectRatio: 'xMidYMid slice',
        });
        customSvg.appendChild(createElement('g'));
        autoPieces = createEl('cg-auto-pieces');
        container.appendChild(svg);
        container.appendChild(customSvg);
        container.appendChild(autoPieces);
    }
    if (s.coordinates) {
        const orientClass = s.orientation === 'black' ? ' black' : '';
        const ranksPositionClass = s.ranksPosition === 'left' ? ' left' : '';
        container.appendChild(renderCoords(ranks, 'ranks' + orientClass + ranksPositionClass));
        container.appendChild(renderCoords(files, 'files' + orientClass));
    }
    let ghost;
    if (s.draggable.showGhost) {
        ghost = createEl('piece', 'ghost');
        setVisible(ghost, false);
        container.appendChild(ghost);
    }
    return {
        board,
        container,
        wrap: element,
        ghost,
        svg,
        customSvg,
        autoPieces,
    };
}
function renderCoords(elems, className) {
    const el = createEl('coords', className);
    let f;
    for (const elem of elems) {
        f = createEl('coord');
        f.textContent = elem;
        el.appendChild(f);
    }
    return el;
}

function drop(s, e) {
    if (!s.dropmode.active)
        return;
    unsetPremove(s);
    unsetPredrop(s);
    const piece = s.dropmode.piece;
    if (piece) {
        s.pieces.set('a0', piece);
        const position = eventPosition(e);
        const dest = position && getKeyAtDomPos(position, whitePov(s), s.dom.bounds());
        if (dest)
            dropNewPiece(s, 'a0', dest);
    }
    s.dom.redraw();
}

function bindBoard(s, onResize) {
    const boardEl = s.dom.elements.board;
    if ('ResizeObserver' in window)
        new ResizeObserver(onResize).observe(s.dom.elements.wrap);
    if (s.viewOnly)
        return;
    // Cannot be passive, because we prevent touch scrolling and dragging of
    // selected elements.
    const onStart = startDragOrDraw(s);
    boardEl.addEventListener('touchstart', onStart, {
        passive: false,
    });
    boardEl.addEventListener('mousedown', onStart, {
        passive: false,
    });
    if (s.disableContextMenu || s.drawable.enabled) {
        boardEl.addEventListener('contextmenu', e => e.preventDefault());
    }
}
// returns the unbind function
function bindDocument(s, onResize) {
    const unbinds = [];
    // Old versions of Edge and Safari do not support ResizeObserver. Send
    // chessground.resize if a user action has changed the bounds of the board.
    if (!('ResizeObserver' in window))
        unbinds.push(unbindable(document.body, 'chessground.resize', onResize));
    if (!s.viewOnly) {
        const onmove = dragOrDraw(s, move, move$1);
        const onend = dragOrDraw(s, end, end$1);
        for (const ev of ['touchmove', 'mousemove'])
            unbinds.push(unbindable(document, ev, onmove));
        for (const ev of ['touchend', 'mouseup'])
            unbinds.push(unbindable(document, ev, onend));
        const onScroll = () => s.dom.bounds.clear();
        unbinds.push(unbindable(document, 'scroll', onScroll, { capture: true, passive: true }));
        unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
    }
    return () => unbinds.forEach(f => f());
}
function unbindable(el, eventName, callback, options) {
    el.addEventListener(eventName, callback, options);
    return () => el.removeEventListener(eventName, callback, options);
}
function startDragOrDraw(s) {
    return e => {
        if (s.draggable.current)
            cancel(s);
        else if (s.drawable.current)
            cancel$1(s);
        else if (e.shiftKey || isRightButton(e)) {
            if (s.drawable.enabled)
                start$2(s, e);
        }
        else if (!s.viewOnly) {
            if (s.dropmode.active)
                drop(s, e);
            else
                start$1(s, e);
        }
    };
}
function dragOrDraw(s, withDrag, withDraw) {
    return e => {
        if (s.drawable.current) {
            if (s.drawable.enabled)
                withDraw(s, e);
        }
        else if (!s.viewOnly)
            withDrag(s, e);
    };
}

// ported from https://github.com/veloce/lichobile/blob/master/src/js/chessground/view.js
// in case of bugs, blame @veloce
function render$1(s) {
    const asWhite = whitePov(s), posToTranslate$1 = posToTranslate(s.dom.bounds()), boardEl = s.dom.elements.board, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : new Map(), fadings = curAnim ? curAnim.plan.fadings : new Map(), curDrag = s.draggable.current, squares = computeSquareClasses(s), samePieces = new Set(), sameSquares = new Set(), movedPieces = new Map(), movedSquares = new Map(); // by class name
    let k, el, pieceAtKey, elPieceName, anim, fading, pMvdset, pMvd, sMvdset, sMvd;
    // walk over all board dom elements, apply animations and flag moved pieces
    el = boardEl.firstChild;
    while (el) {
        k = el.cgKey;
        if (isPieceNode(el)) {
            pieceAtKey = pieces.get(k);
            anim = anims.get(k);
            fading = fadings.get(k);
            elPieceName = el.cgPiece;
            // if piece not being dragged anymore, remove dragging style
            if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
                el.classList.remove('dragging');
                translate(el, posToTranslate$1(key2pos(k), asWhite));
                el.cgDragging = false;
            }
            // remove fading class if it still remains
            if (!fading && el.cgFading) {
                el.cgFading = false;
                el.classList.remove('fading');
            }
            // there is now a piece at this dom key
            if (pieceAtKey) {
                // continue animation if already animating and same piece
                // (otherwise it could animate a captured piece)
                if (anim && el.cgAnimating && elPieceName === pieceNameOf(pieceAtKey)) {
                    const pos = key2pos(k);
                    pos[0] += anim[2];
                    pos[1] += anim[3];
                    el.classList.add('anim');
                    translate(el, posToTranslate$1(pos, asWhite));
                }
                else if (el.cgAnimating) {
                    el.cgAnimating = false;
                    el.classList.remove('anim');
                    translate(el, posToTranslate$1(key2pos(k), asWhite));
                    if (s.addPieceZIndex)
                        el.style.zIndex = posZIndex(key2pos(k), asWhite);
                }
                // same piece: flag as same
                if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.cgFading)) {
                    samePieces.add(k);
                }
                // different piece: flag as moved unless it is a fading piece
                else {
                    if (fading && elPieceName === pieceNameOf(fading)) {
                        el.classList.add('fading');
                        el.cgFading = true;
                    }
                    else {
                        appendValue(movedPieces, elPieceName, el);
                    }
                }
            }
            // no piece: flag as moved
            else {
                appendValue(movedPieces, elPieceName, el);
            }
        }
        else if (isSquareNode(el)) {
            const cn = el.className;
            if (squares.get(k) === cn)
                sameSquares.add(k);
            else
                appendValue(movedSquares, cn, el);
        }
        el = el.nextSibling;
    }
    // walk over all squares in current set, apply dom changes to moved squares
    // or append new squares
    for (const [sk, className] of squares) {
        if (!sameSquares.has(sk)) {
            sMvdset = movedSquares.get(className);
            sMvd = sMvdset && sMvdset.pop();
            const translation = posToTranslate$1(key2pos(sk), asWhite);
            if (sMvd) {
                sMvd.cgKey = sk;
                translate(sMvd, translation);
            }
            else {
                const squareNode = createEl('square', className);
                squareNode.cgKey = sk;
                translate(squareNode, translation);
                boardEl.insertBefore(squareNode, boardEl.firstChild);
            }
        }
    }
    // walk over all pieces in current set, apply dom changes to moved pieces
    // or append new pieces
    for (const [k, p] of pieces) {
        anim = anims.get(k);
        if (!samePieces.has(k)) {
            pMvdset = movedPieces.get(pieceNameOf(p));
            pMvd = pMvdset && pMvdset.pop();
            // a same piece was moved
            if (pMvd) {
                // apply dom changes
                pMvd.cgKey = k;
                if (pMvd.cgFading) {
                    pMvd.classList.remove('fading');
                    pMvd.cgFading = false;
                }
                const pos = key2pos(k);
                if (s.addPieceZIndex)
                    pMvd.style.zIndex = posZIndex(pos, asWhite);
                if (anim) {
                    pMvd.cgAnimating = true;
                    pMvd.classList.add('anim');
                    pos[0] += anim[2];
                    pos[1] += anim[3];
                }
                translate(pMvd, posToTranslate$1(pos, asWhite));
            }
            // no piece in moved obj: insert the new piece
            // assumes the new piece is not being dragged
            else {
                const pieceName = pieceNameOf(p), pieceNode = createEl('piece', pieceName), pos = key2pos(k);
                pieceNode.cgPiece = pieceName;
                pieceNode.cgKey = k;
                if (anim) {
                    pieceNode.cgAnimating = true;
                    pos[0] += anim[2];
                    pos[1] += anim[3];
                }
                translate(pieceNode, posToTranslate$1(pos, asWhite));
                if (s.addPieceZIndex)
                    pieceNode.style.zIndex = posZIndex(pos, asWhite);
                boardEl.appendChild(pieceNode);
            }
        }
    }
    // remove any element that remains in the moved sets
    for (const nodes of movedPieces.values())
        removeNodes(s, nodes);
    for (const nodes of movedSquares.values())
        removeNodes(s, nodes);
}
function renderResized$1(s) {
    const asWhite = whitePov(s), posToTranslate$1 = posToTranslate(s.dom.bounds());
    let el = s.dom.elements.board.firstChild;
    while (el) {
        if ((isPieceNode(el) && !el.cgAnimating) || isSquareNode(el)) {
            translate(el, posToTranslate$1(key2pos(el.cgKey), asWhite));
        }
        el = el.nextSibling;
    }
}
function updateBounds(s) {
    const bounds = s.dom.elements.wrap.getBoundingClientRect();
    const container = s.dom.elements.container;
    const ratio = bounds.height / bounds.width;
    const width = (Math.floor((bounds.width * window.devicePixelRatio) / 8) * 8) / window.devicePixelRatio;
    const height = width * ratio;
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    s.dom.bounds.clear();
    if (s.addDimensionsCssVars) {
        document.documentElement.style.setProperty('--cg-width', width + 'px');
        document.documentElement.style.setProperty('--cg-height', height + 'px');
    }
}
function isPieceNode(el) {
    return el.tagName === 'PIECE';
}
function isSquareNode(el) {
    return el.tagName === 'SQUARE';
}
function removeNodes(s, nodes) {
    for (const node of nodes)
        s.dom.elements.board.removeChild(node);
}
function posZIndex(pos, asWhite) {
    const minZ = 3;
    const rank = pos[1];
    const z = asWhite ? minZ + 7 - rank : minZ + rank;
    return `${z}`;
}
function pieceNameOf(piece) {
    return `${piece.color} ${piece.role}`;
}
function computeSquareClasses(s) {
    var _a;
    const squares = new Map();
    if (s.lastMove && s.highlight.lastMove)
        for (const k of s.lastMove) {
            addSquare(squares, k, 'last-move');
        }
    if (s.check && s.highlight.check)
        addSquare(squares, s.check, 'check');
    if (s.selected) {
        addSquare(squares, s.selected, 'selected');
        if (s.movable.showDests) {
            const dests = (_a = s.movable.dests) === null || _a === void 0 ? void 0 : _a.get(s.selected);
            if (dests)
                for (const k of dests) {
                    addSquare(squares, k, 'move-dest' + (s.pieces.has(k) ? ' oc' : ''));
                }
            const pDests = s.premovable.dests;
            if (pDests)
                for (const k of pDests) {
                    addSquare(squares, k, 'premove-dest' + (s.pieces.has(k) ? ' oc' : ''));
                }
        }
    }
    const premove = s.premovable.current;
    if (premove)
        for (const k of premove)
            addSquare(squares, k, 'current-premove');
    else if (s.predroppable.current)
        addSquare(squares, s.predroppable.current.key, 'current-premove');
    const o = s.exploding;
    if (o)
        for (const k of o.keys)
            addSquare(squares, k, 'exploding' + o.stage);
    return squares;
}
function addSquare(squares, key, klass) {
    const classes = squares.get(key);
    if (classes)
        squares.set(key, `${classes} ${klass}`);
    else
        squares.set(key, klass);
}
function appendValue(map, key, value) {
    const arr = map.get(key);
    if (arr)
        arr.push(value);
    else
        map.set(key, [value]);
}

function render(state, autoPieceEl) {
    const autoPieces = state.drawable.autoShapes.filter(autoShape => autoShape.piece);
    const autoPieceShapes = autoPieces.map((s) => {
        return {
            shape: s,
            hash: hash(s),
            current: false,
        };
    });
    syncShapes(autoPieceShapes, autoPieceEl, shape => renderShape(state, shape, state.dom.bounds()));
}
function renderResized(state) {
    var _a;
    const asWhite = whitePov(state), posToTranslate$1 = posToTranslate(state.dom.bounds());
    let el = (_a = state.dom.elements.autoPieces) === null || _a === void 0 ? void 0 : _a.firstChild;
    while (el) {
        translateAndScale(el, posToTranslate$1(key2pos(el.cgKey), asWhite), el.cgScale);
        el = el.nextSibling;
    }
}
function renderShape(state, { shape, hash }, bounds) {
    var _a, _b, _c;
    const orig = shape.orig;
    const role = (_a = shape.piece) === null || _a === void 0 ? void 0 : _a.role;
    const color = (_b = shape.piece) === null || _b === void 0 ? void 0 : _b.color;
    const scale = (_c = shape.piece) === null || _c === void 0 ? void 0 : _c.scale;
    const pieceEl = createEl('piece', `${role} ${color}`);
    pieceEl.setAttribute('cgHash', hash);
    pieceEl.cgKey = orig;
    pieceEl.cgScale = scale;
    translateAndScale(pieceEl, posToTranslate(bounds)(key2pos(orig), whitePov(state)), scale);
    return pieceEl;
}
function hash(autoPiece) {
    var _a, _b, _c;
    return [autoPiece.orig, (_a = autoPiece.piece) === null || _a === void 0 ? void 0 : _a.role, (_b = autoPiece.piece) === null || _b === void 0 ? void 0 : _b.color, (_c = autoPiece.piece) === null || _c === void 0 ? void 0 : _c.scale].join(',');
}

function Chessground(element, config) {
    const maybeState = defaults();
    configure(maybeState, config || {});
    function redrawAll() {
        const prevUnbind = 'dom' in maybeState ? maybeState.dom.unbind : undefined;
        // compute bounds from existing board element if possible
        // this allows non-square boards from CSS to be handled (for 3D)
        const elements = renderWrap(element, maybeState), bounds = memo(() => elements.board.getBoundingClientRect()), redrawNow = (skipSvg) => {
            render$1(state);
            if (elements.autoPieces)
                render(state, elements.autoPieces);
            if (!skipSvg && elements.svg)
                renderSvg(state, elements.svg, elements.customSvg);
        }, onResize = () => {
            updateBounds(state);
            renderResized$1(state);
            if (elements.autoPieces)
                renderResized(state);
        };
        const state = maybeState;
        state.dom = {
            elements,
            bounds,
            redraw: debounceRedraw(redrawNow),
            redrawNow,
            unbind: prevUnbind,
        };
        state.drawable.prevSvgHash = '';
        updateBounds(state);
        redrawNow(false);
        bindBoard(state, onResize);
        if (!prevUnbind)
            state.dom.unbind = bindDocument(state, onResize);
        state.events.insert && state.events.insert(elements);
        return state;
    }
    return start(redrawAll(), redrawAll);
}
function debounceRedraw(redrawNow) {
    let redrawing = false;
    return () => {
        if (redrawing)
            return;
        redrawing = true;
        requestAnimationFrame(() => {
            redrawNow();
            redrawing = false;
        });
    };
}

const PIECE_STYLES = [
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
const BOARD_STYLES = ["blue", "brown", "green", "ic", "purple"];
function parse_user_config(settings, content) {
    let userConfig = Object.assign(Object.assign({}, settings), { fen: "" });
    try {
        return Object.assign(Object.assign({}, userConfig), obsidian.parseYaml(content));
    }
    catch (e) {
        // failed to parse
        return userConfig;
    }
}

class StartingPosition {
    constructor(eco, name, fen, wikiPath, moves) {
        this.eco = eco;
        this.name = name;
        this.fen = fen;
        this.wikiPath = wikiPath;
        this.moves = moves;
    }
}
class Category {
    constructor(id, items) {
        this.id = id;
        this.items = items;
    }
}
const categories = [
    new Category("e4", [
        new StartingPosition("B00", "King's Pawn", "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1", "King's_Pawn_Game", ["e4"]),
        new StartingPosition("B00", "Open Game", "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", "Open_Game", ["e4 e5"]),
        new StartingPosition("B02", "Alekhine's Defence", "rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2", "Alekhine's_Defence", ["e4 Nf6"]),
        new StartingPosition("B04", "Alekhine's Defence: Modern Variation", "rnbqkb1r/ppp1pppp/3p4/3nP3/3P4/5N2/PPP2PPP/RNBQKB1R b KQkq - 1 4", "Alekhine's_Defence#Modern_Variation:_3.d4_d6_4.Nf3", ["e4 Nf6", "e5 Nd5", "d4 d6", "Nf3"]),
        new StartingPosition("C23", "Bishop's Opening", "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2", "Bishop%27s_Opening", ["e4 e5", "Bc4"]),
        new StartingPosition("B10", "Caro-Kann Defence", "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", "Caro–Kann_Defence", ["e4 c6"]),
        new StartingPosition("B12", "Caro-Kann Defence: Advance Variation", "rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3", "Caro–Kann_Defence#Advance_Variation:_3.e5", ["e4 c6", "d4 d5", "e5"]),
        new StartingPosition("B18", "Caro-Kann Defence: Classical Variation", "rn1qkbnr/pp2pppp/2p5/5b2/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5", "Caro–Kann_Defence#Classical_Variation:_4...Bf5", ["e4 c6", "d4 d5", "Nc3 dxe4", "Nxe4 Bf5"]),
        new StartingPosition("B13", "Caro-Kann Defence: Exchange Variation", "rnbqkbnr/pp2pppp/2p5/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3", "Caro%E2%80%93Kann_Defence#Exchange_Variation:_3.exd5_cxd5", ["e4 c6", "d4 d5", "exd5"]),
        new StartingPosition("B14", "Caro-Kann Defence: Panov-Botvinnik Attack", "rnbqkb1r/pp2pppp/5n2/3p4/2PP4/2N5/PP3PPP/R1BQKBNR b KQkq - 2 5", "Caro–Kann_Defence#Panov.E2.80.93Botvinnik_Attack:_4.c4", ["e4 c6", "d4 d5", "exd5 cxd5", "c4 Nf6", "Nc3"]),
        new StartingPosition("B17", "Caro-Kann Defence: Steinitz Variation", "r1bqkbnr/pp1npppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR w KQkq - 1 5", "Caro–Kann_Defence#Modern_Variation:_4...Nd7", ["e4 c6", "d4 d5", "Nc3 dxe4", "Nxe4 Nd7"]),
        new StartingPosition("C21", "Danish Gambit", "rnbqkbnr/pppp1ppp/8/8/3pP3/2P5/PP3PPP/RNBQKBNR b KQkq - 0 3", "Danish_Gambit", ["e4 e5", "d4 exd4", "c3"]),
        new StartingPosition("C46", "Four Knights Game", "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4", "Four_Knights_Game", ["e4 e5", "Nf3 Nc6", "Nc3 Nf6"]),
        new StartingPosition("C47", "Four Knights Game: Scotch Variation", "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 0 4", "Four_Knights_Game#4.d4", ["e4 e5", "Nf3 Nc6", "Nc3 Nf6", "d4"]),
        new StartingPosition("C48", "Four Knights Game: Spanish Variation", "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4", "Four_Knights_Game#4.Bb5", ["e4 e5", "Nf3 Nf6", "Nc3 Nc6", "Bb5"]),
        new StartingPosition("C00", "French Defence", "rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", "French_Defence", ["e4 e6"]),
        new StartingPosition("C02", "French Defence: Advance Variation", "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3", "French_Defence#Advance_Variation:_3.e5", ["e4 e6", "d4 d5", "e5"]),
        new StartingPosition("C11", "French Defence: Burn Variation", "rnbqkb1r/ppp2ppp/4pn2/3p2B1/3PP3/2N5/PPP2PPP/R2QKBNR b KQkq - 0 5", "French_Defence#3.Nc3", ["e4 e6", "d4 d5", "Nc3 Nf6", "Bg5 dxe4"]),
        new StartingPosition("C11", "French Defence: Classical Variation", "rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4", "French_Defence#Classical_Variation:_3...Nf6", ["e4 e6", "d4 d5", "Nc3 Nf6"]),
        new StartingPosition("C01", "French Defence: Exchange Variation", "rnbqkbnr/ppp2ppp/4p3/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3", "French_Defence#Exchange_Variation:_3.exd5_exd5", ["e4 e6", "d4 d5", "exd5"]),
        new StartingPosition("C10", "French Defence: Rubinstein Variation", "rnbqkbnr/ppp2ppp/4p3/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4", "French_Defence#Rubinstein_Variation:_3...dxe4", ["e4 e6", "d4 d5", "Nc3 dxe4"]),
        new StartingPosition("C03", "French Defence: Tarrasch Variation", "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPPN1PPP/R1BQKBNR b KQkq - 1 3", "French_Defence#Tarrasch_Variation:_3.Nd2", ["e4 e6", "d4 d5", "Nd2"]),
        new StartingPosition("C15", "French Defence: Winawer Variation", "rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4", "French_Defence#Winawer_Variation:_3...Bb4", ["e4 e6", "d4 d5", "Nc3 Bb4"]),
        new StartingPosition("C50", "Giuoco Piano", "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Giuoco_Piano", ["e4 e5", "Nf3 Nc6", "Bc4 Bc5"]),
        new StartingPosition("C50", "Italian Game", "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3", "Italian_Game", ["e4 e5", "Nf3 Nc6", "Bc4"]),
        new StartingPosition("C51", "Evans Gambit", "r1bqk1nr/pppp1ppp/2n5/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R b KQkq - 0 4", "Evans_Gambit", ["e4 e5", "Nf3 Nc6", "Bc4 Bc5", "b4"]),
        new StartingPosition("C50", "Italian Game: Hungarian Defence", "r1bqk1nr/ppppbppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Hungarian_Defense", ["e4 e5", "Nf3 Nc6", "Bc4 Be7"]),
        new StartingPosition("C55", "Italian Game: Two Knights Defence", "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Two_Knights_Defense", ["e4 e5", "Nf3 Nc6", "Bc4 Nf6"]),
        new StartingPosition("C30", "King's Gambit", "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2", "King's_Gambit", ["e4 e5", "f4"]),
        new StartingPosition("C33", "King's Gambit Accepted", "rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3", "King's_Gambit#King.27s_Gambit_Accepted:_2...exf4", ["e4 e5", "f4 exf4"]),
        new StartingPosition("C33", "King's Gambit Accepted: Bishop's Gambit", "rnbqkbnr/pppp1ppp/8/8/2B1Pp2/8/PPPP2PP/RNBQK1NR b KQkq - 1 3", "King's_Gambit#King.27s_Gambit_Accepted:_2...exf4", ["e4 e5", "f4 exf4", "Bc4"]),
        new StartingPosition("C36", "King's Gambit Accepted: Modern Defence", "rnbqkbnr/ppp2ppp/8/3p4/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq d6 0 4", "King's_Gambit#Modern_Defence:_3...d5", ["e4 e5", "f4 exf4", "Nf3 d5"]),
        new StartingPosition("C30", "King's Gambit Accepted: Classical Variation", "rnbqkbnr/pppp1p1p/8/6p1/4Pp2/5N2/PPPP2PP/RNBQKB1R w KQkq - 0 4", "King's_Gambit#Classical_Variation:_3...g5", ["e4 e5", "f4 exf4", "Nf3 g5"]),
        new StartingPosition("C30", "King's Gambit Declined: Classical Variation", "rnbqk1nr/pppp1ppp/8/2b1p3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 1 3", "King's_Gambit#Classical_Defence:_2...Bc5", ["e4 e5", "f4 Bc5"]),
        new StartingPosition("C31", "King's Gambit: Falkbeer Countergambit", "rnbqkbnr/ppp2ppp/8/3pp3/4PP2/8/PPPP2PP/RNBQKBNR w KQkq - 0 3", "King%27s_Gambit,_Falkbeer_Countergambit", ["e4 e5", "f4 d5"]),
        new StartingPosition("B06", "Modern Defence", "rnbqkbnr/pppppp1p/6p1/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", "Modern_Defense", ["e4 g6"]),
        new StartingPosition("B06", "Modern Defence: Robatsch Defence", "rnbqk1nr/ppppppbp/6p1/8/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 2 3", "Modern_Defense", ["e4 g6", "d4 Bg7", "Nc3"]),
        new StartingPosition("C41", "Philidor Defence", "rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3", "Philidor_Defence", ["e4 e5", "Nf3 d6"]),
        new StartingPosition("C41", "Philidor Defence: Lion Variation", "r1bqkb1r/pppn1ppp/3p1n2/4p3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 2 5", "Philidor_Defence", ["e4 d6", "d4 Nf6", "Nc3 e5", "Nf3 Nbd7"]),
        new StartingPosition("B07", "Lion Variation: Anti-Philidor", "r1bqkb1r/pppn1ppp/3p1n2/4p3/3PPP2/2N5/PPP3PP/R1BQKBNR w KQkq - 0 5", "Philidor_Defence", ["e4 d6", "d4 Nf6", "Nc3 Nbd7", "f4 e5"]),
        new StartingPosition("B07", "Pirc Defence", "rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 2 3", "Pirc_Defence", ["e4 d6", "d4 Nf6", "Nc3"]),
        new StartingPosition("B09", "Pirc Defence: Austrian Attack", "rnbqkb1r/ppp1pp1p/3p1np1/8/3PPP2/2N5/PPP3PP/R1BQKBNR b KQkq - 0 4", "Pirc_Defence#Austrian_Attack:_4.f4", ["e4 d6", "d4 Nf6", "Nc3 g6", "f4"]),
        new StartingPosition("B07", "Pirc Defence: Classical Variation", "rnbqkb1r/ppp1pp1p/3p1np1/8/3PP3/2N2N2/PPP2PPP/R1BQKB1R b KQkq - 1 4", "Pirc_Defence#Classical_.28Two_Knights.29_System:_4.Nf3", ["e4 d6", "d4 Nf6", "Nc3 g6", "Nf3"]),
        new StartingPosition("B07", "Pirc Defence: Lion Variation", "r1bqkb1r/pppnpppp/3p1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 3 4", "Pirc_Defence#Classical_.28Two_Knights.29_System", ["e4 d6", "d4 Nf6", "Nc3 Nbd7"]),
        new StartingPosition("C42", "Petrov's Defence", "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", "Petrov's_Defence", ["e4 e5", "Nf3 Nf6"]),
        new StartingPosition("C42", "Petrov's Defence: Classical Attack", "rnbqkb1r/ppp2ppp/3p4/8/3Pn3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 5", "Petrov's_Defence#3.Nxe5", ["e4 e5", "Nf3 Nf6", "Nxe5 d6", "Nf3 Nxe4", "d4"]),
        new StartingPosition("C43", "Petrov's Defence: Steinitz Attack", "rnbqkb1r/pppp1ppp/5n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3", "Petrov's_Defence#3.d4", ["e4 e5", "Nf3 Nf6", "d4"]),
        new StartingPosition("C42", "Petrov's Defence: Three Knights Game", "rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 3 3", "Petrov's_Defence#3.Nc3", ["e4 e5", "Nf3 Nf6", "Nc3"]),
        new StartingPosition("C60", "Ruy Lopez", "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3", "Ruy_Lopez", ["e4 e5", "Nf3 Nc6", "Bb5"]),
        new StartingPosition("C65", "Ruy Lopez: Berlin Defence", "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Ruy_Lopez#Berlin_Defence:_3...Nf6", ["e4 e5", "Nf3 Nc6", "Bb5 Nf6"]),
        new StartingPosition("C64", "Ruy Lopez: Classical Variation", "r1bqk1nr/pppp1ppp/2n5/1Bb1p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4", "Ruy_Lopez#Classical_Defence:_3...Bc5", ["e4 e5", "Nf3 Nc6", "Bb5 Bc5"]),
        new StartingPosition("C84", "Ruy Lopez: Closed Variation", "r1bqk2r/2ppbppp/p1n2n2/1p2p3/4P3/1B3N2/PPPP1PPP/RNBQR1K1 b kq - 1 7", "Ruy_Lopez#Main_line:_4.Ba4_Nf6_5.0-0_Be7_6.Re1_b5_7.Bb3_d6_8.c3_0-0", ["e4 e5", "Nf3 Nc6", "Bb5 a6", "Ba4 Nf6", "O-O Be7", "Re1 b5", "Bb3"]),
        new StartingPosition("C68", "Ruy Lopez: Exchange Variation", "r1bqkbnr/1ppp1ppp/p1B5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 4", "Ruy_Lopez,_Exchange_Variation", ["e4 e5", "Nf3 Nc6", "Bb5 a6", "Bxc6"]),
        new StartingPosition("C89", "Ruy Lopez: Marshall Attack", "r1bq1rk1/2p1bppp/p1n2n2/1p1pp3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 w - - 0 9", "Ruy_Lopez#Marshall_Attack", ["e4 e5", "Nf3 Nc6", "Bb5 a6", "Ba4 Nf6", "O-O Be7", "Re1 b5", "Bb3 O-O", "c3 d5"]),
        new StartingPosition("C63", "Ruy Lopez: Schliemann Defence", "r1bqkbnr/pppp2pp/2n5/1B2pp2/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4", "Ruy_Lopez#Schliemann_Defence:_3...f5", ["e4 e5", "Nf3 Nc6", "Bb5 f5"]),
        new StartingPosition("B01", "Scandinavian Defence", "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", "Scandinavian_Defense", ["e4 d5"]),
        new StartingPosition("B01", "Scandinavian Defence: Modern Variation", "rnbqkb1r/ppp1pppp/5n2/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3", "Scandinavian_Defense#2...Nf6", ["e4 d5", "exd5 Nf6", "d4"]),
        new StartingPosition("B01", "Scandinavian Defence: Icelandic-Palme Gambit", "rnbqkb1r/ppp2ppp/4pn2/3P4/2P5/8/PP1P1PPP/RNBQKBNR w KQkq - 0 4", "Scandinavian_Defense#2...Nf6", ["e4 d5", "exd5 Nf6", "c4 e6"]),
        new StartingPosition("C44", "Scotch Game", "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3", "Scotch_Game", ["e4 e5", "Nf3 Nc6", "d4"]),
        new StartingPosition("C45", "Scotch Game: Classical Variation", "r1bqk1nr/pppp1ppp/2n5/2b5/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5", "Scotch_Game,_Classical_Variation", ["e4 e5", "Nf3 Nc6", "d4 exd4", "Nxd4 Bc5"]),
        new StartingPosition("C45", "Scotch Game: Mieses Variation", "r1bqkb1r/p1pp1ppp/2p2n2/4P3/8/8/PPP2PPP/RNBQKB1R b KQkq - 0 6", "Scotch_Game#Schmidt_Variation:_4...Nf6", ["e4 e5", "Nf3 Nc6", "d4 exd4", "Nxd4 Nf6", "Nxc6 bxc6", "e5"]),
        new StartingPosition("C45", "Scotch Game: Steinitz Variation", "r1b1kbnr/pppp1ppp/2n5/8/3NP2q/8/PPP2PPP/RNBQKB1R w KQkq - 1 5", "Scotch_Game#Steinitz_Variation:_4...Qh4.21.3F", ["e4 e5", "Nf3 Nc6", "d4 exd4", "Nxd4 Qh4"]),
        new StartingPosition("B20", "Sicilian Defence", "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2", "Sicilian_Defence", ["e4 c5"]),
        new StartingPosition("B36", "Sicilian Defence: Accelerated Dragon", "r1bqkbnr/pp1ppp1p/2n3p1/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5", "Sicilian_Defence,_Accelerated_Dragon", ["e4 c5", "Nf3 Nc6", "d4 cxd4", "Nxd4 g6"]),
        new StartingPosition("B22", "Sicilian Defence: Alapin Variation", "rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 2", "Sicilian_Defence,_Alapin_Variation", ["e4 c5", "c3"]),
        new StartingPosition("B23", "Sicilian Defence: Closed Variation", "rnbqkbnr/pp1ppppp/8/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2", "Sicilian_Defence#Closed_Sicilian", ["e4 c5", "Nc3"]),
        new StartingPosition("B70", "Sicilian Defence: Dragon Variation", "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6", "Sicilian_Defence,_Dragon_Variation", ["e4 c5", "Nf3 d6", "d4 cxd4", "Nxd4 Nf6", "Nc3 g6"]),
        new StartingPosition("B23", "Sicilian Defence: Grand Prix Attack", "nbqkbnr/pp1ppppp/8/2p5/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2", "Sicilian_Defence#Grand_Prix_Attack", ["e4 c5", "f4"]),
        new StartingPosition("B27", "Sicilian Defence: Hyper-Accelerated Dragon", "rnbqkbnr/pp1ppp1p/6p1/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3", "Sicilian_Defence#2...g6:_Hungarian_Variation", ["e4 c5", "Nf3 g6"]),
        new StartingPosition("B41", "Sicilian Defence: Kan Variation", "rnbqkbnr/1p1p1ppp/p3p3/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5", "Sicilian_Defence#Kan_.28Paulsen.29_Variation:_4...a6", ["e4 c5", "Nf3 e6", "d4 cxd4", "Nxd4 a6"]),
        new StartingPosition("B90", "Sicilian Defence: Najdorf Variation", "rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6", "Sicilian_Defence,_Najdorf_Variation", ["e4 c5", "Nf3 d6", "d4 cxd4", "Nxd4 Nf6", "Nc3 a6"]),
        new StartingPosition("B60", "Sicilian Defence: Richter-Rauzer Variation", "r1bqkb1r/pp2pppp/2np1n2/6B1/3NP3/2N5/PPP2PPP/R2QKB1R b KQkq - 4 6", "Sicilian_Defence#Classical_Variation:_5...Nc6", ["e4 c5", "Nf3 d6", "d4 cxd4", "Nxd4 Nf6", "Nc3 Nc6", "Bg5"]),
        new StartingPosition("B80", "Sicilian Defence: Scheveningen Variation", "rnbqkb1r/pp3ppp/3ppn2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6", "Sicilian_Defence,_Scheveningen_Variation", ["e4 c5", "Nf3 d6", "d4 cxd4", "Nxd4 Nf6", "Nc3 e6"]),
        new StartingPosition("B21", "Sicilian Defence: Smith-Morra Gambit", "rnbqkbnr/pp1ppppp/8/8/3pP3/2P5/PP3PPP/RNBQKBNR b KQkq - 0 3", "Sicilian_Defence,_Smith–Morra_Gambit", ["e4 c5", "d4 cxd4", "c3"]),
        new StartingPosition("C25", "Vienna Game", "rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2", "Vienna_Game", ["e4 e5", " Nc3"]),
        new StartingPosition("C27", "Vienna Game: Frankenstein-Dracula Variation", "rnbqkb1r/pppp1ppp/8/4p3/2B1n3/2N5/PPPP1PPP/R1BQK1NR w KQkq - 0 4", "Frankenstein-Dracula_Variation", ["e4 e5", "Nc3 Nf6", "Bc4 Nxe4"]),
        new StartingPosition("C46", "Four Knights Game: Halloween Gambit", "r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/2N5/PPPP1PPP/R1BQKB1R b KQkq - 0 4", "Halloween_Gambit", ["e4 e5", "Nf3 Nc6", "Nc3 Nf6", "Nxe5"]),
        new StartingPosition("C20", "King's Pawn Game: Wayward Queen Attack", "rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2", "Danvers_Opening", ["e4 e5", "Qh5"]),
        new StartingPosition("C20", "Bongcloud Attack", "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR b kq - 1 2", "Bong", ["e4 e5", "Ke2"]),
    ]),
    new Category("d4", [
        new StartingPosition("A40", "Queen's Pawn", "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1", "Queen's_Pawn_Game", ["d4"]),
        new StartingPosition("A57", "Benko Gambit", "rnbqkb1r/p2ppppp/5n2/1ppP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq - 0 4", "Benko_Gambit", ["d4 Nf6", "c4 c5", "d5 b5"]),
        new StartingPosition("A61", "Benoni Defence: Modern Benoni", "rnbqkb1r/pp1p1ppp/4pn2/2pP4/2P5/8/PP2PPPP/RNBQKBNR w KQkq - 0 4", "Modern_Benoni", ["d4 Nf6", "c4 c5", "d5 e6"]),
        new StartingPosition("A43", "Benoni Defence: Czech Benoni", "rnbqkb1r/pp1p1ppp/5n2/2pPp3/2P5/8/PP2PPPP/RNBQKBNR w KQkq e6 0 4", "Benoni_Defense#Czech_Benoni:_1.d4_Nf6_2.c4_c5_3.d5_e5", ["d4 Nf6", "c4 c5", "d5 e5"]),
        new StartingPosition("D00", "Blackmar Gambit", "rnbqkbnr/ppp1pppp/8/3p4/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2", "Blackmar–Diemer_Gambit", ["d4 d5", "e4"]),
        new StartingPosition("E11", "Bogo-Indian Defence", "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 2 4", "Bogo-Indian_Defence", ["d4 Nf6", "c4 e6", "Nf3 Bb4+"]),
        new StartingPosition("E00", "Catalan Opening", "rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3", "Catalan_Opening", ["d4 Nf6", "c4 e6", "g3"]),
        new StartingPosition("E06", "Catalan Opening: Closed Variation", "rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq - 3 5", "Catalan_Opening", ["d4 Nf6", "c4 e6", "g3 d5", "Nf3 Be7", "Bg2"]),
        new StartingPosition("A80", "Dutch Defence", "rnbqkbnr/ppppp1pp/8/5p2/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2", "Dutch_Defence", ["d4 f5"]),
        new StartingPosition("A96", "Dutch Defence: Classical Variation", "rnbq1rk1/ppp1b1pp/3ppn2/5p2/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - - 0 7", "Dutch_Defence", ["d4 f5", "c4 Nf6", "g3 e6", "Bg2 Be7", "Nf3 O-O", "O-O d6"]),
        new StartingPosition("A87", "Dutch Defence: Leningrad Variation", "rnbqk2r/ppppp1bp/5np1/5p2/2PP4/5NP1/PP2PPBP/RNBQK2R b KQkq - 3 5", "Dutch_Defence", ["d4 f5", "c4 Nf6", "g3 g6", "Bg2 Bg7", "Nf3"]),
        new StartingPosition("A83", "Dutch Defence: Staunton Gambit", "rnbqkb1r/ppppp1pp/5n2/6B1/3Pp3/2N5/PPP2PPP/R2QKBNR b KQkq - 3 4", "Dutch_Defence", ["d4 f5", "e4 fxe4", "Nc3 Nf6", "Bg5"]),
        new StartingPosition("A92", "Dutch Defence: Stonewall Variation", "rnbq1rk1/ppp1b1pp/4pn2/3p1p2/2PP4/5NP1/PP2PPBP/RNBQ1RK1 w - - 0 7", "Dutch_Defence", ["d4 f5", "c4 Nf6", "g3 e6", "Bg2 Be7", "Nf3 O-O", "O-O d5"]),
        new StartingPosition("D80", "Grünfeld Defence", "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4", "Grünfeld_Defence", ["d4 Nf6", "c4 g6", "Nc3 d5"]),
        new StartingPosition("D82", "Grünfeld Defence: Brinckmann Attack", "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP1B2/2N5/PP2PPPP/R2QKBNR b KQkq - 1 4", "Grünfeld_Defence#Lines_with_4.Bf4_and_the_Gr.C3.BCnfeld_Gambit", ["d4 Nf6", "c4 g6", "Nc3 d5", "Bf4"]),
        new StartingPosition("D85", "Grünfeld Defence: Exchange Variation", "rnbqkb1r/ppp1pp1p/6p1/3n4/3P4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 5", "Grünfeld_Defence#Exchange_Variation:_4.cxd5_Nxd5_5.e4", ["d4 Nf6", "c4 g6", "Nc3 d5", "cxd5 Nxd5"]),
        new StartingPosition("D80", "Grünfeld Defence: Russian Variation", "rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/1QN5/PP2PPPP/R1B1KBNR b KQkq - 1 4", "Grünfeld_Defence#Russian_System:_4.Nf3_Bg7_5.Qb3", ["d4 Nf6", "c4 g6", "Nc3 d5", "Qb3"]),
        new StartingPosition("D90", "Grünfeld Defence: Taimanov Variation", "rnbqk2r/ppp1ppbp/5np1/3p2B1/2PP4/2N2N2/PP2PPPP/R2QKB1R b KQkq - 3 5", "Grünfeld_Defence#Taimanov.27s_Variation_with_4.Nf3_Bg7_5.Bg5", ["d4 Nf6", "c4 g6", "Nc3 d5", "Nf3 Bg7", "Bg5"]),
        new StartingPosition("E61", "King's Indian Defence", "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3", "King's_Indian_Defence", ["d4 Nf6", "c4 g6"]),
        new StartingPosition("E77", "King's Indian Defence: 4.e4", "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N5/PP3PPP/R1BQKBNR w KQkq - 0 5", "King's_Indian_Defence", ["d4 Nf6", "c4 g6", "Nc3 Bg7", "e4 d6"]),
        new StartingPosition("E73", "King's Indian Defence: Averbakh Variation", "rnbq1rk1/ppp1ppbp/3p1np1/6B1/2PPP3/2N5/PP2BPPP/R2QK1NR b KQ - 3 6", "King's_Indian_Defence#Averbakh_Variation:_5.Be2_0-0_6.Bg5", ["d4 Nf6", "c4 g6", "Nc3 Bg7", "e4 d6", "Be2 O-O", "Bg5"]),
        new StartingPosition("E62", "King's Indian Defence: Fianchetto Variation", "rnbqk2r/ppp1ppbp/3p1np1/8/2PP4/2N2NP1/PP2PP1P/R1BQKB1R b KQkq - 0 5", "King's_Indian_Defence#Fianchetto_Variation:_3.Nf3_Bg7_4.g3", ["d4 Nf6", "c4 g6", "Nc3 Bg7", "Nf3 d6", "g3"]),
        new StartingPosition("E76", "King's Indian Defence: Four Pawns Attack", "rnbqk2r/ppp1ppbp/3p1np1/8/2PPPP2/2N5/PP4PP/R1BQKBNR b KQkq - 0 5", "King%27s_Indian_Defence,_Four_Pawns_Attack", ["d4 Nf6", "c4 g6", "Nc3 Bg7", "e4 d6", "f4"]),
        new StartingPosition("E91", "King's Indian Defence: Classical Variation", "rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R b KQ - 3 6", "King's_Indian_Defence#Classical_Variation:_5.Nf3_0-0_6.Be2_e5", ["d4 Nf6", "c4 g6", "Nc3 Bg7", "e4 d6", "Nf3 O-O", "Be2"]),
        new StartingPosition("E80", "King's Indian Defence: Sämisch Variation", "rnbqk2r/ppp1ppbp/3p1np1/8/2PPP3/2N2P2/PP4PP/R1BQKBNR b KQkq - 0 5", "King's_Indian_Defence#S.C3.A4misch_Variation:_5.f3", ["d4 Nf6", "c4 g6", "Nc3 Bg7", "e4 d6", "f3"]),
        new StartingPosition("A41", "Queens's Pawn Game: Modern Defence", "rnbqk1nr/ppp1ppbp/3p2p1/8/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4", "Queen's_Pawn_Game#1...g6", ["d4 g6", "c4 d6", "Nc3 Bg7"]),
        new StartingPosition("E20", "Nimzo-Indian Defence", "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4", "Nimzo-Indian_Defence", ["d4 Nf6", "c4 e6", "Nc3 Bb4"]),
        new StartingPosition("E32", "Nimzo-Indian Defence: Classical Variation", "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PPQ1PPPP/R1B1KBNR b KQkq - 3 4", "Nimzo-Indian_Defence#Classical_Variation:_4.Qc2", ["d4 Nf6", "c4 e6", "Nc3 Bb4", "Qc2"]),
        new StartingPosition("E43", "Nimzo-Indian Defence: Fischer Variation", "rnbqk2r/p1pp1ppp/1p2pn2/8/1bPP4/2N1P3/PP3PPP/R1BQKBNR w KQkq - 0 5", "Nimzo-Indian_Defence#4...b6", ["d4 Nf6", "c4 e6", "Nc3 Bb4", "e3 b6"]),
        new StartingPosition("E41", "Nimzo-Indian Defence: Hübner Variation", "r1bqk2r/pp3ppp/2nppn2/2p5/2PP4/2PBPN2/P4PPP/R1BQK2R w KQkq - 0 8", "Nimzo-Indian_Defence#4...c5", ["d4 Nf6", "c4 e6", "Nc3 Bb4", "e3 c5", "Bd3 Nc6", "Nf3 Bxc3+", "bxc3 d6"]),
        new StartingPosition("E21", "Nimzo-Indian Defence: Kasparov Variation", "rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 3 4", "Nimzo-Indian_Defence#Kasparov_Variation:_4.Nf3", ["d4 Nf6", "c4 e6", "Nc3 Bb4", "Nf3"]),
        new StartingPosition("E30", "Nimzo-Indian Defence: Leningrad Variation", "rnbqk2r/pppp1ppp/4pn2/6B1/1bPP4/2N5/PP2PPPP/R2QKBNR b KQkq - 3 4", "Nimzo-Indian_Defence#Other_variations", ["d4 Nf6", "c4 e6", "Nc3 Bb4", "Bg5"]),
        new StartingPosition("E26", "Nimzo-Indian Defence: Sämisch Variation", "rnbqk2r/pppp1ppp/4pn2/8/2PP4/P1P5/4PPPP/R1BQKBNR b KQkq - 0 5", "Nimzo-Indian_Defence#Other_variations", ["d4 Nf6", "c4 e6", "Nc3 Bb4", "a3 Bxc3+", "bxc3"]),
        new StartingPosition("A53", "Old Indian Defence", "rnbqkb1r/ppp1pppp/3p1n2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3", "Old_Indian_Defense", ["d4 Nf6", "c4 d6"]),
        new StartingPosition("D06", "Queen's Gambit", "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2", "Queen's_Gambit", ["d4 d5", "c4"]),
        new StartingPosition("D20", "Queen's Gambit Accepted", "rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3", "Queen%27s_Gambit_Accepted", ["d4 d5", "c4 dxc4"]),
        new StartingPosition("D43", "Queen's Gambit Declined: Semi-Slav Defence", "rnbqkb1r/pp3ppp/2p1pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5", "Semi-Slav_Defense", ["d4 d5", "c4 e6", "Nc3 Nf6", "Nf3 c6"]),
        new StartingPosition("D10", "Queen's Gambit Declined: Slav Defence", "rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3", "Slav_Defense", ["d4 d5", "c4 c6"]),
        new StartingPosition("D40", "Queen's Gambit Declined: Semi-Tarrasch Defence", "rnbqkb1r/pp3ppp/4pn2/2pp4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5", "Tarrasch_Defense#Semi-Tarrasch_Defense", ["d4 d5", "c4 e6", "Nc3 Nf6", "Nf3 c5"]),
        new StartingPosition("D32", "Queen's Gambit Declined: Tarrasch Defence", "rnbqkbnr/pp3ppp/4p3/2pp4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 4", "Tarrasch_Defense", ["d4 d5", "c4 e6", "Nc3 c5"]),
        new StartingPosition("D08", "Queen's Gambit: Albin Countergambit", "rnbqkbnr/ppp2ppp/8/3pp3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3", "Albin_Countergambit", ["d4 d5", "c4 e5"]),
        new StartingPosition("D07", "Queen's Gambit: Chigorin Defence", "r1bqkbnr/ppp1pppp/2n5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3", "Chigorin_Defense", ["d4 d5", "c4 Nc6"]),
        new StartingPosition("E12", "Queen's Indian Defence", "rnbqkb1r/p1pp1ppp/1p2pn2/8/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 4", "Queen's_Indian_Defense", ["d4 Nf6", "c4 e6", "Nf3 b6"]),
        new StartingPosition("D02", "London System", "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3", "London_System", ["d4 d5", "Nf3 Nf6", "Bf4"]),
        new StartingPosition("D00", "London System: Mason Attack", "rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2", "London_System", ["d4 d5", "Bf4"]),
        new StartingPosition("D01", "Rapport-Jobava System", "rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2N5/PPP1PPPP/R2QKBNR b KQkq - 3 3", "London_System", ["d4 d5", "Nc3 Nf6", "Bf4"]),
        new StartingPosition("D03", "Torre Attack", "rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3", "Torre_Attack", ["d4 d5", "Nf3 Nf6", "Bg5"]),
        new StartingPosition("D01", "Richter-Veresov Attack", "rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/2N5/PPP1PPPP/R2QKBNR b KQkq - 3 3", "Richter-Veresov_Attack", ["d4 d5", "Nc3 Nf6", "Bg5"]),
        new StartingPosition("A52", "Budapest Defence", "rnbqkb1r/pppp1ppp/5n2/4p3/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3", "Budapest_Gambit", ["d4 Nf6", "c4 e5"]),
        new StartingPosition("D00", "Closed Game", "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2", "Closed_Game", ["d4 d5"]),
        new StartingPosition("A45", "Trompowsky Attack", "rnbqkb1r/pppppppp/5n2/6B1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq - 2 2", "Trompowsky_Attack", ["d4 Nf6", "Bg5"]),
    ]),
    new Category("Nf3", [
        new StartingPosition("A04", "Zukertort Opening", "rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1", "Zukertort_Opening", ["Nf3"]),
        new StartingPosition("A07", "King's Indian Attack", "rnbqkbnr/ppp1pppp/8/3p4/8/5NP1/PPPPPP1P/RNBQKB1R b KQkq - 0 2", "King's_Indian_Attack", ["Nf3 d5", "g3"]),
        new StartingPosition("A09", "Réti Opening", "rnbqkbnr/ppp1pppp/8/3p4/2P5/5N2/PP1PPPPP/RNBQKB1R b KQkq - 0 2", "Réti_Opening", ["Nf3 d5", "c4"]),
    ]),
    new Category("c4", [
        new StartingPosition("A10", "English Opening", "rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b KQkq - 0 1", "English_Opening", ["c4"]),
        new StartingPosition("A20", "English Opening: Reversed Sicilian", "rnbqkbnr/pppp1ppp/8/4p3/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2", "English_Opening", ["c4 e5"]),
        new StartingPosition("A30", "English Opening: Symmetrical Variation", "rnbqkbnr/pp1ppppp/8/2p5/2P5/8/PP1PPPPP/RNBQKBNR w KQkq - 0 2", "English_Opening", ["c4 c5"]),
        new StartingPosition("A26", "English Opening: Closed System", "r1bqk1nr/ppp2pbp/2np2p1/4p3/2P5/2NP2P1/PP2PPBP/R1BQK1NR w KQkq - 0 6", "English_Opening", ["c4 e5", "Nc3 Nc6", "g3 g6", "Bg2 Bg7", "d3 d6"]),
    ]),
    new Category("b3", [
        new StartingPosition("A01", "Nimzo-Larsen Attack", "rnbqkbnr/pppppppp/8/8/8/1P6/P1PPPPPP/RNBQKBNR b KQkq - 0 1", "Larsen's_Opening", ["b3"]),
    ]),
    new Category("b4", [
        new StartingPosition("A00", "Sokolsky Opening", "rnbqkbnr/pppppppp/8/8/1P6/8/P1PPPPPP/RNBQKBNR b KQkq - 0 1", "Sokolsky_Opening", ["b4"]),
    ]),
    new Category("f4", [
        new StartingPosition("A02", "Bird's Opening", "rnbqkbnr/pppppppp/8/8/5P2/8/PPPPP1PP/RNBQKBNR b KQkq - 0 1", "Bird's_Opening", ["f4"]),
        new StartingPosition("A02", "Bird's Opening: Dutch Variation", "rnbqkbnr/ppp1pppp/8/3p4/5P2/8/PPPPP1PP/RNBQKBNR w KQkq - 0 2", "Bird's_Opening", ["f4 d5"]),
    ]),
    new Category("g3", [
        new StartingPosition("A00", "Hungarian Opening", "rnbqkbnr/pppppppp/8/8/8/6P1/PPPPPP1P/RNBQKBNR b KQkq - 0 1", "King's_Fianchetto_Opening", ["g3"]),
    ]),
];

class ChesserMenu {
    constructor(parentEl, chesser) {
        this.chesser = chesser;
        this.containerEl = parentEl.createDiv("chess-menu-container", (containerEl) => {
            containerEl.createDiv({ cls: "chess-menu-section" }, (sectionEl) => {
                const selectEl = sectionEl.createEl("select", {
                    cls: "dropdown chess-starting-position-dropdown",
                }, (el) => {
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
                        categories.forEach((category) => {
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
                });
                selectEl.addEventListener("change", (ev) => {
                    const value = ev.target.value;
                    if (value === "starting-position") {
                        this.chesser.loadFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", []);
                        return;
                    }
                    const startingPosition = categories
                        .flatMap((cat) => cat.items)
                        .find((item) => item.eco === value);
                    this.chesser.loadFen(startingPosition.fen, startingPosition.moves);
                });
                new obsidian.Setting(sectionEl).setName("Enable Free Move?").addToggle((toggle) => {
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
    getStartingPositionFromFen(fen) {
        return categories.flatMap((cat) => cat.items).find((item) => item.eco === fen);
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
            btn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                e.preventDefault();
                try {
                    yield navigator.clipboard.writeText(this.chesser.getFen());
                    new obsidian.Notice("FEN copié !");
                }
                catch (_a) {
                    new obsidian.Notice("Erreur lors de la copie du FEN");
                }
            }));
        });
        btnContainer.createEl("a", "view-action", (btn) => {
            btn.ariaLabel = "Copy PGN";
            obsidian.setIcon(btn, "scroll-text");
            btn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                e.preventDefault();
                const content = this.chesser.getPgn();
                try {
                    yield navigator.clipboard.writeText(content);
                    new obsidian.Notice("PGN copié !");
                }
                catch (_a) {
                    new obsidian.Notice("Erreur lors de la copie du PGN");
                }
            }));
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
                    cls: `chess-move ${this.chesser.currentMoveIdx === idx ? "chess-move-active" : ""}`,
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

function debug(debugFn) {
    if (process.env.DEBUG) {
        debugFn();
    }
}

function draw_chessboard(app, settings) {
    return (source, el, ctx) => {
        let user_config = parse_user_config(settings, source);
        ctx.addChild(new Chesser(el, ctx, user_config, app));
    };
}
function write_state(id, state) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = `.ChesserStorage/${id}.json`;
        const content = JSON.stringify(state, null, 2);
        const adapter = app.vault.adapter;
        try {
            const exists = yield adapter.exists(fileName);
            if (exists) {
                yield adapter.write(fileName, content);
            }
            else {
                // Check that the folder exists
                const folderPath = `.ChesserStorage`;
                const folderExists = yield adapter.exists(folderPath);
                if (!folderExists) {
                    yield adapter.mkdir(folderPath);
                }
                yield adapter.write(fileName, content);
            }
        }
        catch (err) {
            console.error("Error writing file .json :", err);
        }
    });
}
function read_state(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = `.ChesserStorage/${id}.json`;
        const adapter = app.vault.adapter;
        try {
            const exists = yield adapter.exists(fileName);
            if (!exists)
                return null;
            const content = yield adapter.read(fileName);
            return JSON.parse(content);
        }
        catch (err) {
            console.error("Error reading or parsing JSON :", err);
            return null;
        }
    });
}
class Chesser extends obsidian.MarkdownRenderChild {
    constructor(containerEl, ctx, user_config, app) {
        var _a, _b, _c, _d;
        super(containerEl);
        this.app = app;
        this.ctx = ctx;
        this.id = (_a = user_config.id) !== null && _a !== void 0 ? _a : nanoid(8);
        this.chess = new chess.Chess();
        const saved_config = read_state(this.id);
        const config = Object.assign({}, user_config, saved_config);
        this.user_config = user_config; // required for the function loadInitialPosition()
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
        if ((_b = config.pgn) === null || _b === void 0 ? void 0 : _b.trim()) {
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
                this.startingPosition = new StartingPosition("Xxx", "Custom", this.chess.fen(), "Custom", movePairs);
            }
            catch (e) {
                console.error("PGN loading error:", e);
            }
        }
        if (config.fen) {
            debug(() => console.debug("loading from fen", config.fen));
            this.chess.load(config.fen);
        }
        this.moves = (_c = config.moves) !== null && _c !== void 0 ? _c : this.chess.history({ verbose: true });
        this.currentMoveIdx = (_d = config.currentMoveIdx) !== null && _d !== void 0 ? _d : this.moves.length - 1;
        let lastMove = undefined;
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
                orientation: config.orientation,
                viewOnly: config.viewOnly,
                drawable: {
                    enabled: config.drawable,
                    onChange: this.save_shapes,
                },
            });
        }
        catch (e) {
            new obsidian.Notice("Chesser error: Invalid config");
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
    set_style(el, pieceStyle, boardStyle) {
        el.addClasses([pieceStyle, `${boardStyle}-board`, "chesser-container"]);
    }
    get_section_range() {
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
    get_config(view) {
        const [from, to] = this.get_section_range();
        const codeblockText = view.editor.getRange(from, to);
        try {
            return obsidian.parseYaml(codeblockText);
        }
        catch (e) {
            debug(() => console.debug("failed to parse codeblock's yaml config", codeblockText));
            // failed to parse. show error...
        }
        return undefined;
    }
    write_config(config) {
        debug(() => console.debug("writing config to localStorage", config));
        const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (!view) {
            new obsidian.Notice("Chesser: Failed to retrieve active view");
            console.error("Chesser: Failed to retrieve view when writing config");
        }
        try {
            const updated = obsidian.stringifyYaml(Object.assign(Object.assign({}, this.get_config(view)), config));
            const [from, to] = this.get_section_range();
            view.editor.replaceRange(updated, from, to);
        }
        catch (e) {
            // failed to parse. show error...
            console.error("failed to write config", e);
        }
    }
    save_move() {
        const config = read_state(this.id);
        write_state(this.id, Object.assign(Object.assign({}, config), { currentMoveIdx: this.currentMoveIdx, moves: this.moves, pgn: this.chess.pgn() }));
    }
    save_shapes(shapes) {
        const config = read_state(this.id);
        write_state(this.id, Object.assign(Object.assign({}, config), { shapes }));
    }
    sync_board_with_gamestate(shouldSave = true) {
        var _a;
        this.cg.set({
            check: this.check(),
            turnColor: this.color_turn(),
            movable: {
                free: false,
                color: this.color_turn(),
                dests: this.dests(),
            },
        });
        (_a = this.menu) === null || _a === void 0 ? void 0 : _a.redrawMoveList();
        if (shouldSave) {
            this.save_move();
        }
    }
    color_turn() {
        return this.chess.turn() === "w" ? "white" : "black";
    }
    dests() {
        const dests = new Map();
        this.chess.SQUARES.forEach((s) => {
            const ms = this.chess.moves({ square: s, verbose: true });
            if (ms.length)
                dests.set(s, ms.map((m) => m.to));
        });
        return dests;
    }
    check() {
        return this.chess.in_check();
    }
    undo_move() {
        this.update_turn_idx(this.currentMoveIdx - 1);
    }
    redo_move() {
        this.update_turn_idx(this.currentMoveIdx + 1);
    }
    update_turn_idx(moveIdx) {
        if (moveIdx < -1 || moveIdx >= this.moves.length) {
            return;
        }
        const isUndoing = moveIdx < this.currentMoveIdx;
        if (isUndoing) {
            while (this.currentMoveIdx > moveIdx) {
                this.currentMoveIdx--;
                this.chess.undo();
            }
        }
        else {
            while (this.currentMoveIdx < moveIdx) {
                this.currentMoveIdx++;
                const move = this.moves[this.currentMoveIdx];
                this.chess.move(move);
            }
        }
        let lastMove = undefined;
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
    setFreeMove(enabled) {
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
        }
        else {
            this.cg.set({
                events: {
                    move: (orig, dest) => {
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
    turn() {
        return this.chess.turn();
    }
    history() {
        return this.moves;
    }
    flipBoard() {
        return this.cg.toggleOrientation();
    }
    getBoardState() {
        return this.cg.state;
    }
    getFen() {
        return this.chess.fen();
    }
    getPgn() {
        const pgn = this.chess.pgn();
        return pgn && pgn.trim() !== '' ? pgn : '1...';
    }
    loadFen(fen, moves) {
        let lastMove = undefined;
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
        }
        else {
            this.chess.load(fen);
        }
        this.cg.set({ fen: this.chess.fen(), lastMove });
        this.sync_board_with_gamestate();
    }
    /* Adds an "Init" button to reset the board to the PGN/FEN-defined starting position */
    loadInitialPosition() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Init via user_config");
            if (((_a = this.user_config) === null || _a === void 0 ? void 0 : _a.pgn) && this.user_config.pgn.trim() !== "") {
                console.log("PGN to load :", this.user_config.pgn);
                const loaded = this.chess.load_pgn(this.user_config.pgn);
                if (!loaded) {
                    console.warn("Invalid PGN !");
                    new obsidian.Notice("Invalid PGN !");
                    return;
                }
                this.moves = this.chess.history({ verbose: true });
                this.currentMoveIdx = -1;
                console.log("Replay moves via update_turn_idx()");
                this.update_turn_idx(this.moves.length - 1); // ← that's what updates the visual
            }
            else {
                console.log("No PGN defined → complete reset");
                this.chess.reset();
                this.moves = [];
                this.currentMoveIdx = -1;
                this.sync_board_with_gamestate();
            }
        });
    }
}

const DEFAULT_SETTINGS = {
    orientation: "white",
    viewOnly: false,
    drawable: true,
    free: false,
    pieceStyle: "cburnett",
    boardStyle: "brown",
};
class ChesserSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Obsidian Chess Settings" });
        new obsidian.Setting(containerEl)
            .setName("Piece Style")
            .setDesc("Sets the piece style.")
            .addDropdown((dropdown) => {
            let styles = {};
            PIECE_STYLES.map((style) => (styles[style] = style));
            dropdown.addOptions(styles);
            dropdown.setValue(this.plugin.settings.pieceStyle).onChange((pieceStyle) => {
                this.plugin.settings.pieceStyle = pieceStyle;
                this.plugin.saveSettings();
            });
        });
        new obsidian.Setting(containerEl)
            .setName("Board Style")
            .setDesc("Sets the board style.")
            .addDropdown((dropdown) => {
            let styles = {};
            BOARD_STYLES.map((style) => (styles[style] = style));
            dropdown.addOptions(styles);
            dropdown.setValue(this.plugin.settings.boardStyle).onChange((boardStyle) => {
                this.plugin.settings.boardStyle = boardStyle;
                this.plugin.saveSettings();
            });
        });
        new obsidian.Setting(containerEl)
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
        new obsidian.Setting(containerEl)
            .setName("Drawable")
            .setDesc("Controls the ability to draw annotations (arrows, circles) on the board.")
            .addToggle((toggle) => {
            toggle.setValue(this.plugin.settings.drawable).onChange((drawable) => {
                this.plugin.settings.drawable = drawable;
                this.plugin.saveSettings();
            });
        });
        new obsidian.Setting(containerEl)
            .setName("View-only")
            .setDesc("If enabled, displays a static chess board (no moves, annotations, ...).")
            .addToggle((toggle) => {
            toggle.setValue(this.plugin.settings.viewOnly).onChange((viewOnly) => {
                this.plugin.settings.viewOnly = viewOnly;
                this.plugin.saveSettings();
            });
        });
        new obsidian.Setting(containerEl)
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

class ChesserPlugin extends obsidian.Plugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addSettingTab(new ChesserSettingTab(this.app, this));
            this.registerMarkdownCodeBlockProcessor("chesser", // keep for backwards compatibility/branding
            draw_chessboard(this.app, this.settings));
            this.registerMarkdownCodeBlockProcessor("chess", draw_chessboard(this.app, this.settings));
            // Replaces `localStorage` with persistent storage in the vault (`.ChesserStorage/`)
            const hiddenFolder = '.ChesserStorage';
            const folderExists = yield this.app.vault.adapter.exists(hiddenFolder);
            if (!folderExists) {
                yield this.app.vault.adapter.mkdir(hiddenFolder);
                console.log(`Hidden folder created : ${hiddenFolder}`);
            }
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
}

module.exports = ChesserPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL25vZGVfbW9kdWxlcy9uYW5vaWQvaW5kZXguYnJvd3Nlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9jaGVzcy5qcy9jaGVzcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC90eXBlcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC91dGlsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3ByZW1vdmUuanMiLCIuLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvYm9hcmQuanMiLCIuLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvZmVuLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL2NvbmZpZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9hbmltLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL2RyYXcuanMiLCIuLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvZHJhZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9leHBsb3Npb24uanMiLCIuLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvYXBpLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3N0YXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3N5bmMuanMiLCIuLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvc3ZnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL3dyYXAuanMiLCIuLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvZHJvcC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jaGVzc2dyb3VuZC9ldmVudHMuanMiLCIuLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvcmVuZGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NoZXNzZ3JvdW5kL2F1dG9QaWVjZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY2hlc3Nncm91bmQvY2hlc3Nncm91bmQuanMiLCIuLi9zcmMvQ2hlc3NlckNvbmZpZy50cyIsIi4uL3NyYy9zdGFydGluZ1Bvc2l0aW9ucy50cyIsIi4uL3NyYy9tZW51LnRzIiwiLi4vc3JjL2RlYnVnLnRzIiwiLi4vc3JjL0NoZXNzZXIudHMiLCIuLi9zcmMvQ2hlc3NlclNldHRpbmdzLnRzIiwiLi4vc3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBvKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIHApKSBfX2NyZWF0ZUJpbmRpbmcobywgbSwgcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXkodG8sIGZyb20sIHBhY2spIHtcclxuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xyXG4gICAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xyXG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0KHYpIHtcclxuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgX19hd2FpdCA/ICh0aGlzLnYgPSB2LCB0aGlzKSA6IG5ldyBfX2F3YWl0KHYpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0dlbmVyYXRvcih0aGlzQXJnLCBfYXJndW1lbnRzLCBnZW5lcmF0b3IpIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgZyA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSwgaSwgcSA9IFtdO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlmIChnW25dKSBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogbiA9PT0gXCJyZXR1cm5cIiB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcclxuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBnZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCByZWFkIHByaXZhdGUgbWVtYmVyIGZyb20gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcIm1cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgbWV0aG9kIGlzIG5vdCB3cml0YWJsZVwiKTtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4gKGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyLCB2YWx1ZSkgOiBmID8gZi52YWx1ZSA9IHZhbHVlIDogc3RhdGUuc2V0KHJlY2VpdmVyLCB2YWx1ZSkpLCB2YWx1ZTtcclxufVxyXG4iLCJpbXBvcnQgeyB1cmxBbHBoYWJldCB9IGZyb20gJy4vdXJsLWFscGhhYmV0L2luZGV4LmpzJ1xubGV0IHJhbmRvbSA9IGJ5dGVzID0+IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoYnl0ZXMpKVxubGV0IGN1c3RvbVJhbmRvbSA9IChhbHBoYWJldCwgZGVmYXVsdFNpemUsIGdldFJhbmRvbSkgPT4ge1xuICBsZXQgbWFzayA9ICgyIDw8IChNYXRoLmxvZyhhbHBoYWJldC5sZW5ndGggLSAxKSAvIE1hdGguTE4yKSkgLSAxXG4gIGxldCBzdGVwID0gLX4oKDEuNiAqIG1hc2sgKiBkZWZhdWx0U2l6ZSkgLyBhbHBoYWJldC5sZW5ndGgpXG4gIHJldHVybiAoc2l6ZSA9IGRlZmF1bHRTaXplKSA9PiB7XG4gICAgbGV0IGlkID0gJydcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgbGV0IGJ5dGVzID0gZ2V0UmFuZG9tKHN0ZXApXG4gICAgICBsZXQgaiA9IHN0ZXAgfCAwXG4gICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgIGlkICs9IGFscGhhYmV0W2J5dGVzW2pdICYgbWFza10gfHwgJydcbiAgICAgICAgaWYgKGlkLmxlbmd0aCA9PT0gc2l6ZSkgcmV0dXJuIGlkXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5sZXQgY3VzdG9tQWxwaGFiZXQgPSAoYWxwaGFiZXQsIHNpemUgPSAyMSkgPT5cbiAgY3VzdG9tUmFuZG9tKGFscGhhYmV0LCBzaXplLCByYW5kb20pXG5sZXQgbmFub2lkID0gKHNpemUgPSAyMSkgPT5cbiAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShzaXplKSkucmVkdWNlKChpZCwgYnl0ZSkgPT4ge1xuICAgIGJ5dGUgJj0gNjNcbiAgICBpZiAoYnl0ZSA8IDM2KSB7XG4gICAgICBpZCArPSBieXRlLnRvU3RyaW5nKDM2KVxuICAgIH0gZWxzZSBpZiAoYnl0ZSA8IDYyKSB7XG4gICAgICBpZCArPSAoYnl0ZSAtIDI2KS50b1N0cmluZygzNikudG9VcHBlckNhc2UoKVxuICAgIH0gZWxzZSBpZiAoYnl0ZSA+IDYyKSB7XG4gICAgICBpZCArPSAnLSdcbiAgICB9IGVsc2Uge1xuICAgICAgaWQgKz0gJ18nXG4gICAgfVxuICAgIHJldHVybiBpZFxuICB9LCAnJylcbmV4cG9ydCB7IG5hbm9pZCwgY3VzdG9tQWxwaGFiZXQsIGN1c3RvbVJhbmRvbSwgdXJsQWxwaGFiZXQsIHJhbmRvbSB9XG4iLCIvKlxuICogQ29weXJpZ2h0IChjKSAyMDIxLCBKZWZmIEhseXdhIChqaGx5d2FAZ21haWwuY29tKVxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICpcbiAqIDEuIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAyLiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gKiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gKiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICogQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRVxuICogSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0VcbiAqIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRVxuICogTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUlxuICogQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0ZcbiAqIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTU1xuICogSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU5cbiAqIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpXG4gKiBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRVxuICogUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKlxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxudmFyIENoZXNzID0gZnVuY3Rpb24gKGZlbikge1xuICB2YXIgQkxBQ0sgPSAnYidcbiAgdmFyIFdISVRFID0gJ3cnXG5cbiAgdmFyIEVNUFRZID0gLTFcblxuICB2YXIgUEFXTiA9ICdwJ1xuICB2YXIgS05JR0hUID0gJ24nXG4gIHZhciBCSVNIT1AgPSAnYidcbiAgdmFyIFJPT0sgPSAncidcbiAgdmFyIFFVRUVOID0gJ3EnXG4gIHZhciBLSU5HID0gJ2snXG5cbiAgdmFyIFNZTUJPTFMgPSAncG5icnFrUE5CUlFLJ1xuXG4gIHZhciBERUZBVUxUX1BPU0lUSU9OID1cbiAgICAncm5icWtibnIvcHBwcHBwcHAvOC84LzgvOC9QUFBQUFBQUC9STkJRS0JOUiB3IEtRa3EgLSAwIDEnXG5cbiAgdmFyIFRFUk1JTkFUSU9OX01BUktFUlMgPSBbJzEtMCcsICcwLTEnLCAnMS8yLTEvMicsICcqJ11cblxuICB2YXIgUEFXTl9PRkZTRVRTID0ge1xuICAgIGI6IFsxNiwgMzIsIDE3LCAxNV0sXG4gICAgdzogWy0xNiwgLTMyLCAtMTcsIC0xNV0sXG4gIH1cblxuICB2YXIgUElFQ0VfT0ZGU0VUUyA9IHtcbiAgICBuOiBbLTE4LCAtMzMsIC0zMSwgLTE0LCAxOCwgMzMsIDMxLCAxNF0sXG4gICAgYjogWy0xNywgLTE1LCAxNywgMTVdLFxuICAgIHI6IFstMTYsIDEsIDE2LCAtMV0sXG4gICAgcTogWy0xNywgLTE2LCAtMTUsIDEsIDE3LCAxNiwgMTUsIC0xXSxcbiAgICBrOiBbLTE3LCAtMTYsIC0xNSwgMSwgMTcsIDE2LCAxNSwgLTFdLFxuICB9XG5cbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIHZhciBBVFRBQ0tTID0gW1xuICAgIDIwLCAwLCAwLCAwLCAwLCAwLCAwLCAyNCwgIDAsIDAsIDAsIDAsIDAsIDAsMjAsIDAsXG4gICAgIDAsMjAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwyMCwgMCwgMCxcbiAgICAgMCwgMCwyMCwgMCwgMCwgMCwgMCwgMjQsICAwLCAwLCAwLCAwLDIwLCAwLCAwLCAwLFxuICAgICAwLCAwLCAwLDIwLCAwLCAwLCAwLCAyNCwgIDAsIDAsIDAsMjAsIDAsIDAsIDAsIDAsXG4gICAgIDAsIDAsIDAsIDAsMjAsIDAsIDAsIDI0LCAgMCwgMCwyMCwgMCwgMCwgMCwgMCwgMCxcbiAgICAgMCwgMCwgMCwgMCwgMCwyMCwgMiwgMjQsICAyLDIwLCAwLCAwLCAwLCAwLCAwLCAwLFxuICAgICAwLCAwLCAwLCAwLCAwLCAyLDUzLCA1NiwgNTMsIDIsIDAsIDAsIDAsIDAsIDAsIDAsXG4gICAgMjQsMjQsMjQsMjQsMjQsMjQsNTYsICAwLCA1NiwyNCwyNCwyNCwyNCwyNCwyNCwgMCxcbiAgICAgMCwgMCwgMCwgMCwgMCwgMiw1MywgNTYsIDUzLCAyLCAwLCAwLCAwLCAwLCAwLCAwLFxuICAgICAwLCAwLCAwLCAwLCAwLDIwLCAyLCAyNCwgIDIsMjAsIDAsIDAsIDAsIDAsIDAsIDAsXG4gICAgIDAsIDAsIDAsIDAsMjAsIDAsIDAsIDI0LCAgMCwgMCwyMCwgMCwgMCwgMCwgMCwgMCxcbiAgICAgMCwgMCwgMCwyMCwgMCwgMCwgMCwgMjQsICAwLCAwLCAwLDIwLCAwLCAwLCAwLCAwLFxuICAgICAwLCAwLDIwLCAwLCAwLCAwLCAwLCAyNCwgIDAsIDAsIDAsIDAsMjAsIDAsIDAsIDAsXG4gICAgIDAsMjAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwyMCwgMCwgMCxcbiAgICAyMCwgMCwgMCwgMCwgMCwgMCwgMCwgMjQsICAwLCAwLCAwLCAwLCAwLCAwLDIwXG4gIF07XG5cbiAgLy8gcHJldHRpZXItaWdub3JlXG4gIHZhciBSQVlTID0gW1xuICAgICAxNywgIDAsICAwLCAgMCwgIDAsICAwLCAgMCwgMTYsICAwLCAgMCwgIDAsICAwLCAgMCwgIDAsIDE1LCAwLFxuICAgICAgMCwgMTcsICAwLCAgMCwgIDAsICAwLCAgMCwgMTYsICAwLCAgMCwgIDAsICAwLCAgMCwgMTUsICAwLCAwLFxuICAgICAgMCwgIDAsIDE3LCAgMCwgIDAsICAwLCAgMCwgMTYsICAwLCAgMCwgIDAsICAwLCAxNSwgIDAsICAwLCAwLFxuICAgICAgMCwgIDAsICAwLCAxNywgIDAsICAwLCAgMCwgMTYsICAwLCAgMCwgIDAsIDE1LCAgMCwgIDAsICAwLCAwLFxuICAgICAgMCwgIDAsICAwLCAgMCwgMTcsICAwLCAgMCwgMTYsICAwLCAgMCwgMTUsICAwLCAgMCwgIDAsICAwLCAwLFxuICAgICAgMCwgIDAsICAwLCAgMCwgIDAsIDE3LCAgMCwgMTYsICAwLCAxNSwgIDAsICAwLCAgMCwgIDAsICAwLCAwLFxuICAgICAgMCwgIDAsICAwLCAgMCwgIDAsICAwLCAxNywgMTYsIDE1LCAgMCwgIDAsICAwLCAgMCwgIDAsICAwLCAwLFxuICAgICAgMSwgIDEsICAxLCAgMSwgIDEsICAxLCAgMSwgIDAsIC0xLCAtMSwgIC0xLC0xLCAtMSwgLTEsIC0xLCAwLFxuICAgICAgMCwgIDAsICAwLCAgMCwgIDAsICAwLC0xNSwtMTYsLTE3LCAgMCwgIDAsICAwLCAgMCwgIDAsICAwLCAwLFxuICAgICAgMCwgIDAsICAwLCAgMCwgIDAsLTE1LCAgMCwtMTYsICAwLC0xNywgIDAsICAwLCAgMCwgIDAsICAwLCAwLFxuICAgICAgMCwgIDAsICAwLCAgMCwtMTUsICAwLCAgMCwtMTYsICAwLCAgMCwtMTcsICAwLCAgMCwgIDAsICAwLCAwLFxuICAgICAgMCwgIDAsICAwLC0xNSwgIDAsICAwLCAgMCwtMTYsICAwLCAgMCwgIDAsLTE3LCAgMCwgIDAsICAwLCAwLFxuICAgICAgMCwgIDAsLTE1LCAgMCwgIDAsICAwLCAgMCwtMTYsICAwLCAgMCwgIDAsICAwLC0xNywgIDAsICAwLCAwLFxuICAgICAgMCwtMTUsICAwLCAgMCwgIDAsICAwLCAgMCwtMTYsICAwLCAgMCwgIDAsICAwLCAgMCwtMTcsICAwLCAwLFxuICAgIC0xNSwgIDAsICAwLCAgMCwgIDAsICAwLCAgMCwtMTYsICAwLCAgMCwgIDAsICAwLCAgMCwgIDAsLTE3XG4gIF07XG5cbiAgdmFyIFNISUZUUyA9IHsgcDogMCwgbjogMSwgYjogMiwgcjogMywgcTogNCwgazogNSB9XG5cbiAgdmFyIEZMQUdTID0ge1xuICAgIE5PUk1BTDogJ24nLFxuICAgIENBUFRVUkU6ICdjJyxcbiAgICBCSUdfUEFXTjogJ2InLFxuICAgIEVQX0NBUFRVUkU6ICdlJyxcbiAgICBQUk9NT1RJT046ICdwJyxcbiAgICBLU0lERV9DQVNUTEU6ICdrJyxcbiAgICBRU0lERV9DQVNUTEU6ICdxJyxcbiAgfVxuXG4gIHZhciBCSVRTID0ge1xuICAgIE5PUk1BTDogMSxcbiAgICBDQVBUVVJFOiAyLFxuICAgIEJJR19QQVdOOiA0LFxuICAgIEVQX0NBUFRVUkU6IDgsXG4gICAgUFJPTU9USU9OOiAxNixcbiAgICBLU0lERV9DQVNUTEU6IDMyLFxuICAgIFFTSURFX0NBU1RMRTogNjQsXG4gIH1cblxuICB2YXIgUkFOS18xID0gN1xuICB2YXIgUkFOS18yID0gNlxuICB2YXIgUkFOS18zID0gNVxuICB2YXIgUkFOS180ID0gNFxuICB2YXIgUkFOS181ID0gM1xuICB2YXIgUkFOS182ID0gMlxuICB2YXIgUkFOS183ID0gMVxuICB2YXIgUkFOS184ID0gMFxuXG4gIC8vIHByZXR0aWVyLWlnbm9yZVxuICB2YXIgU1FVQVJFUyA9IHtcbiAgICBhODogICAwLCBiODogICAxLCBjODogICAyLCBkODogICAzLCBlODogICA0LCBmODogICA1LCBnODogICA2LCBoODogICA3LFxuICAgIGE3OiAgMTYsIGI3OiAgMTcsIGM3OiAgMTgsIGQ3OiAgMTksIGU3OiAgMjAsIGY3OiAgMjEsIGc3OiAgMjIsIGg3OiAgMjMsXG4gICAgYTY6ICAzMiwgYjY6ICAzMywgYzY6ICAzNCwgZDY6ICAzNSwgZTY6ICAzNiwgZjY6ICAzNywgZzY6ICAzOCwgaDY6ICAzOSxcbiAgICBhNTogIDQ4LCBiNTogIDQ5LCBjNTogIDUwLCBkNTogIDUxLCBlNTogIDUyLCBmNTogIDUzLCBnNTogIDU0LCBoNTogIDU1LFxuICAgIGE0OiAgNjQsIGI0OiAgNjUsIGM0OiAgNjYsIGQ0OiAgNjcsIGU0OiAgNjgsIGY0OiAgNjksIGc0OiAgNzAsIGg0OiAgNzEsXG4gICAgYTM6ICA4MCwgYjM6ICA4MSwgYzM6ICA4MiwgZDM6ICA4MywgZTM6ICA4NCwgZjM6ICA4NSwgZzM6ICA4NiwgaDM6ICA4NyxcbiAgICBhMjogIDk2LCBiMjogIDk3LCBjMjogIDk4LCBkMjogIDk5LCBlMjogMTAwLCBmMjogMTAxLCBnMjogMTAyLCBoMjogMTAzLFxuICAgIGExOiAxMTIsIGIxOiAxMTMsIGMxOiAxMTQsIGQxOiAxMTUsIGUxOiAxMTYsIGYxOiAxMTcsIGcxOiAxMTgsIGgxOiAxMTlcbiAgfTtcblxuICB2YXIgUk9PS1MgPSB7XG4gICAgdzogW1xuICAgICAgeyBzcXVhcmU6IFNRVUFSRVMuYTEsIGZsYWc6IEJJVFMuUVNJREVfQ0FTVExFIH0sXG4gICAgICB7IHNxdWFyZTogU1FVQVJFUy5oMSwgZmxhZzogQklUUy5LU0lERV9DQVNUTEUgfSxcbiAgICBdLFxuICAgIGI6IFtcbiAgICAgIHsgc3F1YXJlOiBTUVVBUkVTLmE4LCBmbGFnOiBCSVRTLlFTSURFX0NBU1RMRSB9LFxuICAgICAgeyBzcXVhcmU6IFNRVUFSRVMuaDgsIGZsYWc6IEJJVFMuS1NJREVfQ0FTVExFIH0sXG4gICAgXSxcbiAgfVxuXG4gIHZhciBib2FyZCA9IG5ldyBBcnJheSgxMjgpXG4gIHZhciBraW5ncyA9IHsgdzogRU1QVFksIGI6IEVNUFRZIH1cbiAgdmFyIHR1cm4gPSBXSElURVxuICB2YXIgY2FzdGxpbmcgPSB7IHc6IDAsIGI6IDAgfVxuICB2YXIgZXBfc3F1YXJlID0gRU1QVFlcbiAgdmFyIGhhbGZfbW92ZXMgPSAwXG4gIHZhciBtb3ZlX251bWJlciA9IDFcbiAgdmFyIGhpc3RvcnkgPSBbXVxuICB2YXIgaGVhZGVyID0ge31cbiAgdmFyIGNvbW1lbnRzID0ge31cblxuICAvKiBpZiB0aGUgdXNlciBwYXNzZXMgaW4gYSBmZW4gc3RyaW5nLCBsb2FkIGl0LCBlbHNlIGRlZmF1bHQgdG9cbiAgICogc3RhcnRpbmcgcG9zaXRpb25cbiAgICovXG4gIGlmICh0eXBlb2YgZmVuID09PSAndW5kZWZpbmVkJykge1xuICAgIGxvYWQoREVGQVVMVF9QT1NJVElPTilcbiAgfSBlbHNlIHtcbiAgICBsb2FkKGZlbilcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyKGtlZXBfaGVhZGVycykge1xuICAgIGlmICh0eXBlb2Yga2VlcF9oZWFkZXJzID09PSAndW5kZWZpbmVkJykge1xuICAgICAga2VlcF9oZWFkZXJzID0gZmFsc2VcbiAgICB9XG5cbiAgICBib2FyZCA9IG5ldyBBcnJheSgxMjgpXG4gICAga2luZ3MgPSB7IHc6IEVNUFRZLCBiOiBFTVBUWSB9XG4gICAgdHVybiA9IFdISVRFXG4gICAgY2FzdGxpbmcgPSB7IHc6IDAsIGI6IDAgfVxuICAgIGVwX3NxdWFyZSA9IEVNUFRZXG4gICAgaGFsZl9tb3ZlcyA9IDBcbiAgICBtb3ZlX251bWJlciA9IDFcbiAgICBoaXN0b3J5ID0gW11cbiAgICBpZiAoIWtlZXBfaGVhZGVycykgaGVhZGVyID0ge31cbiAgICBjb21tZW50cyA9IHt9XG4gICAgdXBkYXRlX3NldHVwKGdlbmVyYXRlX2ZlbigpKVxuICB9XG5cbiAgZnVuY3Rpb24gcHJ1bmVfY29tbWVudHMoKSB7XG4gICAgdmFyIHJldmVyc2VkX2hpc3RvcnkgPSBbXVxuICAgIHZhciBjdXJyZW50X2NvbW1lbnRzID0ge31cbiAgICB2YXIgY29weV9jb21tZW50ID0gZnVuY3Rpb24gKGZlbikge1xuICAgICAgaWYgKGZlbiBpbiBjb21tZW50cykge1xuICAgICAgICBjdXJyZW50X2NvbW1lbnRzW2Zlbl0gPSBjb21tZW50c1tmZW5dXG4gICAgICB9XG4gICAgfVxuICAgIHdoaWxlIChoaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHJldmVyc2VkX2hpc3RvcnkucHVzaCh1bmRvX21vdmUoKSlcbiAgICB9XG4gICAgY29weV9jb21tZW50KGdlbmVyYXRlX2ZlbigpKVxuICAgIHdoaWxlIChyZXZlcnNlZF9oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgIG1ha2VfbW92ZShyZXZlcnNlZF9oaXN0b3J5LnBvcCgpKVxuICAgICAgY29weV9jb21tZW50KGdlbmVyYXRlX2ZlbigpKVxuICAgIH1cbiAgICBjb21tZW50cyA9IGN1cnJlbnRfY29tbWVudHNcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGxvYWQoREVGQVVMVF9QT1NJVElPTilcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWQoZmVuLCBrZWVwX2hlYWRlcnMpIHtcbiAgICBpZiAodHlwZW9mIGtlZXBfaGVhZGVycyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGtlZXBfaGVhZGVycyA9IGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIHRva2VucyA9IGZlbi5zcGxpdCgvXFxzKy8pXG4gICAgdmFyIHBvc2l0aW9uID0gdG9rZW5zWzBdXG4gICAgdmFyIHNxdWFyZSA9IDBcblxuICAgIGlmICghdmFsaWRhdGVfZmVuKGZlbikudmFsaWQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNsZWFyKGtlZXBfaGVhZGVycylcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zaXRpb24ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwaWVjZSA9IHBvc2l0aW9uLmNoYXJBdChpKVxuXG4gICAgICBpZiAocGllY2UgPT09ICcvJykge1xuICAgICAgICBzcXVhcmUgKz0gOFxuICAgICAgfSBlbHNlIGlmIChpc19kaWdpdChwaWVjZSkpIHtcbiAgICAgICAgc3F1YXJlICs9IHBhcnNlSW50KHBpZWNlLCAxMClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBjb2xvciA9IHBpZWNlIDwgJ2EnID8gV0hJVEUgOiBCTEFDS1xuICAgICAgICBwdXQoeyB0eXBlOiBwaWVjZS50b0xvd2VyQ2FzZSgpLCBjb2xvcjogY29sb3IgfSwgYWxnZWJyYWljKHNxdWFyZSkpXG4gICAgICAgIHNxdWFyZSsrXG4gICAgICB9XG4gICAgfVxuXG4gICAgdHVybiA9IHRva2Vuc1sxXVxuXG4gICAgaWYgKHRva2Vuc1syXS5pbmRleE9mKCdLJykgPiAtMSkge1xuICAgICAgY2FzdGxpbmcudyB8PSBCSVRTLktTSURFX0NBU1RMRVxuICAgIH1cbiAgICBpZiAodG9rZW5zWzJdLmluZGV4T2YoJ1EnKSA+IC0xKSB7XG4gICAgICBjYXN0bGluZy53IHw9IEJJVFMuUVNJREVfQ0FTVExFXG4gICAgfVxuICAgIGlmICh0b2tlbnNbMl0uaW5kZXhPZignaycpID4gLTEpIHtcbiAgICAgIGNhc3RsaW5nLmIgfD0gQklUUy5LU0lERV9DQVNUTEVcbiAgICB9XG4gICAgaWYgKHRva2Vuc1syXS5pbmRleE9mKCdxJykgPiAtMSkge1xuICAgICAgY2FzdGxpbmcuYiB8PSBCSVRTLlFTSURFX0NBU1RMRVxuICAgIH1cblxuICAgIGVwX3NxdWFyZSA9IHRva2Vuc1szXSA9PT0gJy0nID8gRU1QVFkgOiBTUVVBUkVTW3Rva2Vuc1szXV1cbiAgICBoYWxmX21vdmVzID0gcGFyc2VJbnQodG9rZW5zWzRdLCAxMClcbiAgICBtb3ZlX251bWJlciA9IHBhcnNlSW50KHRva2Vuc1s1XSwgMTApXG5cbiAgICB1cGRhdGVfc2V0dXAoZ2VuZXJhdGVfZmVuKCkpXG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyogVE9ETzogdGhpcyBmdW5jdGlvbiBpcyBwcmV0dHkgbXVjaCBjcmFwIC0gaXQgdmFsaWRhdGVzIHN0cnVjdHVyZSBidXRcbiAgICogY29tcGxldGVseSBpZ25vcmVzIGNvbnRlbnQgKGUuZy4gZG9lc24ndCB2ZXJpZnkgdGhhdCBlYWNoIHNpZGUgaGFzIGEga2luZylcbiAgICogLi4uIHdlIHNob3VsZCByZXdyaXRlIHRoaXMsIGFuZCBkaXRjaCB0aGUgc2lsbHkgZXJyb3JfbnVtYmVyIGZpZWxkIHdoaWxlXG4gICAqIHdlJ3JlIGF0IGl0XG4gICAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZV9mZW4oZmVuKSB7XG4gICAgdmFyIGVycm9ycyA9IHtcbiAgICAgIDA6ICdObyBlcnJvcnMuJyxcbiAgICAgIDE6ICdGRU4gc3RyaW5nIG11c3QgY29udGFpbiBzaXggc3BhY2UtZGVsaW1pdGVkIGZpZWxkcy4nLFxuICAgICAgMjogJzZ0aCBmaWVsZCAobW92ZSBudW1iZXIpIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLicsXG4gICAgICAzOiAnNXRoIGZpZWxkIChoYWxmIG1vdmUgY291bnRlcikgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLicsXG4gICAgICA0OiAnNHRoIGZpZWxkIChlbi1wYXNzYW50IHNxdWFyZSkgaXMgaW52YWxpZC4nLFxuICAgICAgNTogJzNyZCBmaWVsZCAoY2FzdGxpbmcgYXZhaWxhYmlsaXR5KSBpcyBpbnZhbGlkLicsXG4gICAgICA2OiAnMm5kIGZpZWxkIChzaWRlIHRvIG1vdmUpIGlzIGludmFsaWQuJyxcbiAgICAgIDc6IFwiMXN0IGZpZWxkIChwaWVjZSBwb3NpdGlvbnMpIGRvZXMgbm90IGNvbnRhaW4gOCAnLyctZGVsaW1pdGVkIHJvd3MuXCIsXG4gICAgICA4OiAnMXN0IGZpZWxkIChwaWVjZSBwb3NpdGlvbnMpIGlzIGludmFsaWQgW2NvbnNlY3V0aXZlIG51bWJlcnNdLicsXG4gICAgICA5OiAnMXN0IGZpZWxkIChwaWVjZSBwb3NpdGlvbnMpIGlzIGludmFsaWQgW2ludmFsaWQgcGllY2VdLicsXG4gICAgICAxMDogJzFzdCBmaWVsZCAocGllY2UgcG9zaXRpb25zKSBpcyBpbnZhbGlkIFtyb3cgdG9vIGxhcmdlXS4nLFxuICAgICAgMTE6ICdJbGxlZ2FsIGVuLXBhc3NhbnQgc3F1YXJlJyxcbiAgICB9XG5cbiAgICAvKiAxc3QgY3JpdGVyaW9uOiA2IHNwYWNlLXNlcGVyYXRlZCBmaWVsZHM/ICovXG4gICAgdmFyIHRva2VucyA9IGZlbi5zcGxpdCgvXFxzKy8pXG4gICAgaWYgKHRva2Vucy5sZW5ndGggIT09IDYpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiAxLCBlcnJvcjogZXJyb3JzWzFdIH1cbiAgICB9XG5cbiAgICAvKiAybmQgY3JpdGVyaW9uOiBtb3ZlIG51bWJlciBmaWVsZCBpcyBhIGludGVnZXIgdmFsdWUgPiAwPyAqL1xuICAgIGlmIChpc05hTih0b2tlbnNbNV0pIHx8IHBhcnNlSW50KHRva2Vuc1s1XSwgMTApIDw9IDApIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiAyLCBlcnJvcjogZXJyb3JzWzJdIH1cbiAgICB9XG5cbiAgICAvKiAzcmQgY3JpdGVyaW9uOiBoYWxmIG1vdmUgY291bnRlciBpcyBhbiBpbnRlZ2VyID49IDA/ICovXG4gICAgaWYgKGlzTmFOKHRva2Vuc1s0XSkgfHwgcGFyc2VJbnQodG9rZW5zWzRdLCAxMCkgPCAwKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogMywgZXJyb3I6IGVycm9yc1szXSB9XG4gICAgfVxuXG4gICAgLyogNHRoIGNyaXRlcmlvbjogNHRoIGZpZWxkIGlzIGEgdmFsaWQgZS5wLi1zdHJpbmc/ICovXG4gICAgaWYgKCEvXigtfFthYmNkZWZnaF1bMzZdKSQvLnRlc3QodG9rZW5zWzNdKSkge1xuICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcl9udW1iZXI6IDQsIGVycm9yOiBlcnJvcnNbNF0gfVxuICAgIH1cblxuICAgIC8qIDV0aCBjcml0ZXJpb246IDN0aCBmaWVsZCBpcyBhIHZhbGlkIGNhc3RsZS1zdHJpbmc/ICovXG4gICAgaWYgKCEvXihLUT9rP3E/fFFrP3E/fGtxP3xxfC0pJC8udGVzdCh0b2tlbnNbMl0pKSB7XG4gICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogNSwgZXJyb3I6IGVycm9yc1s1XSB9XG4gICAgfVxuXG4gICAgLyogNnRoIGNyaXRlcmlvbjogMm5kIGZpZWxkIGlzIFwid1wiICh3aGl0ZSkgb3IgXCJiXCIgKGJsYWNrKT8gKi9cbiAgICBpZiAoIS9eKHd8YikkLy50ZXN0KHRva2Vuc1sxXSkpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiA2LCBlcnJvcjogZXJyb3JzWzZdIH1cbiAgICB9XG5cbiAgICAvKiA3dGggY3JpdGVyaW9uOiAxc3QgZmllbGQgY29udGFpbnMgOCByb3dzPyAqL1xuICAgIHZhciByb3dzID0gdG9rZW5zWzBdLnNwbGl0KCcvJylcbiAgICBpZiAocm93cy5sZW5ndGggIT09IDgpIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiA3LCBlcnJvcjogZXJyb3JzWzddIH1cbiAgICB9XG5cbiAgICAvKiA4dGggY3JpdGVyaW9uOiBldmVyeSByb3cgaXMgdmFsaWQ/ICovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvKiBjaGVjayBmb3IgcmlnaHQgc3VtIG9mIGZpZWxkcyBBTkQgbm90IHR3byBudW1iZXJzIGluIHN1Y2Nlc3Npb24gKi9cbiAgICAgIHZhciBzdW1fZmllbGRzID0gMFxuICAgICAgdmFyIHByZXZpb3VzX3dhc19udW1iZXIgPSBmYWxzZVxuXG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHJvd3NbaV0ubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgaWYgKCFpc05hTihyb3dzW2ldW2tdKSkge1xuICAgICAgICAgIGlmIChwcmV2aW91c193YXNfbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogOCwgZXJyb3I6IGVycm9yc1s4XSB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHN1bV9maWVsZHMgKz0gcGFyc2VJbnQocm93c1tpXVtrXSwgMTApXG4gICAgICAgICAgcHJldmlvdXNfd2FzX251bWJlciA9IHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIS9eW3BybmJxa1BSTkJRS10kLy50ZXN0KHJvd3NbaV1ba10pKSB7XG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogOSwgZXJyb3I6IGVycm9yc1s5XSB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHN1bV9maWVsZHMgKz0gMVxuICAgICAgICAgIHByZXZpb3VzX3dhc19udW1iZXIgPSBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VtX2ZpZWxkcyAhPT0gOCkge1xuICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogMTAsIGVycm9yOiBlcnJvcnNbMTBdIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAodG9rZW5zWzNdWzFdID09ICczJyAmJiB0b2tlbnNbMV0gPT0gJ3cnKSB8fFxuICAgICAgKHRva2Vuc1szXVsxXSA9PSAnNicgJiYgdG9rZW5zWzFdID09ICdiJylcbiAgICApIHtcbiAgICAgIHJldHVybiB7IHZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiAxMSwgZXJyb3I6IGVycm9yc1sxMV0gfVxuICAgIH1cblxuICAgIC8qIGV2ZXJ5dGhpbmcncyBva2F5ISAqL1xuICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBlcnJvcl9udW1iZXI6IDAsIGVycm9yOiBlcnJvcnNbMF0gfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVfZmVuKCkge1xuICAgIHZhciBlbXB0eSA9IDBcbiAgICB2YXIgZmVuID0gJydcblxuICAgIGZvciAodmFyIGkgPSBTUVVBUkVTLmE4OyBpIDw9IFNRVUFSRVMuaDE7IGkrKykge1xuICAgICAgaWYgKGJvYXJkW2ldID09IG51bGwpIHtcbiAgICAgICAgZW1wdHkrK1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGVtcHR5ID4gMCkge1xuICAgICAgICAgIGZlbiArPSBlbXB0eVxuICAgICAgICAgIGVtcHR5ID0gMFxuICAgICAgICB9XG4gICAgICAgIHZhciBjb2xvciA9IGJvYXJkW2ldLmNvbG9yXG4gICAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldLnR5cGVcblxuICAgICAgICBmZW4gKz0gY29sb3IgPT09IFdISVRFID8gcGllY2UudG9VcHBlckNhc2UoKSA6IHBpZWNlLnRvTG93ZXJDYXNlKClcbiAgICAgIH1cblxuICAgICAgaWYgKChpICsgMSkgJiAweDg4KSB7XG4gICAgICAgIGlmIChlbXB0eSA+IDApIHtcbiAgICAgICAgICBmZW4gKz0gZW1wdHlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpICE9PSBTUVVBUkVTLmgxKSB7XG4gICAgICAgICAgZmVuICs9ICcvJ1xuICAgICAgICB9XG5cbiAgICAgICAgZW1wdHkgPSAwXG4gICAgICAgIGkgKz0gOFxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBjZmxhZ3MgPSAnJ1xuICAgIGlmIChjYXN0bGluZ1tXSElURV0gJiBCSVRTLktTSURFX0NBU1RMRSkge1xuICAgICAgY2ZsYWdzICs9ICdLJ1xuICAgIH1cbiAgICBpZiAoY2FzdGxpbmdbV0hJVEVdICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgIGNmbGFncyArPSAnUSdcbiAgICB9XG4gICAgaWYgKGNhc3RsaW5nW0JMQUNLXSAmIEJJVFMuS1NJREVfQ0FTVExFKSB7XG4gICAgICBjZmxhZ3MgKz0gJ2snXG4gICAgfVxuICAgIGlmIChjYXN0bGluZ1tCTEFDS10gJiBCSVRTLlFTSURFX0NBU1RMRSkge1xuICAgICAgY2ZsYWdzICs9ICdxJ1xuICAgIH1cblxuICAgIC8qIGRvIHdlIGhhdmUgYW4gZW1wdHkgY2FzdGxpbmcgZmxhZz8gKi9cbiAgICBjZmxhZ3MgPSBjZmxhZ3MgfHwgJy0nXG4gICAgdmFyIGVwZmxhZ3MgPSBlcF9zcXVhcmUgPT09IEVNUFRZID8gJy0nIDogYWxnZWJyYWljKGVwX3NxdWFyZSlcblxuICAgIHJldHVybiBbZmVuLCB0dXJuLCBjZmxhZ3MsIGVwZmxhZ3MsIGhhbGZfbW92ZXMsIG1vdmVfbnVtYmVyXS5qb2luKCcgJylcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldF9oZWFkZXIoYXJncykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgaWYgKHR5cGVvZiBhcmdzW2ldID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYXJnc1tpICsgMV0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGhlYWRlclthcmdzW2ldXSA9IGFyZ3NbaSArIDFdXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoZWFkZXJcbiAgfVxuXG4gIC8qIGNhbGxlZCB3aGVuIHRoZSBpbml0aWFsIGJvYXJkIHNldHVwIGlzIGNoYW5nZWQgd2l0aCBwdXQoKSBvciByZW1vdmUoKS5cbiAgICogbW9kaWZpZXMgdGhlIFNldFVwIGFuZCBGRU4gcHJvcGVydGllcyBvZiB0aGUgaGVhZGVyIG9iamVjdC4gIGlmIHRoZSBGRU4gaXNcbiAgICogZXF1YWwgdG8gdGhlIGRlZmF1bHQgcG9zaXRpb24sIHRoZSBTZXRVcCBhbmQgRkVOIGFyZSBkZWxldGVkXG4gICAqIHRoZSBzZXR1cCBpcyBvbmx5IHVwZGF0ZWQgaWYgaGlzdG9yeS5sZW5ndGggaXMgemVybywgaWUgbW92ZXMgaGF2ZW4ndCBiZWVuXG4gICAqIG1hZGUuXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGVfc2V0dXAoZmVuKSB7XG4gICAgaWYgKGhpc3RvcnkubGVuZ3RoID4gMCkgcmV0dXJuXG5cbiAgICBpZiAoZmVuICE9PSBERUZBVUxUX1BPU0lUSU9OKSB7XG4gICAgICBoZWFkZXJbJ1NldFVwJ10gPSAnMSdcbiAgICAgIGhlYWRlclsnRkVOJ10gPSBmZW5cbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIGhlYWRlclsnU2V0VXAnXVxuICAgICAgZGVsZXRlIGhlYWRlclsnRkVOJ11cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXQoc3F1YXJlKSB7XG4gICAgdmFyIHBpZWNlID0gYm9hcmRbU1FVQVJFU1tzcXVhcmVdXVxuICAgIHJldHVybiBwaWVjZSA/IHsgdHlwZTogcGllY2UudHlwZSwgY29sb3I6IHBpZWNlLmNvbG9yIH0gOiBudWxsXG4gIH1cblxuICBmdW5jdGlvbiBwdXQocGllY2UsIHNxdWFyZSkge1xuICAgIC8qIGNoZWNrIGZvciB2YWxpZCBwaWVjZSBvYmplY3QgKi9cbiAgICBpZiAoISgndHlwZScgaW4gcGllY2UgJiYgJ2NvbG9yJyBpbiBwaWVjZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8qIGNoZWNrIGZvciBwaWVjZSAqL1xuICAgIGlmIChTWU1CT0xTLmluZGV4T2YocGllY2UudHlwZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIC8qIGNoZWNrIGZvciB2YWxpZCBzcXVhcmUgKi9cbiAgICBpZiAoIShzcXVhcmUgaW4gU1FVQVJFUykpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHZhciBzcSA9IFNRVUFSRVNbc3F1YXJlXVxuXG4gICAgLyogZG9uJ3QgbGV0IHRoZSB1c2VyIHBsYWNlIG1vcmUgdGhhbiBvbmUga2luZyAqL1xuICAgIGlmIChcbiAgICAgIHBpZWNlLnR5cGUgPT0gS0lORyAmJlxuICAgICAgIShraW5nc1twaWVjZS5jb2xvcl0gPT0gRU1QVFkgfHwga2luZ3NbcGllY2UuY29sb3JdID09IHNxKVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgYm9hcmRbc3FdID0geyB0eXBlOiBwaWVjZS50eXBlLCBjb2xvcjogcGllY2UuY29sb3IgfVxuICAgIGlmIChwaWVjZS50eXBlID09PSBLSU5HKSB7XG4gICAgICBraW5nc1twaWVjZS5jb2xvcl0gPSBzcVxuICAgIH1cblxuICAgIHVwZGF0ZV9zZXR1cChnZW5lcmF0ZV9mZW4oKSlcblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUoc3F1YXJlKSB7XG4gICAgdmFyIHBpZWNlID0gZ2V0KHNxdWFyZSlcbiAgICBib2FyZFtTUVVBUkVTW3NxdWFyZV1dID0gbnVsbFxuICAgIGlmIChwaWVjZSAmJiBwaWVjZS50eXBlID09PSBLSU5HKSB7XG4gICAgICBraW5nc1twaWVjZS5jb2xvcl0gPSBFTVBUWVxuICAgIH1cblxuICAgIHVwZGF0ZV9zZXR1cChnZW5lcmF0ZV9mZW4oKSlcblxuICAgIHJldHVybiBwaWVjZVxuICB9XG5cbiAgZnVuY3Rpb24gYnVpbGRfbW92ZShib2FyZCwgZnJvbSwgdG8sIGZsYWdzLCBwcm9tb3Rpb24pIHtcbiAgICB2YXIgbW92ZSA9IHtcbiAgICAgIGNvbG9yOiB0dXJuLFxuICAgICAgZnJvbTogZnJvbSxcbiAgICAgIHRvOiB0byxcbiAgICAgIGZsYWdzOiBmbGFncyxcbiAgICAgIHBpZWNlOiBib2FyZFtmcm9tXS50eXBlLFxuICAgIH1cblxuICAgIGlmIChwcm9tb3Rpb24pIHtcbiAgICAgIG1vdmUuZmxhZ3MgfD0gQklUUy5QUk9NT1RJT05cbiAgICAgIG1vdmUucHJvbW90aW9uID0gcHJvbW90aW9uXG4gICAgfVxuXG4gICAgaWYgKGJvYXJkW3RvXSkge1xuICAgICAgbW92ZS5jYXB0dXJlZCA9IGJvYXJkW3RvXS50eXBlXG4gICAgfSBlbHNlIGlmIChmbGFncyAmIEJJVFMuRVBfQ0FQVFVSRSkge1xuICAgICAgbW92ZS5jYXB0dXJlZCA9IFBBV05cbiAgICB9XG4gICAgcmV0dXJuIG1vdmVcbiAgfVxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlX21vdmVzKG9wdGlvbnMpIHtcbiAgICBmdW5jdGlvbiBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGZyb20sIHRvLCBmbGFncykge1xuICAgICAgLyogaWYgcGF3biBwcm9tb3Rpb24gKi9cbiAgICAgIGlmIChcbiAgICAgICAgYm9hcmRbZnJvbV0udHlwZSA9PT0gUEFXTiAmJlxuICAgICAgICAocmFuayh0bykgPT09IFJBTktfOCB8fCByYW5rKHRvKSA9PT0gUkFOS18xKVxuICAgICAgKSB7XG4gICAgICAgIHZhciBwaWVjZXMgPSBbUVVFRU4sIFJPT0ssIEJJU0hPUCwgS05JR0hUXVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGllY2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgbW92ZXMucHVzaChidWlsZF9tb3ZlKGJvYXJkLCBmcm9tLCB0bywgZmxhZ3MsIHBpZWNlc1tpXSkpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1vdmVzLnB1c2goYnVpbGRfbW92ZShib2FyZCwgZnJvbSwgdG8sIGZsYWdzKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbW92ZXMgPSBbXVxuICAgIHZhciB1cyA9IHR1cm5cbiAgICB2YXIgdGhlbSA9IHN3YXBfY29sb3IodXMpXG4gICAgdmFyIHNlY29uZF9yYW5rID0geyBiOiBSQU5LXzcsIHc6IFJBTktfMiB9XG5cbiAgICB2YXIgZmlyc3Rfc3EgPSBTUVVBUkVTLmE4XG4gICAgdmFyIGxhc3Rfc3EgPSBTUVVBUkVTLmgxXG4gICAgdmFyIHNpbmdsZV9zcXVhcmUgPSBmYWxzZVxuXG4gICAgLyogZG8gd2Ugd2FudCBsZWdhbCBtb3Zlcz8gKi9cbiAgICB2YXIgbGVnYWwgPVxuICAgICAgdHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdsZWdhbCcgaW4gb3B0aW9uc1xuICAgICAgICA/IG9wdGlvbnMubGVnYWxcbiAgICAgICAgOiB0cnVlXG5cbiAgICB2YXIgcGllY2VfdHlwZSA9XG4gICAgICB0eXBlb2Ygb3B0aW9ucyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICdwaWVjZScgaW4gb3B0aW9ucyAmJlxuICAgICAgdHlwZW9mIG9wdGlvbnMucGllY2UgPT09ICdzdHJpbmcnXG4gICAgICAgID8gb3B0aW9ucy5waWVjZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIDogdHJ1ZVxuXG4gICAgLyogYXJlIHdlIGdlbmVyYXRpbmcgbW92ZXMgZm9yIGEgc2luZ2xlIHNxdWFyZT8gKi9cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdzcXVhcmUnIGluIG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zLnNxdWFyZSBpbiBTUVVBUkVTKSB7XG4gICAgICAgIGZpcnN0X3NxID0gbGFzdF9zcSA9IFNRVUFSRVNbb3B0aW9ucy5zcXVhcmVdXG4gICAgICAgIHNpbmdsZV9zcXVhcmUgPSB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBpbnZhbGlkIHNxdWFyZSAqL1xuICAgICAgICByZXR1cm4gW11cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gZmlyc3Rfc3E7IGkgPD0gbGFzdF9zcTsgaSsrKSB7XG4gICAgICAvKiBkaWQgd2UgcnVuIG9mZiB0aGUgZW5kIG9mIHRoZSBib2FyZCAqL1xuICAgICAgaWYgKGkgJiAweDg4KSB7XG4gICAgICAgIGkgKz0gN1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgcGllY2UgPSBib2FyZFtpXVxuICAgICAgaWYgKHBpZWNlID09IG51bGwgfHwgcGllY2UuY29sb3IgIT09IHVzKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChwaWVjZS50eXBlID09PSBQQVdOICYmIChwaWVjZV90eXBlID09PSB0cnVlIHx8IHBpZWNlX3R5cGUgPT09IFBBV04pKSB7XG4gICAgICAgIC8qIHNpbmdsZSBzcXVhcmUsIG5vbi1jYXB0dXJpbmcgKi9cbiAgICAgICAgdmFyIHNxdWFyZSA9IGkgKyBQQVdOX09GRlNFVFNbdXNdWzBdXG4gICAgICAgIGlmIChib2FyZFtzcXVhcmVdID09IG51bGwpIHtcbiAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5OT1JNQUwpXG5cbiAgICAgICAgICAvKiBkb3VibGUgc3F1YXJlICovXG4gICAgICAgICAgdmFyIHNxdWFyZSA9IGkgKyBQQVdOX09GRlNFVFNbdXNdWzFdXG4gICAgICAgICAgaWYgKHNlY29uZF9yYW5rW3VzXSA9PT0gcmFuayhpKSAmJiBib2FyZFtzcXVhcmVdID09IG51bGwpIHtcbiAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3ZlcywgaSwgc3F1YXJlLCBCSVRTLkJJR19QQVdOKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIHBhd24gY2FwdHVyZXMgKi9cbiAgICAgICAgZm9yIChqID0gMjsgaiA8IDQ7IGorKykge1xuICAgICAgICAgIHZhciBzcXVhcmUgPSBpICsgUEFXTl9PRkZTRVRTW3VzXVtqXVxuICAgICAgICAgIGlmIChzcXVhcmUgJiAweDg4KSBjb250aW51ZVxuXG4gICAgICAgICAgaWYgKGJvYXJkW3NxdWFyZV0gIT0gbnVsbCAmJiBib2FyZFtzcXVhcmVdLmNvbG9yID09PSB0aGVtKSB7XG4gICAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5DQVBUVVJFKVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3F1YXJlID09PSBlcF9zcXVhcmUpIHtcbiAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3ZlcywgaSwgZXBfc3F1YXJlLCBCSVRTLkVQX0NBUFRVUkUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHBpZWNlX3R5cGUgPT09IHRydWUgfHwgcGllY2VfdHlwZSA9PT0gcGllY2UudHlwZSkge1xuICAgICAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gUElFQ0VfT0ZGU0VUU1twaWVjZS50eXBlXS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgIHZhciBvZmZzZXQgPSBQSUVDRV9PRkZTRVRTW3BpZWNlLnR5cGVdW2pdXG4gICAgICAgICAgdmFyIHNxdWFyZSA9IGlcblxuICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBzcXVhcmUgKz0gb2Zmc2V0XG4gICAgICAgICAgICBpZiAoc3F1YXJlICYgMHg4OCkgYnJlYWtcblxuICAgICAgICAgICAgaWYgKGJvYXJkW3NxdWFyZV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5OT1JNQUwpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoYm9hcmRbc3F1YXJlXS5jb2xvciA9PT0gdXMpIGJyZWFrXG4gICAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3ZlcywgaSwgc3F1YXJlLCBCSVRTLkNBUFRVUkUpXG4gICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGJyZWFrLCBpZiBrbmlnaHQgb3Iga2luZyAqL1xuICAgICAgICAgICAgaWYgKHBpZWNlLnR5cGUgPT09ICduJyB8fCBwaWVjZS50eXBlID09PSAnaycpIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogY2hlY2sgZm9yIGNhc3RsaW5nIGlmOiBhKSB3ZSdyZSBnZW5lcmF0aW5nIGFsbCBtb3Zlcywgb3IgYikgd2UncmUgZG9pbmdcbiAgICAgKiBzaW5nbGUgc3F1YXJlIG1vdmUgZ2VuZXJhdGlvbiBvbiB0aGUga2luZydzIHNxdWFyZVxuICAgICAqL1xuICAgIGlmIChwaWVjZV90eXBlID09PSB0cnVlIHx8IHBpZWNlX3R5cGUgPT09IEtJTkcpIHtcbiAgICAgIGlmICghc2luZ2xlX3NxdWFyZSB8fCBsYXN0X3NxID09PSBraW5nc1t1c10pIHtcbiAgICAgICAgLyoga2luZy1zaWRlIGNhc3RsaW5nICovXG4gICAgICAgIGlmIChjYXN0bGluZ1t1c10gJiBCSVRTLktTSURFX0NBU1RMRSkge1xuICAgICAgICAgIHZhciBjYXN0bGluZ19mcm9tID0ga2luZ3NbdXNdXG4gICAgICAgICAgdmFyIGNhc3RsaW5nX3RvID0gY2FzdGxpbmdfZnJvbSArIDJcblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb20gKyAxXSA9PSBudWxsICYmXG4gICAgICAgICAgICBib2FyZFtjYXN0bGluZ190b10gPT0gbnVsbCAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGtpbmdzW3VzXSkgJiZcbiAgICAgICAgICAgICFhdHRhY2tlZCh0aGVtLCBjYXN0bGluZ19mcm9tICsgMSkgJiZcbiAgICAgICAgICAgICFhdHRhY2tlZCh0aGVtLCBjYXN0bGluZ190bylcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3Zlcywga2luZ3NbdXNdLCBjYXN0bGluZ190bywgQklUUy5LU0lERV9DQVNUTEUpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyogcXVlZW4tc2lkZSBjYXN0bGluZyAqL1xuICAgICAgICBpZiAoY2FzdGxpbmdbdXNdICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgICAgICB2YXIgY2FzdGxpbmdfZnJvbSA9IGtpbmdzW3VzXVxuICAgICAgICAgIHZhciBjYXN0bGluZ190byA9IGNhc3RsaW5nX2Zyb20gLSAyXG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBib2FyZFtjYXN0bGluZ19mcm9tIC0gMV0gPT0gbnVsbCAmJlxuICAgICAgICAgICAgYm9hcmRbY2FzdGxpbmdfZnJvbSAtIDJdID09IG51bGwgJiZcbiAgICAgICAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb20gLSAzXSA9PSBudWxsICYmXG4gICAgICAgICAgICAhYXR0YWNrZWQodGhlbSwga2luZ3NbdXNdKSAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGNhc3RsaW5nX2Zyb20gLSAxKSAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGNhc3RsaW5nX3RvKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgYWRkX21vdmUoYm9hcmQsIG1vdmVzLCBraW5nc1t1c10sIGNhc3RsaW5nX3RvLCBCSVRTLlFTSURFX0NBU1RMRSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiByZXR1cm4gYWxsIHBzZXVkby1sZWdhbCBtb3ZlcyAodGhpcyBpbmNsdWRlcyBtb3ZlcyB0aGF0IGFsbG93IHRoZSBraW5nXG4gICAgICogdG8gYmUgY2FwdHVyZWQpXG4gICAgICovXG4gICAgaWYgKCFsZWdhbCkge1xuICAgICAgcmV0dXJuIG1vdmVzXG4gICAgfVxuXG4gICAgLyogZmlsdGVyIG91dCBpbGxlZ2FsIG1vdmVzICovXG4gICAgdmFyIGxlZ2FsX21vdmVzID0gW11cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbW92ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIG1ha2VfbW92ZShtb3Zlc1tpXSlcbiAgICAgIGlmICgha2luZ19hdHRhY2tlZCh1cykpIHtcbiAgICAgICAgbGVnYWxfbW92ZXMucHVzaChtb3Zlc1tpXSlcbiAgICAgIH1cbiAgICAgIHVuZG9fbW92ZSgpXG4gICAgfVxuXG4gICAgcmV0dXJuIGxlZ2FsX21vdmVzXG4gIH1cblxuICAvKiBjb252ZXJ0IGEgbW92ZSBmcm9tIDB4ODggY29vcmRpbmF0ZXMgdG8gU3RhbmRhcmQgQWxnZWJyYWljIE5vdGF0aW9uXG4gICAqIChTQU4pXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2xvcHB5IFVzZSB0aGUgc2xvcHB5IFNBTiBnZW5lcmF0b3IgdG8gd29yayBhcm91bmQgb3ZlclxuICAgKiBkaXNhbWJpZ3VhdGlvbiBidWdzIGluIEZyaXR6IGFuZCBDaGVzc2Jhc2UuICBTZWUgYmVsb3c6XG4gICAqXG4gICAqIHIxYnFrYm5yL3BwcDJwcHAvMm41LzFCMXBQMy80UDMvOC9QUFBQMlBQL1JOQlFLMU5SIGIgS1FrcSAtIDIgNFxuICAgKiA0LiAuLi4gTmdlNyBpcyBvdmVybHkgZGlzYW1iaWd1YXRlZCBiZWNhdXNlIHRoZSBrbmlnaHQgb24gYzYgaXMgcGlubmVkXG4gICAqIDQuIC4uLiBOZTcgaXMgdGVjaG5pY2FsbHkgdGhlIHZhbGlkIFNBTlxuICAgKi9cbiAgZnVuY3Rpb24gbW92ZV90b19zYW4obW92ZSwgbW92ZXMpIHtcbiAgICB2YXIgb3V0cHV0ID0gJydcblxuICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5LU0lERV9DQVNUTEUpIHtcbiAgICAgIG91dHB1dCA9ICdPLU8nXG4gICAgfSBlbHNlIGlmIChtb3ZlLmZsYWdzICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgIG91dHB1dCA9ICdPLU8tTydcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1vdmUucGllY2UgIT09IFBBV04pIHtcbiAgICAgICAgdmFyIGRpc2FtYmlndWF0b3IgPSBnZXRfZGlzYW1iaWd1YXRvcihtb3ZlLCBtb3ZlcylcbiAgICAgICAgb3V0cHV0ICs9IG1vdmUucGllY2UudG9VcHBlckNhc2UoKSArIGRpc2FtYmlndWF0b3JcbiAgICAgIH1cblxuICAgICAgaWYgKG1vdmUuZmxhZ3MgJiAoQklUUy5DQVBUVVJFIHwgQklUUy5FUF9DQVBUVVJFKSkge1xuICAgICAgICBpZiAobW92ZS5waWVjZSA9PT0gUEFXTikge1xuICAgICAgICAgIG91dHB1dCArPSBhbGdlYnJhaWMobW92ZS5mcm9tKVswXVxuICAgICAgICB9XG4gICAgICAgIG91dHB1dCArPSAneCdcbiAgICAgIH1cblxuICAgICAgb3V0cHV0ICs9IGFsZ2VicmFpYyhtb3ZlLnRvKVxuXG4gICAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuUFJPTU9USU9OKSB7XG4gICAgICAgIG91dHB1dCArPSAnPScgKyBtb3ZlLnByb21vdGlvbi50b1VwcGVyQ2FzZSgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgbWFrZV9tb3ZlKG1vdmUpXG4gICAgaWYgKGluX2NoZWNrKCkpIHtcbiAgICAgIGlmIChpbl9jaGVja21hdGUoKSkge1xuICAgICAgICBvdXRwdXQgKz0gJyMnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQgKz0gJysnXG4gICAgICB9XG4gICAgfVxuICAgIHVuZG9fbW92ZSgpXG5cbiAgICByZXR1cm4gb3V0cHV0XG4gIH1cbiAgLy8gcGFyc2VzIGFsbCBvZiB0aGUgZGVjb3JhdG9ycyBvdXQgb2YgYSBTQU4gc3RyaW5nXG4gIGZ1bmN0aW9uIHN0cmlwcGVkX3Nhbihtb3ZlKSB7XG4gICAgcmV0dXJuIG1vdmUucmVwbGFjZSgvPS8sICcnKS5yZXBsYWNlKC9bKyNdP1s/IV0qJC8sICcnKVxuICB9XG5cbiAgZnVuY3Rpb24gYXR0YWNrZWQoY29sb3IsIHNxdWFyZSkge1xuICAgIGZvciAodmFyIGkgPSBTUVVBUkVTLmE4OyBpIDw9IFNRVUFSRVMuaDE7IGkrKykge1xuICAgICAgLyogZGlkIHdlIHJ1biBvZmYgdGhlIGVuZCBvZiB0aGUgYm9hcmQgKi9cbiAgICAgIGlmIChpICYgMHg4OCkge1xuICAgICAgICBpICs9IDdcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLyogaWYgZW1wdHkgc3F1YXJlIG9yIHdyb25nIGNvbG9yICovXG4gICAgICBpZiAoYm9hcmRbaV0gPT0gbnVsbCB8fCBib2FyZFtpXS5jb2xvciAhPT0gY29sb3IpIGNvbnRpbnVlXG5cbiAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldXG4gICAgICB2YXIgZGlmZmVyZW5jZSA9IGkgLSBzcXVhcmVcbiAgICAgIHZhciBpbmRleCA9IGRpZmZlcmVuY2UgKyAxMTlcblxuICAgICAgaWYgKEFUVEFDS1NbaW5kZXhdICYgKDEgPDwgU0hJRlRTW3BpZWNlLnR5cGVdKSkge1xuICAgICAgICBpZiAocGllY2UudHlwZSA9PT0gUEFXTikge1xuICAgICAgICAgIGlmIChkaWZmZXJlbmNlID4gMCkge1xuICAgICAgICAgICAgaWYgKHBpZWNlLmNvbG9yID09PSBXSElURSkgcmV0dXJuIHRydWVcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHBpZWNlLmNvbG9yID09PSBCTEFDSykgcmV0dXJuIHRydWVcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIGlmIHRoZSBwaWVjZSBpcyBhIGtuaWdodCBvciBhIGtpbmcgKi9cbiAgICAgICAgaWYgKHBpZWNlLnR5cGUgPT09ICduJyB8fCBwaWVjZS50eXBlID09PSAnaycpIHJldHVybiB0cnVlXG5cbiAgICAgICAgdmFyIG9mZnNldCA9IFJBWVNbaW5kZXhdXG4gICAgICAgIHZhciBqID0gaSArIG9mZnNldFxuXG4gICAgICAgIHZhciBibG9ja2VkID0gZmFsc2VcbiAgICAgICAgd2hpbGUgKGogIT09IHNxdWFyZSkge1xuICAgICAgICAgIGlmIChib2FyZFtqXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBibG9ja2VkID0gdHJ1ZVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgICAgaiArPSBvZmZzZXRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYmxvY2tlZCkgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIGtpbmdfYXR0YWNrZWQoY29sb3IpIHtcbiAgICByZXR1cm4gYXR0YWNrZWQoc3dhcF9jb2xvcihjb2xvciksIGtpbmdzW2NvbG9yXSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGluX2NoZWNrKCkge1xuICAgIHJldHVybiBraW5nX2F0dGFja2VkKHR1cm4pXG4gIH1cblxuICBmdW5jdGlvbiBpbl9jaGVja21hdGUoKSB7XG4gICAgcmV0dXJuIGluX2NoZWNrKCkgJiYgZ2VuZXJhdGVfbW92ZXMoKS5sZW5ndGggPT09IDBcbiAgfVxuXG4gIGZ1bmN0aW9uIGluX3N0YWxlbWF0ZSgpIHtcbiAgICByZXR1cm4gIWluX2NoZWNrKCkgJiYgZ2VuZXJhdGVfbW92ZXMoKS5sZW5ndGggPT09IDBcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc3VmZmljaWVudF9tYXRlcmlhbCgpIHtcbiAgICB2YXIgcGllY2VzID0ge31cbiAgICB2YXIgYmlzaG9wcyA9IFtdXG4gICAgdmFyIG51bV9waWVjZXMgPSAwXG4gICAgdmFyIHNxX2NvbG9yID0gMFxuXG4gICAgZm9yICh2YXIgaSA9IFNRVUFSRVMuYTg7IGkgPD0gU1FVQVJFUy5oMTsgaSsrKSB7XG4gICAgICBzcV9jb2xvciA9IChzcV9jb2xvciArIDEpICUgMlxuICAgICAgaWYgKGkgJiAweDg4KSB7XG4gICAgICAgIGkgKz0gN1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgcGllY2UgPSBib2FyZFtpXVxuICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgIHBpZWNlc1twaWVjZS50eXBlXSA9IHBpZWNlLnR5cGUgaW4gcGllY2VzID8gcGllY2VzW3BpZWNlLnR5cGVdICsgMSA6IDFcbiAgICAgICAgaWYgKHBpZWNlLnR5cGUgPT09IEJJU0hPUCkge1xuICAgICAgICAgIGJpc2hvcHMucHVzaChzcV9jb2xvcilcbiAgICAgICAgfVxuICAgICAgICBudW1fcGllY2VzKytcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBrIHZzLiBrICovXG4gICAgaWYgKG51bV9waWVjZXMgPT09IDIpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIGlmIChcbiAgICAgIC8qIGsgdnMuIGtuIC4uLi4gb3IgLi4uLiBrIHZzLiBrYiAqL1xuICAgICAgbnVtX3BpZWNlcyA9PT0gMyAmJlxuICAgICAgKHBpZWNlc1tCSVNIT1BdID09PSAxIHx8IHBpZWNlc1tLTklHSFRdID09PSAxKVxuICAgICkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2UgaWYgKG51bV9waWVjZXMgPT09IHBpZWNlc1tCSVNIT1BdICsgMikge1xuICAgICAgLyoga2IgdnMuIGtiIHdoZXJlIGFueSBudW1iZXIgb2YgYmlzaG9wcyBhcmUgYWxsIG9uIHRoZSBzYW1lIGNvbG9yICovXG4gICAgICB2YXIgc3VtID0gMFxuICAgICAgdmFyIGxlbiA9IGJpc2hvcHMubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHN1bSArPSBiaXNob3BzW2ldXG4gICAgICB9XG4gICAgICBpZiAoc3VtID09PSAwIHx8IHN1bSA9PT0gbGVuKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBmdW5jdGlvbiBpbl90aHJlZWZvbGRfcmVwZXRpdGlvbigpIHtcbiAgICAvKiBUT0RPOiB3aGlsZSB0aGlzIGZ1bmN0aW9uIGlzIGZpbmUgZm9yIGNhc3VhbCB1c2UsIGEgYmV0dGVyXG4gICAgICogaW1wbGVtZW50YXRpb24gd291bGQgdXNlIGEgWm9icmlzdCBrZXkgKGluc3RlYWQgb2YgRkVOKS4gdGhlXG4gICAgICogWm9icmlzdCBrZXkgd291bGQgYmUgbWFpbnRhaW5lZCBpbiB0aGUgbWFrZV9tb3ZlL3VuZG9fbW92ZSBmdW5jdGlvbnMsXG4gICAgICogYXZvaWRpbmcgdGhlIGNvc3RseSB0aGF0IHdlIGRvIGJlbG93LlxuICAgICAqL1xuICAgIHZhciBtb3ZlcyA9IFtdXG4gICAgdmFyIHBvc2l0aW9ucyA9IHt9XG4gICAgdmFyIHJlcGV0aXRpb24gPSBmYWxzZVxuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciBtb3ZlID0gdW5kb19tb3ZlKClcbiAgICAgIGlmICghbW92ZSkgYnJlYWtcbiAgICAgIG1vdmVzLnB1c2gobW92ZSlcbiAgICB9XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgLyogcmVtb3ZlIHRoZSBsYXN0IHR3byBmaWVsZHMgaW4gdGhlIEZFTiBzdHJpbmcsIHRoZXkncmUgbm90IG5lZWRlZFxuICAgICAgICogd2hlbiBjaGVja2luZyBmb3IgZHJhdyBieSByZXAgKi9cbiAgICAgIHZhciBmZW4gPSBnZW5lcmF0ZV9mZW4oKS5zcGxpdCgnICcpLnNsaWNlKDAsIDQpLmpvaW4oJyAnKVxuXG4gICAgICAvKiBoYXMgdGhlIHBvc2l0aW9uIG9jY3VycmVkIHRocmVlIG9yIG1vdmUgdGltZXMgKi9cbiAgICAgIHBvc2l0aW9uc1tmZW5dID0gZmVuIGluIHBvc2l0aW9ucyA/IHBvc2l0aW9uc1tmZW5dICsgMSA6IDFcbiAgICAgIGlmIChwb3NpdGlvbnNbZmVuXSA+PSAzKSB7XG4gICAgICAgIHJlcGV0aXRpb24gPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICghbW92ZXMubGVuZ3RoKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBtYWtlX21vdmUobW92ZXMucG9wKCkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcGV0aXRpb25cbiAgfVxuXG4gIGZ1bmN0aW9uIHB1c2gobW92ZSkge1xuICAgIGhpc3RvcnkucHVzaCh7XG4gICAgICBtb3ZlOiBtb3ZlLFxuICAgICAga2luZ3M6IHsgYjoga2luZ3MuYiwgdzoga2luZ3MudyB9LFxuICAgICAgdHVybjogdHVybixcbiAgICAgIGNhc3RsaW5nOiB7IGI6IGNhc3RsaW5nLmIsIHc6IGNhc3RsaW5nLncgfSxcbiAgICAgIGVwX3NxdWFyZTogZXBfc3F1YXJlLFxuICAgICAgaGFsZl9tb3ZlczogaGFsZl9tb3ZlcyxcbiAgICAgIG1vdmVfbnVtYmVyOiBtb3ZlX251bWJlcixcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gbWFrZV9tb3ZlKG1vdmUpIHtcbiAgICB2YXIgdXMgPSB0dXJuXG4gICAgdmFyIHRoZW0gPSBzd2FwX2NvbG9yKHVzKVxuICAgIHB1c2gobW92ZSlcblxuICAgIGJvYXJkW21vdmUudG9dID0gYm9hcmRbbW92ZS5mcm9tXVxuICAgIGJvYXJkW21vdmUuZnJvbV0gPSBudWxsXG5cbiAgICAvKiBpZiBlcCBjYXB0dXJlLCByZW1vdmUgdGhlIGNhcHR1cmVkIHBhd24gKi9cbiAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuRVBfQ0FQVFVSRSkge1xuICAgICAgaWYgKHR1cm4gPT09IEJMQUNLKSB7XG4gICAgICAgIGJvYXJkW21vdmUudG8gLSAxNl0gPSBudWxsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib2FyZFttb3ZlLnRvICsgMTZdID0gbnVsbFxuICAgICAgfVxuICAgIH1cblxuICAgIC8qIGlmIHBhd24gcHJvbW90aW9uLCByZXBsYWNlIHdpdGggbmV3IHBpZWNlICovXG4gICAgaWYgKG1vdmUuZmxhZ3MgJiBCSVRTLlBST01PVElPTikge1xuICAgICAgYm9hcmRbbW92ZS50b10gPSB7IHR5cGU6IG1vdmUucHJvbW90aW9uLCBjb2xvcjogdXMgfVxuICAgIH1cblxuICAgIC8qIGlmIHdlIG1vdmVkIHRoZSBraW5nICovXG4gICAgaWYgKGJvYXJkW21vdmUudG9dLnR5cGUgPT09IEtJTkcpIHtcbiAgICAgIGtpbmdzW2JvYXJkW21vdmUudG9dLmNvbG9yXSA9IG1vdmUudG9cblxuICAgICAgLyogaWYgd2UgY2FzdGxlZCwgbW92ZSB0aGUgcm9vayBuZXh0IHRvIHRoZSBraW5nICovXG4gICAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuS1NJREVfQ0FTVExFKSB7XG4gICAgICAgIHZhciBjYXN0bGluZ190byA9IG1vdmUudG8gLSAxXG4gICAgICAgIHZhciBjYXN0bGluZ19mcm9tID0gbW92ZS50byArIDFcbiAgICAgICAgYm9hcmRbY2FzdGxpbmdfdG9dID0gYm9hcmRbY2FzdGxpbmdfZnJvbV1cbiAgICAgICAgYm9hcmRbY2FzdGxpbmdfZnJvbV0gPSBudWxsXG4gICAgICB9IGVsc2UgaWYgKG1vdmUuZmxhZ3MgJiBCSVRTLlFTSURFX0NBU1RMRSkge1xuICAgICAgICB2YXIgY2FzdGxpbmdfdG8gPSBtb3ZlLnRvICsgMVxuICAgICAgICB2YXIgY2FzdGxpbmdfZnJvbSA9IG1vdmUudG8gLSAyXG4gICAgICAgIGJvYXJkW2Nhc3RsaW5nX3RvXSA9IGJvYXJkW2Nhc3RsaW5nX2Zyb21dXG4gICAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb21dID0gbnVsbFxuICAgICAgfVxuXG4gICAgICAvKiB0dXJuIG9mZiBjYXN0bGluZyAqL1xuICAgICAgY2FzdGxpbmdbdXNdID0gJydcbiAgICB9XG5cbiAgICAvKiB0dXJuIG9mZiBjYXN0bGluZyBpZiB3ZSBtb3ZlIGEgcm9vayAqL1xuICAgIGlmIChjYXN0bGluZ1t1c10pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBST09LU1t1c10ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIG1vdmUuZnJvbSA9PT0gUk9PS1NbdXNdW2ldLnNxdWFyZSAmJlxuICAgICAgICAgIGNhc3RsaW5nW3VzXSAmIFJPT0tTW3VzXVtpXS5mbGFnXG4gICAgICAgICkge1xuICAgICAgICAgIGNhc3RsaW5nW3VzXSBePSBST09LU1t1c11baV0uZmxhZ1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiB0dXJuIG9mZiBjYXN0bGluZyBpZiB3ZSBjYXB0dXJlIGEgcm9vayAqL1xuICAgIGlmIChjYXN0bGluZ1t0aGVtXSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IFJPT0tTW3RoZW1dLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBtb3ZlLnRvID09PSBST09LU1t0aGVtXVtpXS5zcXVhcmUgJiZcbiAgICAgICAgICBjYXN0bGluZ1t0aGVtXSAmIFJPT0tTW3RoZW1dW2ldLmZsYWdcbiAgICAgICAgKSB7XG4gICAgICAgICAgY2FzdGxpbmdbdGhlbV0gXj0gUk9PS1NbdGhlbV1baV0uZmxhZ1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBpZiBiaWcgcGF3biBtb3ZlLCB1cGRhdGUgdGhlIGVuIHBhc3NhbnQgc3F1YXJlICovXG4gICAgaWYgKG1vdmUuZmxhZ3MgJiBCSVRTLkJJR19QQVdOKSB7XG4gICAgICBpZiAodHVybiA9PT0gJ2InKSB7XG4gICAgICAgIGVwX3NxdWFyZSA9IG1vdmUudG8gLSAxNlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXBfc3F1YXJlID0gbW92ZS50byArIDE2XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVwX3NxdWFyZSA9IEVNUFRZXG4gICAgfVxuXG4gICAgLyogcmVzZXQgdGhlIDUwIG1vdmUgY291bnRlciBpZiBhIHBhd24gaXMgbW92ZWQgb3IgYSBwaWVjZSBpcyBjYXB0dXJlZCAqL1xuICAgIGlmIChtb3ZlLnBpZWNlID09PSBQQVdOKSB7XG4gICAgICBoYWxmX21vdmVzID0gMFxuICAgIH0gZWxzZSBpZiAobW92ZS5mbGFncyAmIChCSVRTLkNBUFRVUkUgfCBCSVRTLkVQX0NBUFRVUkUpKSB7XG4gICAgICBoYWxmX21vdmVzID0gMFxuICAgIH0gZWxzZSB7XG4gICAgICBoYWxmX21vdmVzKytcbiAgICB9XG5cbiAgICBpZiAodHVybiA9PT0gQkxBQ0spIHtcbiAgICAgIG1vdmVfbnVtYmVyKytcbiAgICB9XG4gICAgdHVybiA9IHN3YXBfY29sb3IodHVybilcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuZG9fbW92ZSgpIHtcbiAgICB2YXIgb2xkID0gaGlzdG9yeS5wb3AoKVxuICAgIGlmIChvbGQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICB2YXIgbW92ZSA9IG9sZC5tb3ZlXG4gICAga2luZ3MgPSBvbGQua2luZ3NcbiAgICB0dXJuID0gb2xkLnR1cm5cbiAgICBjYXN0bGluZyA9IG9sZC5jYXN0bGluZ1xuICAgIGVwX3NxdWFyZSA9IG9sZC5lcF9zcXVhcmVcbiAgICBoYWxmX21vdmVzID0gb2xkLmhhbGZfbW92ZXNcbiAgICBtb3ZlX251bWJlciA9IG9sZC5tb3ZlX251bWJlclxuXG4gICAgdmFyIHVzID0gdHVyblxuICAgIHZhciB0aGVtID0gc3dhcF9jb2xvcih0dXJuKVxuXG4gICAgYm9hcmRbbW92ZS5mcm9tXSA9IGJvYXJkW21vdmUudG9dXG4gICAgYm9hcmRbbW92ZS5mcm9tXS50eXBlID0gbW92ZS5waWVjZSAvLyB0byB1bmRvIGFueSBwcm9tb3Rpb25zXG4gICAgYm9hcmRbbW92ZS50b10gPSBudWxsXG5cbiAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuQ0FQVFVSRSkge1xuICAgICAgYm9hcmRbbW92ZS50b10gPSB7IHR5cGU6IG1vdmUuY2FwdHVyZWQsIGNvbG9yOiB0aGVtIH1cbiAgICB9IGVsc2UgaWYgKG1vdmUuZmxhZ3MgJiBCSVRTLkVQX0NBUFRVUkUpIHtcbiAgICAgIHZhciBpbmRleFxuICAgICAgaWYgKHVzID09PSBCTEFDSykge1xuICAgICAgICBpbmRleCA9IG1vdmUudG8gLSAxNlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZXggPSBtb3ZlLnRvICsgMTZcbiAgICAgIH1cbiAgICAgIGJvYXJkW2luZGV4XSA9IHsgdHlwZTogUEFXTiwgY29sb3I6IHRoZW0gfVxuICAgIH1cblxuICAgIGlmIChtb3ZlLmZsYWdzICYgKEJJVFMuS1NJREVfQ0FTVExFIHwgQklUUy5RU0lERV9DQVNUTEUpKSB7XG4gICAgICB2YXIgY2FzdGxpbmdfdG8sIGNhc3RsaW5nX2Zyb21cbiAgICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5LU0lERV9DQVNUTEUpIHtcbiAgICAgICAgY2FzdGxpbmdfdG8gPSBtb3ZlLnRvICsgMVxuICAgICAgICBjYXN0bGluZ19mcm9tID0gbW92ZS50byAtIDFcbiAgICAgIH0gZWxzZSBpZiAobW92ZS5mbGFncyAmIEJJVFMuUVNJREVfQ0FTVExFKSB7XG4gICAgICAgIGNhc3RsaW5nX3RvID0gbW92ZS50byAtIDJcbiAgICAgICAgY2FzdGxpbmdfZnJvbSA9IG1vdmUudG8gKyAxXG4gICAgICB9XG5cbiAgICAgIGJvYXJkW2Nhc3RsaW5nX3RvXSA9IGJvYXJkW2Nhc3RsaW5nX2Zyb21dXG4gICAgICBib2FyZFtjYXN0bGluZ19mcm9tXSA9IG51bGxcbiAgICB9XG5cbiAgICByZXR1cm4gbW92ZVxuICB9XG5cbiAgLyogdGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHVuaXF1ZWx5IGlkZW50aWZ5IGFtYmlndW91cyBtb3ZlcyAqL1xuICBmdW5jdGlvbiBnZXRfZGlzYW1iaWd1YXRvcihtb3ZlLCBtb3Zlcykge1xuICAgIHZhciBmcm9tID0gbW92ZS5mcm9tXG4gICAgdmFyIHRvID0gbW92ZS50b1xuICAgIHZhciBwaWVjZSA9IG1vdmUucGllY2VcblxuICAgIHZhciBhbWJpZ3VpdGllcyA9IDBcbiAgICB2YXIgc2FtZV9yYW5rID0gMFxuICAgIHZhciBzYW1lX2ZpbGUgPSAwXG5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbW92ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciBhbWJpZ19mcm9tID0gbW92ZXNbaV0uZnJvbVxuICAgICAgdmFyIGFtYmlnX3RvID0gbW92ZXNbaV0udG9cbiAgICAgIHZhciBhbWJpZ19waWVjZSA9IG1vdmVzW2ldLnBpZWNlXG5cbiAgICAgIC8qIGlmIGEgbW92ZSBvZiB0aGUgc2FtZSBwaWVjZSB0eXBlIGVuZHMgb24gdGhlIHNhbWUgdG8gc3F1YXJlLCB3ZSdsbFxuICAgICAgICogbmVlZCB0byBhZGQgYSBkaXNhbWJpZ3VhdG9yIHRvIHRoZSBhbGdlYnJhaWMgbm90YXRpb25cbiAgICAgICAqL1xuICAgICAgaWYgKHBpZWNlID09PSBhbWJpZ19waWVjZSAmJiBmcm9tICE9PSBhbWJpZ19mcm9tICYmIHRvID09PSBhbWJpZ190bykge1xuICAgICAgICBhbWJpZ3VpdGllcysrXG5cbiAgICAgICAgaWYgKHJhbmsoZnJvbSkgPT09IHJhbmsoYW1iaWdfZnJvbSkpIHtcbiAgICAgICAgICBzYW1lX3JhbmsrK1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGUoZnJvbSkgPT09IGZpbGUoYW1iaWdfZnJvbSkpIHtcbiAgICAgICAgICBzYW1lX2ZpbGUrK1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFtYmlndWl0aWVzID4gMCkge1xuICAgICAgLyogaWYgdGhlcmUgZXhpc3RzIGEgc2ltaWxhciBtb3ZpbmcgcGllY2Ugb24gdGhlIHNhbWUgcmFuayBhbmQgZmlsZSBhc1xuICAgICAgICogdGhlIG1vdmUgaW4gcXVlc3Rpb24sIHVzZSB0aGUgc3F1YXJlIGFzIHRoZSBkaXNhbWJpZ3VhdG9yXG4gICAgICAgKi9cbiAgICAgIGlmIChzYW1lX3JhbmsgPiAwICYmIHNhbWVfZmlsZSA+IDApIHtcbiAgICAgICAgcmV0dXJuIGFsZ2VicmFpYyhmcm9tKVxuICAgICAgfSBlbHNlIGlmIChzYW1lX2ZpbGUgPiAwKSB7XG4gICAgICAgIC8qIGlmIHRoZSBtb3ZpbmcgcGllY2UgcmVzdHMgb24gdGhlIHNhbWUgZmlsZSwgdXNlIHRoZSByYW5rIHN5bWJvbCBhcyB0aGVcbiAgICAgICAgICogZGlzYW1iaWd1YXRvclxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIGFsZ2VicmFpYyhmcm9tKS5jaGFyQXQoMSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGVsc2UgdXNlIHRoZSBmaWxlIHN5bWJvbCAqL1xuICAgICAgICByZXR1cm4gYWxnZWJyYWljKGZyb20pLmNoYXJBdCgwKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgZnVuY3Rpb24gaW5mZXJfcGllY2VfdHlwZShzYW4pIHtcbiAgICB2YXIgcGllY2VfdHlwZSA9IHNhbi5jaGFyQXQoMClcbiAgICBpZiAocGllY2VfdHlwZSA+PSAnYScgJiYgcGllY2VfdHlwZSA8PSAnaCcpIHtcbiAgICAgIHZhciBtYXRjaGVzID0gc2FuLm1hdGNoKC9bYS1oXVxcZC4qW2EtaF1cXGQvKVxuICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgcmV0dXJuIFBBV05cbiAgICB9XG4gICAgcGllY2VfdHlwZSA9IHBpZWNlX3R5cGUudG9Mb3dlckNhc2UoKVxuICAgIGlmIChwaWVjZV90eXBlID09PSAnbycpIHtcbiAgICAgIHJldHVybiBLSU5HXG4gICAgfVxuICAgIHJldHVybiBwaWVjZV90eXBlXG4gIH1cbiAgZnVuY3Rpb24gYXNjaWkoKSB7XG4gICAgdmFyIHMgPSAnICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcXG4nXG4gICAgZm9yICh2YXIgaSA9IFNRVUFSRVMuYTg7IGkgPD0gU1FVQVJFUy5oMTsgaSsrKSB7XG4gICAgICAvKiBkaXNwbGF5IHRoZSByYW5rICovXG4gICAgICBpZiAoZmlsZShpKSA9PT0gMCkge1xuICAgICAgICBzICs9ICcgJyArICc4NzY1NDMyMSdbcmFuayhpKV0gKyAnIHwnXG4gICAgICB9XG5cbiAgICAgIC8qIGVtcHR5IHBpZWNlICovXG4gICAgICBpZiAoYm9hcmRbaV0gPT0gbnVsbCkge1xuICAgICAgICBzICs9ICcgLiAnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcGllY2UgPSBib2FyZFtpXS50eXBlXG4gICAgICAgIHZhciBjb2xvciA9IGJvYXJkW2ldLmNvbG9yXG4gICAgICAgIHZhciBzeW1ib2wgPSBjb2xvciA9PT0gV0hJVEUgPyBwaWVjZS50b1VwcGVyQ2FzZSgpIDogcGllY2UudG9Mb3dlckNhc2UoKVxuICAgICAgICBzICs9ICcgJyArIHN5bWJvbCArICcgJ1xuICAgICAgfVxuXG4gICAgICBpZiAoKGkgKyAxKSAmIDB4ODgpIHtcbiAgICAgICAgcyArPSAnfFxcbidcbiAgICAgICAgaSArPSA4XG4gICAgICB9XG4gICAgfVxuICAgIHMgKz0gJyAgICstLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0rXFxuJ1xuICAgIHMgKz0gJyAgICAgYSAgYiAgYyAgZCAgZSAgZiAgZyAgaFxcbidcblxuICAgIHJldHVybiBzXG4gIH1cblxuICAvLyBjb252ZXJ0IGEgbW92ZSBmcm9tIFN0YW5kYXJkIEFsZ2VicmFpYyBOb3RhdGlvbiAoU0FOKSB0byAweDg4IGNvb3JkaW5hdGVzXG4gIGZ1bmN0aW9uIG1vdmVfZnJvbV9zYW4obW92ZSwgc2xvcHB5KSB7XG4gICAgLy8gc3RyaXAgb2ZmIGFueSBtb3ZlIGRlY29yYXRpb25zOiBlLmcgTmYzKz8hIGJlY29tZXMgTmYzXG4gICAgdmFyIGNsZWFuX21vdmUgPSBzdHJpcHBlZF9zYW4obW92ZSlcblxuICAgIHZhciBvdmVybHlfZGlzYW1iaWd1YXRlZCA9IGZhbHNlXG5cbiAgICBpZiAoc2xvcHB5KSB7XG4gICAgICAvLyBUaGUgc2xvcHB5IHBhcnNlciBhbGxvd3MgdGhlIHVzZXIgdG8gcGFyc2Ugbm9uLXN0YW5kYXJkIGNoZXNzXG4gICAgICAvLyBub3RhdGlvbnMuIFRoaXMgcGFyc2VyIGlzIG9wdC1pbiAoYnkgc3BlY2lmeWluZyB0aGVcbiAgICAgIC8vICd7IHNsb3BweTogdHJ1ZSB9JyBzZXR0aW5nKSBhbmQgaXMgb25seSBydW4gYWZ0ZXIgdGhlIFN0YW5kYXJkXG4gICAgICAvLyBBbGdlYnJhaWMgTm90YXRpb24gKFNBTikgcGFyc2VyIGhhcyBmYWlsZWQuXG4gICAgICAvL1xuICAgICAgLy8gV2hlbiBydW5uaW5nIHRoZSBzbG9wcHkgcGFyc2VyLCB3ZSdsbCBydW4gYSByZWdleCB0byBncmFiIHRoZSBwaWVjZSxcbiAgICAgIC8vIHRoZSB0by9mcm9tIHNxdWFyZSwgYW5kIGFuIG9wdGlvbmFsIHByb21vdGlvbiBwaWVjZS4gVGhpcyByZWdleCB3aWxsXG4gICAgICAvLyBwYXJzZSBjb21tb24gbm9uLXN0YW5kYXJkIG5vdGF0aW9uIGxpa2U6IFBlMi1lNCwgUmMxYzQsIFFmM3hmNywgZjdmOHEsXG4gICAgICAvLyBiMWMzXG5cbiAgICAgIC8vIE5PVEU6IFNvbWUgcG9zaXRpb25zIGFuZCBtb3ZlcyBtYXkgYmUgYW1iaWd1b3VzIHdoZW4gdXNpbmcgdGhlIHNsb3BweVxuICAgICAgLy8gcGFyc2VyLiBGb3IgZXhhbXBsZSwgaW4gdGhpcyBwb3NpdGlvbjogNmsxLzgvOC9CNy84LzgvOC9CTjRLMSB3IC0gLSAwIDEsXG4gICAgICAvLyB0aGUgbW92ZSBiMWMzIG1heSBiZSBpbnRlcnByZXRlZCBhcyBOYzMgb3IgQjFjMyAoYSBkaXNhbWJpZ3VhdGVkXG4gICAgICAvLyBiaXNob3AgbW92ZSkuIEluIHRoZXNlIGNhc2VzLCB0aGUgc2xvcHB5IHBhcnNlciB3aWxsIGRlZmF1bHQgdG8gdGhlXG4gICAgICAvLyBtb3N0IG1vc3QgYmFzaWMgaW50ZXJwcmV0YXRpb24gLSBiMWMzIHBhcnNlcyB0byBOYzMuXG5cbiAgICAgIHZhciBtYXRjaGVzID0gY2xlYW5fbW92ZS5tYXRjaChcbiAgICAgICAgLyhbcG5icnFrUE5CUlFLXSk/KFthLWhdWzEtOF0peD8tPyhbYS1oXVsxLThdKShbcXJiblFSQk5dKT8vXG4gICAgICApXG4gICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICB2YXIgcGllY2UgPSBtYXRjaGVzWzFdXG4gICAgICAgIHZhciBmcm9tID0gbWF0Y2hlc1syXVxuICAgICAgICB2YXIgdG8gPSBtYXRjaGVzWzNdXG4gICAgICAgIHZhciBwcm9tb3Rpb24gPSBtYXRjaGVzWzRdXG5cbiAgICAgICAgaWYgKGZyb20ubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICBvdmVybHlfZGlzYW1iaWd1YXRlZCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIFthLWhdP1sxLThdPyBwb3J0aW9uIG9mIHRoZSByZWdleCBiZWxvdyBoYW5kbGVzIG1vdmVzIHRoYXQgbWF5XG4gICAgICAgIC8vIGJlIG92ZXJseSBkaXNhbWJpZ3VhdGVkIChlLmcuIE5nZTcgaXMgdW5uZWNlc3NhcnkgYW5kIG5vbi1zdGFuZGFyZFxuICAgICAgICAvLyB3aGVuIHRoZXJlIGlzIG9uZSBsZWdhbCBrbmlnaHQgbW92ZSB0byBlNykuIEluIHRoaXMgY2FzZSwgdGhlIHZhbHVlXG4gICAgICAgIC8vIG9mICdmcm9tJyB2YXJpYWJsZSB3aWxsIGJlIGEgcmFuayBvciBmaWxlLCBub3QgYSBzcXVhcmUuXG4gICAgICAgIHZhciBtYXRjaGVzID0gY2xlYW5fbW92ZS5tYXRjaChcbiAgICAgICAgICAvKFtwbmJycWtQTkJSUUtdKT8oW2EtaF0/WzEtOF0/KXg/LT8oW2EtaF1bMS04XSkoW3FyYm5RUkJOXSk/L1xuICAgICAgICApXG5cbiAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICB2YXIgcGllY2UgPSBtYXRjaGVzWzFdXG4gICAgICAgICAgdmFyIGZyb20gPSBtYXRjaGVzWzJdXG4gICAgICAgICAgdmFyIHRvID0gbWF0Y2hlc1szXVxuICAgICAgICAgIHZhciBwcm9tb3Rpb24gPSBtYXRjaGVzWzRdXG5cbiAgICAgICAgICBpZiAoZnJvbS5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgdmFyIG92ZXJseV9kaXNhbWJpZ3VhdGVkID0gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwaWVjZV90eXBlID0gaW5mZXJfcGllY2VfdHlwZShjbGVhbl9tb3ZlKVxuICAgIHZhciBtb3ZlcyA9IGdlbmVyYXRlX21vdmVzKHtcbiAgICAgIGxlZ2FsOiB0cnVlLFxuICAgICAgcGllY2U6IHBpZWNlID8gcGllY2UgOiBwaWVjZV90eXBlLFxuICAgIH0pXG5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbW92ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIC8vIHRyeSB0aGUgc3RyaWN0IHBhcnNlciBmaXJzdCwgdGhlbiB0aGUgc2xvcHB5IHBhcnNlciBpZiByZXF1ZXN0ZWRcbiAgICAgIC8vIGJ5IHRoZSB1c2VyXG4gICAgICBpZiAoY2xlYW5fbW92ZSA9PT0gc3RyaXBwZWRfc2FuKG1vdmVfdG9fc2FuKG1vdmVzW2ldLCBtb3ZlcykpKSB7XG4gICAgICAgIHJldHVybiBtb3Zlc1tpXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNsb3BweSAmJiBtYXRjaGVzKSB7XG4gICAgICAgICAgLy8gaGFuZC1jb21wYXJlIG1vdmUgcHJvcGVydGllcyB3aXRoIHRoZSByZXN1bHRzIGZyb20gb3VyIHNsb3BweVxuICAgICAgICAgIC8vIHJlZ2V4XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgKCFwaWVjZSB8fCBwaWVjZS50b0xvd2VyQ2FzZSgpID09IG1vdmVzW2ldLnBpZWNlKSAmJlxuICAgICAgICAgICAgU1FVQVJFU1tmcm9tXSA9PSBtb3Zlc1tpXS5mcm9tICYmXG4gICAgICAgICAgICBTUVVBUkVTW3RvXSA9PSBtb3Zlc1tpXS50byAmJlxuICAgICAgICAgICAgKCFwcm9tb3Rpb24gfHwgcHJvbW90aW9uLnRvTG93ZXJDYXNlKCkgPT0gbW92ZXNbaV0ucHJvbW90aW9uKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIG1vdmVzW2ldXG4gICAgICAgICAgfSBlbHNlIGlmIChvdmVybHlfZGlzYW1iaWd1YXRlZCkge1xuICAgICAgICAgICAgLy8gU1BFQ0lBTCBDQVNFOiB3ZSBwYXJzZWQgYSBtb3ZlIHN0cmluZyB0aGF0IG1heSBoYXZlIGFuIHVubmVlZGVkXG4gICAgICAgICAgICAvLyByYW5rL2ZpbGUgZGlzYW1iaWd1YXRvciAoZS5nLiBOZ2U3KS4gIFRoZSAnZnJvbScgdmFyaWFibGUgd2lsbFxuICAgICAgICAgICAgdmFyIHNxdWFyZSA9IGFsZ2VicmFpYyhtb3Zlc1tpXS5mcm9tKVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAoIXBpZWNlIHx8IHBpZWNlLnRvTG93ZXJDYXNlKCkgPT0gbW92ZXNbaV0ucGllY2UpICYmXG4gICAgICAgICAgICAgIFNRVUFSRVNbdG9dID09IG1vdmVzW2ldLnRvICYmXG4gICAgICAgICAgICAgIChmcm9tID09IHNxdWFyZVswXSB8fCBmcm9tID09IHNxdWFyZVsxXSkgJiZcbiAgICAgICAgICAgICAgKCFwcm9tb3Rpb24gfHwgcHJvbW90aW9uLnRvTG93ZXJDYXNlKCkgPT0gbW92ZXNbaV0ucHJvbW90aW9uKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIHJldHVybiBtb3Zlc1tpXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogVVRJTElUWSBGVU5DVElPTlNcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIGZ1bmN0aW9uIHJhbmsoaSkge1xuICAgIHJldHVybiBpID4+IDRcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGUoaSkge1xuICAgIHJldHVybiBpICYgMTVcbiAgfVxuXG4gIGZ1bmN0aW9uIGFsZ2VicmFpYyhpKSB7XG4gICAgdmFyIGYgPSBmaWxlKGkpLFxuICAgICAgciA9IHJhbmsoaSlcbiAgICByZXR1cm4gJ2FiY2RlZmdoJy5zdWJzdHJpbmcoZiwgZiArIDEpICsgJzg3NjU0MzIxJy5zdWJzdHJpbmcociwgciArIDEpXG4gIH1cblxuICBmdW5jdGlvbiBzd2FwX2NvbG9yKGMpIHtcbiAgICByZXR1cm4gYyA9PT0gV0hJVEUgPyBCTEFDSyA6IFdISVRFXG4gIH1cblxuICBmdW5jdGlvbiBpc19kaWdpdChjKSB7XG4gICAgcmV0dXJuICcwMTIzNDU2Nzg5Jy5pbmRleE9mKGMpICE9PSAtMVxuICB9XG5cbiAgLyogcHJldHR5ID0gZXh0ZXJuYWwgbW92ZSBvYmplY3QgKi9cbiAgZnVuY3Rpb24gbWFrZV9wcmV0dHkodWdseV9tb3ZlKSB7XG4gICAgdmFyIG1vdmUgPSBjbG9uZSh1Z2x5X21vdmUpXG4gICAgbW92ZS5zYW4gPSBtb3ZlX3RvX3Nhbihtb3ZlLCBnZW5lcmF0ZV9tb3Zlcyh7IGxlZ2FsOiB0cnVlIH0pKVxuICAgIG1vdmUudG8gPSBhbGdlYnJhaWMobW92ZS50bylcbiAgICBtb3ZlLmZyb20gPSBhbGdlYnJhaWMobW92ZS5mcm9tKVxuXG4gICAgdmFyIGZsYWdzID0gJydcblxuICAgIGZvciAodmFyIGZsYWcgaW4gQklUUykge1xuICAgICAgaWYgKEJJVFNbZmxhZ10gJiBtb3ZlLmZsYWdzKSB7XG4gICAgICAgIGZsYWdzICs9IEZMQUdTW2ZsYWddXG4gICAgICB9XG4gICAgfVxuICAgIG1vdmUuZmxhZ3MgPSBmbGFnc1xuXG4gICAgcmV0dXJuIG1vdmVcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb25lKG9iaikge1xuICAgIHZhciBkdXBlID0gb2JqIGluc3RhbmNlb2YgQXJyYXkgPyBbXSA6IHt9XG5cbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBvYmopIHtcbiAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGR1cGVbcHJvcGVydHldID0gY2xvbmUob2JqW3Byb3BlcnR5XSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGR1cGVbcHJvcGVydHldID0gb2JqW3Byb3BlcnR5XVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkdXBlXG4gIH1cblxuICBmdW5jdGlvbiB0cmltKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG4gIH1cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogREVCVUdHSU5HIFVUSUxJVElFU1xuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgZnVuY3Rpb24gcGVyZnQoZGVwdGgpIHtcbiAgICB2YXIgbW92ZXMgPSBnZW5lcmF0ZV9tb3Zlcyh7IGxlZ2FsOiBmYWxzZSB9KVxuICAgIHZhciBub2RlcyA9IDBcbiAgICB2YXIgY29sb3IgPSB0dXJuXG5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gbW92ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIG1ha2VfbW92ZShtb3Zlc1tpXSlcbiAgICAgIGlmICgha2luZ19hdHRhY2tlZChjb2xvcikpIHtcbiAgICAgICAgaWYgKGRlcHRoIC0gMSA+IDApIHtcbiAgICAgICAgICB2YXIgY2hpbGRfbm9kZXMgPSBwZXJmdChkZXB0aCAtIDEpXG4gICAgICAgICAgbm9kZXMgKz0gY2hpbGRfbm9kZXNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub2RlcysrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHVuZG9fbW92ZSgpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVzXG4gIH1cblxuICByZXR1cm4ge1xuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgKiBQVUJMSUMgQ09OU1RBTlRTIChpcyB0aGVyZSBhIGJldHRlciB3YXkgdG8gZG8gdGhpcz8pXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAgIFdISVRFOiBXSElURSxcbiAgICBCTEFDSzogQkxBQ0ssXG4gICAgUEFXTjogUEFXTixcbiAgICBLTklHSFQ6IEtOSUdIVCxcbiAgICBCSVNIT1A6IEJJU0hPUCxcbiAgICBST09LOiBST09LLFxuICAgIFFVRUVOOiBRVUVFTixcbiAgICBLSU5HOiBLSU5HLFxuICAgIFNRVUFSRVM6IChmdW5jdGlvbiAoKSB7XG4gICAgICAvKiBmcm9tIHRoZSBFQ01BLTI2MiBzcGVjIChzZWN0aW9uIDEyLjYuNCk6XG4gICAgICAgKiBcIlRoZSBtZWNoYW5pY3Mgb2YgZW51bWVyYXRpbmcgdGhlIHByb3BlcnRpZXMgLi4uIGlzXG4gICAgICAgKiBpbXBsZW1lbnRhdGlvbiBkZXBlbmRlbnRcIlxuICAgICAgICogc286IGZvciAodmFyIHNxIGluIFNRVUFSRVMpIHsga2V5cy5wdXNoKHNxKTsgfSBtaWdodCBub3QgYmVcbiAgICAgICAqIG9yZGVyZWQgY29ycmVjdGx5XG4gICAgICAgKi9cbiAgICAgIHZhciBrZXlzID0gW11cbiAgICAgIGZvciAodmFyIGkgPSBTUVVBUkVTLmE4OyBpIDw9IFNRVUFSRVMuaDE7IGkrKykge1xuICAgICAgICBpZiAoaSAmIDB4ODgpIHtcbiAgICAgICAgICBpICs9IDdcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIGtleXMucHVzaChhbGdlYnJhaWMoaSkpXG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5c1xuICAgIH0pKCksXG4gICAgRkxBR1M6IEZMQUdTLFxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAqIFBVQkxJQyBBUElcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgbG9hZDogZnVuY3Rpb24gKGZlbikge1xuICAgICAgcmV0dXJuIGxvYWQoZmVuKVxuICAgIH0sXG5cbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHJlc2V0KClcbiAgICB9LFxuXG4gICAgbW92ZXM6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAvKiBUaGUgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgYSBjaGVzcyBtb3ZlIGlzIGluIDB4ODggZm9ybWF0LCBhbmRcbiAgICAgICAqIG5vdCBtZWFudCB0byBiZSBodW1hbi1yZWFkYWJsZS4gIFRoZSBjb2RlIGJlbG93IGNvbnZlcnRzIHRoZSAweDg4XG4gICAgICAgKiBzcXVhcmUgY29vcmRpbmF0ZXMgdG8gYWxnZWJyYWljIGNvb3JkaW5hdGVzLiAgSXQgYWxzbyBwcnVuZXMgYW5cbiAgICAgICAqIHVubmVjZXNzYXJ5IG1vdmUga2V5cyByZXN1bHRpbmcgZnJvbSBhIHZlcmJvc2UgY2FsbC5cbiAgICAgICAqL1xuXG4gICAgICB2YXIgdWdseV9tb3ZlcyA9IGdlbmVyYXRlX21vdmVzKG9wdGlvbnMpXG4gICAgICB2YXIgbW92ZXMgPSBbXVxuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdWdseV9tb3Zlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAvKiBkb2VzIHRoZSB1c2VyIHdhbnQgYSBmdWxsIG1vdmUgb2JqZWN0IChtb3N0IGxpa2VseSBub3QpLCBvciBqdXN0XG4gICAgICAgICAqIFNBTlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICd2ZXJib3NlJyBpbiBvcHRpb25zICYmXG4gICAgICAgICAgb3B0aW9ucy52ZXJib3NlXG4gICAgICAgICkge1xuICAgICAgICAgIG1vdmVzLnB1c2gobWFrZV9wcmV0dHkodWdseV9tb3Zlc1tpXSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW92ZXMucHVzaChcbiAgICAgICAgICAgIG1vdmVfdG9fc2FuKHVnbHlfbW92ZXNbaV0sIGdlbmVyYXRlX21vdmVzKHsgbGVnYWw6IHRydWUgfSkpXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb3Zlc1xuICAgIH0sXG5cbiAgICBpbl9jaGVjazogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGluX2NoZWNrKClcbiAgICB9LFxuXG4gICAgaW5fY2hlY2ttYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaW5fY2hlY2ttYXRlKClcbiAgICB9LFxuXG4gICAgaW5fc3RhbGVtYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaW5fc3RhbGVtYXRlKClcbiAgICB9LFxuXG4gICAgaW5fZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgaGFsZl9tb3ZlcyA+PSAxMDAgfHxcbiAgICAgICAgaW5fc3RhbGVtYXRlKCkgfHxcbiAgICAgICAgaW5zdWZmaWNpZW50X21hdGVyaWFsKCkgfHxcbiAgICAgICAgaW5fdGhyZWVmb2xkX3JlcGV0aXRpb24oKVxuICAgICAgKVxuICAgIH0sXG5cbiAgICBpbnN1ZmZpY2llbnRfbWF0ZXJpYWw6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpbnN1ZmZpY2llbnRfbWF0ZXJpYWwoKVxuICAgIH0sXG5cbiAgICBpbl90aHJlZWZvbGRfcmVwZXRpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGluX3RocmVlZm9sZF9yZXBldGl0aW9uKClcbiAgICB9LFxuXG4gICAgZ2FtZV9vdmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBoYWxmX21vdmVzID49IDEwMCB8fFxuICAgICAgICBpbl9jaGVja21hdGUoKSB8fFxuICAgICAgICBpbl9zdGFsZW1hdGUoKSB8fFxuICAgICAgICBpbnN1ZmZpY2llbnRfbWF0ZXJpYWwoKSB8fFxuICAgICAgICBpbl90aHJlZWZvbGRfcmVwZXRpdGlvbigpXG4gICAgICApXG4gICAgfSxcblxuICAgIHZhbGlkYXRlX2ZlbjogZnVuY3Rpb24gKGZlbikge1xuICAgICAgcmV0dXJuIHZhbGlkYXRlX2ZlbihmZW4pXG4gICAgfSxcblxuICAgIGZlbjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGdlbmVyYXRlX2ZlbigpXG4gICAgfSxcblxuICAgIGJvYXJkOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgb3V0cHV0ID0gW10sXG4gICAgICAgIHJvdyA9IFtdXG5cbiAgICAgIGZvciAodmFyIGkgPSBTUVVBUkVTLmE4OyBpIDw9IFNRVUFSRVMuaDE7IGkrKykge1xuICAgICAgICBpZiAoYm9hcmRbaV0gPT0gbnVsbCkge1xuICAgICAgICAgIHJvdy5wdXNoKG51bGwpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcm93LnB1c2goeyB0eXBlOiBib2FyZFtpXS50eXBlLCBjb2xvcjogYm9hcmRbaV0uY29sb3IgfSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGkgKyAxKSAmIDB4ODgpIHtcbiAgICAgICAgICBvdXRwdXQucHVzaChyb3cpXG4gICAgICAgICAgcm93ID0gW11cbiAgICAgICAgICBpICs9IDhcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcblxuICAgIHBnbjogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIC8qIHVzaW5nIHRoZSBzcGVjaWZpY2F0aW9uIGZyb20gaHR0cDovL3d3dy5jaGVzc2NsdWIuY29tL2hlbHAvUEdOLXNwZWNcbiAgICAgICAqIGV4YW1wbGUgZm9yIGh0bWwgdXNhZ2U6IC5wZ24oeyBtYXhfd2lkdGg6IDcyLCBuZXdsaW5lX2NoYXI6IFwiPGJyIC8+XCIgfSlcbiAgICAgICAqL1xuICAgICAgdmFyIG5ld2xpbmUgPVxuICAgICAgICB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG9wdGlvbnMubmV3bGluZV9jaGFyID09PSAnc3RyaW5nJ1xuICAgICAgICAgID8gb3B0aW9ucy5uZXdsaW5lX2NoYXJcbiAgICAgICAgICA6ICdcXG4nXG4gICAgICB2YXIgbWF4X3dpZHRoID1cbiAgICAgICAgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvcHRpb25zLm1heF93aWR0aCA9PT0gJ251bWJlcidcbiAgICAgICAgICA/IG9wdGlvbnMubWF4X3dpZHRoXG4gICAgICAgICAgOiAwXG4gICAgICB2YXIgcmVzdWx0ID0gW11cbiAgICAgIHZhciBoZWFkZXJfZXhpc3RzID0gZmFsc2VcblxuICAgICAgLyogYWRkIHRoZSBQR04gaGVhZGVyIGhlYWRlcnJtYXRpb24gKi9cbiAgICAgIGZvciAodmFyIGkgaW4gaGVhZGVyKSB7XG4gICAgICAgIC8qIFRPRE86IG9yZGVyIG9mIGVudW1lcmF0ZWQgcHJvcGVydGllcyBpbiBoZWFkZXIgb2JqZWN0IGlzIG5vdFxuICAgICAgICAgKiBndWFyYW50ZWVkLCBzZWUgRUNNQS0yNjIgc3BlYyAoc2VjdGlvbiAxMi42LjQpXG4gICAgICAgICAqL1xuICAgICAgICByZXN1bHQucHVzaCgnWycgKyBpICsgJyBcIicgKyBoZWFkZXJbaV0gKyAnXCJdJyArIG5ld2xpbmUpXG4gICAgICAgIGhlYWRlcl9leGlzdHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChoZWFkZXJfZXhpc3RzICYmIGhpc3RvcnkubGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKG5ld2xpbmUpXG4gICAgICB9XG5cbiAgICAgIHZhciBhcHBlbmRfY29tbWVudCA9IGZ1bmN0aW9uIChtb3ZlX3N0cmluZykge1xuICAgICAgICB2YXIgY29tbWVudCA9IGNvbW1lbnRzW2dlbmVyYXRlX2ZlbigpXVxuICAgICAgICBpZiAodHlwZW9mIGNvbW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdmFyIGRlbGltaXRlciA9IG1vdmVfc3RyaW5nLmxlbmd0aCA+IDAgPyAnICcgOiAnJ1xuICAgICAgICAgIG1vdmVfc3RyaW5nID0gYCR7bW92ZV9zdHJpbmd9JHtkZWxpbWl0ZXJ9eyR7Y29tbWVudH19YFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtb3ZlX3N0cmluZ1xuICAgICAgfVxuXG4gICAgICAvKiBwb3AgYWxsIG9mIGhpc3Rvcnkgb250byByZXZlcnNlZF9oaXN0b3J5ICovXG4gICAgICB2YXIgcmV2ZXJzZWRfaGlzdG9yeSA9IFtdXG4gICAgICB3aGlsZSAoaGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldmVyc2VkX2hpc3RvcnkucHVzaCh1bmRvX21vdmUoKSlcbiAgICAgIH1cblxuICAgICAgdmFyIG1vdmVzID0gW11cbiAgICAgIHZhciBtb3ZlX3N0cmluZyA9ICcnXG5cbiAgICAgIC8qIHNwZWNpYWwgY2FzZSBvZiBhIGNvbW1lbnRlZCBzdGFydGluZyBwb3NpdGlvbiB3aXRoIG5vIG1vdmVzICovXG4gICAgICBpZiAocmV2ZXJzZWRfaGlzdG9yeS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgbW92ZXMucHVzaChhcHBlbmRfY29tbWVudCgnJykpXG4gICAgICB9XG5cbiAgICAgIC8qIGJ1aWxkIHRoZSBsaXN0IG9mIG1vdmVzLiAgYSBtb3ZlX3N0cmluZyBsb29rcyBsaWtlOiBcIjMuIGUzIGU2XCIgKi9cbiAgICAgIHdoaWxlIChyZXZlcnNlZF9oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgbW92ZV9zdHJpbmcgPSBhcHBlbmRfY29tbWVudChtb3ZlX3N0cmluZylcbiAgICAgICAgdmFyIG1vdmUgPSByZXZlcnNlZF9oaXN0b3J5LnBvcCgpXG5cbiAgICAgICAgLyogaWYgdGhlIHBvc2l0aW9uIHN0YXJ0ZWQgd2l0aCBibGFjayB0byBtb3ZlLCBzdGFydCBQR04gd2l0aCAxLiAuLi4gKi9cbiAgICAgICAgaWYgKCFoaXN0b3J5Lmxlbmd0aCAmJiBtb3ZlLmNvbG9yID09PSAnYicpIHtcbiAgICAgICAgICBtb3ZlX3N0cmluZyA9IG1vdmVfbnVtYmVyICsgJy4gLi4uJ1xuICAgICAgICB9IGVsc2UgaWYgKG1vdmUuY29sb3IgPT09ICd3Jykge1xuICAgICAgICAgIC8qIHN0b3JlIHRoZSBwcmV2aW91cyBnZW5lcmF0ZWQgbW92ZV9zdHJpbmcgaWYgd2UgaGF2ZSBvbmUgKi9cbiAgICAgICAgICBpZiAobW92ZV9zdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICBtb3Zlcy5wdXNoKG1vdmVfc3RyaW5nKVxuICAgICAgICAgIH1cbiAgICAgICAgICBtb3ZlX3N0cmluZyA9IG1vdmVfbnVtYmVyICsgJy4nXG4gICAgICAgIH1cblxuICAgICAgICBtb3ZlX3N0cmluZyA9XG4gICAgICAgICAgbW92ZV9zdHJpbmcgKyAnICcgKyBtb3ZlX3RvX3Nhbihtb3ZlLCBnZW5lcmF0ZV9tb3Zlcyh7IGxlZ2FsOiB0cnVlIH0pKVxuICAgICAgICBtYWtlX21vdmUobW92ZSlcbiAgICAgIH1cblxuICAgICAgLyogYXJlIHRoZXJlIGFueSBvdGhlciBsZWZ0b3ZlciBtb3Zlcz8gKi9cbiAgICAgIGlmIChtb3ZlX3N0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgbW92ZXMucHVzaChhcHBlbmRfY29tbWVudChtb3ZlX3N0cmluZykpXG4gICAgICB9XG5cbiAgICAgIC8qIGlzIHRoZXJlIGEgcmVzdWx0PyAqL1xuICAgICAgaWYgKHR5cGVvZiBoZWFkZXIuUmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb3Zlcy5wdXNoKGhlYWRlci5SZXN1bHQpXG4gICAgICB9XG5cbiAgICAgIC8qIGhpc3Rvcnkgc2hvdWxkIGJlIGJhY2sgdG8gd2hhdCBpdCB3YXMgYmVmb3JlIHdlIHN0YXJ0ZWQgZ2VuZXJhdGluZyBQR04sXG4gICAgICAgKiBzbyBqb2luIHRvZ2V0aGVyIG1vdmVzXG4gICAgICAgKi9cbiAgICAgIGlmIChtYXhfd2lkdGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKCcnKSArIG1vdmVzLmpvaW4oJyAnKVxuICAgICAgfVxuXG4gICAgICB2YXIgc3RyaXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChyZXN1bHQubGVuZ3RoID4gMCAmJiByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSAnICcpIHtcbiAgICAgICAgICByZXN1bHQucG9wKClcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICAvKiBOQjogdGhpcyBkb2VzIG5vdCBwcmVzZXJ2ZSBjb21tZW50IHdoaXRlc3BhY2UuICovXG4gICAgICB2YXIgd3JhcF9jb21tZW50ID0gZnVuY3Rpb24gKHdpZHRoLCBtb3ZlKSB7XG4gICAgICAgIGZvciAodmFyIHRva2VuIG9mIG1vdmUuc3BsaXQoJyAnKSkge1xuICAgICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh3aWR0aCArIHRva2VuLmxlbmd0aCA+IG1heF93aWR0aCkge1xuICAgICAgICAgICAgd2hpbGUgKHN0cmlwKCkpIHtcbiAgICAgICAgICAgICAgd2lkdGgtLVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0LnB1c2gobmV3bGluZSlcbiAgICAgICAgICAgIHdpZHRoID0gMFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHQucHVzaCh0b2tlbilcbiAgICAgICAgICB3aWR0aCArPSB0b2tlbi5sZW5ndGhcbiAgICAgICAgICByZXN1bHQucHVzaCgnICcpXG4gICAgICAgICAgd2lkdGgrK1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdHJpcCgpKSB7XG4gICAgICAgICAgd2lkdGgtLVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aWR0aFxuICAgICAgfVxuXG4gICAgICAvKiB3cmFwIHRoZSBQR04gb3V0cHV0IGF0IG1heF93aWR0aCAqL1xuICAgICAgdmFyIGN1cnJlbnRfd2lkdGggPSAwXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjdXJyZW50X3dpZHRoICsgbW92ZXNbaV0ubGVuZ3RoID4gbWF4X3dpZHRoKSB7XG4gICAgICAgICAgaWYgKG1vdmVzW2ldLmluY2x1ZGVzKCd7JykpIHtcbiAgICAgICAgICAgIGN1cnJlbnRfd2lkdGggPSB3cmFwX2NvbW1lbnQoY3VycmVudF93aWR0aCwgbW92ZXNbaV0pXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKiBpZiB0aGUgY3VycmVudCBtb3ZlIHdpbGwgcHVzaCBwYXN0IG1heF93aWR0aCAqL1xuICAgICAgICBpZiAoY3VycmVudF93aWR0aCArIG1vdmVzW2ldLmxlbmd0aCA+IG1heF93aWR0aCAmJiBpICE9PSAwKSB7XG4gICAgICAgICAgLyogZG9uJ3QgZW5kIHRoZSBsaW5lIHdpdGggd2hpdGVzcGFjZSAqL1xuICAgICAgICAgIGlmIChyZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSAnICcpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wb3AoKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc3VsdC5wdXNoKG5ld2xpbmUpXG4gICAgICAgICAgY3VycmVudF93aWR0aCA9IDBcbiAgICAgICAgfSBlbHNlIGlmIChpICE9PSAwKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goJyAnKVxuICAgICAgICAgIGN1cnJlbnRfd2lkdGgrK1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdC5wdXNoKG1vdmVzW2ldKVxuICAgICAgICBjdXJyZW50X3dpZHRoICs9IG1vdmVzW2ldLmxlbmd0aFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0LmpvaW4oJycpXG4gICAgfSxcblxuICAgIGxvYWRfcGduOiBmdW5jdGlvbiAocGduLCBvcHRpb25zKSB7XG4gICAgICAvLyBhbGxvdyB0aGUgdXNlciB0byBzcGVjaWZ5IHRoZSBzbG9wcHkgbW92ZSBwYXJzZXIgdG8gd29yayBhcm91bmQgb3ZlclxuICAgICAgLy8gZGlzYW1iaWd1YXRpb24gYnVncyBpbiBGcml0eiBhbmQgQ2hlc3NiYXNlXG4gICAgICB2YXIgc2xvcHB5ID1cbiAgICAgICAgdHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdzbG9wcHknIGluIG9wdGlvbnNcbiAgICAgICAgICA/IG9wdGlvbnMuc2xvcHB5XG4gICAgICAgICAgOiBmYWxzZVxuXG4gICAgICBmdW5jdGlvbiBtYXNrKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFwnKVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYXNfa2V5cyhvYmplY3QpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHBhcnNlX3Bnbl9oZWFkZXIoaGVhZGVyLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBuZXdsaW5lX2NoYXIgPVxuICAgICAgICAgIHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgIHR5cGVvZiBvcHRpb25zLm5ld2xpbmVfY2hhciA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgID8gb3B0aW9ucy5uZXdsaW5lX2NoYXJcbiAgICAgICAgICAgIDogJ1xccj9cXG4nXG4gICAgICAgIHZhciBoZWFkZXJfb2JqID0ge31cbiAgICAgICAgdmFyIGhlYWRlcnMgPSBoZWFkZXIuc3BsaXQobmV3IFJlZ0V4cChtYXNrKG5ld2xpbmVfY2hhcikpKVxuICAgICAgICB2YXIga2V5ID0gJydcbiAgICAgICAgdmFyIHZhbHVlID0gJydcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhlYWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBrZXkgPSBoZWFkZXJzW2ldLnJlcGxhY2UoL15cXFsoW0EtWl1bQS1aYS16XSopXFxzLipcXF0kLywgJyQxJylcbiAgICAgICAgICB2YWx1ZSA9IGhlYWRlcnNbaV0ucmVwbGFjZSgvXlxcW1tBLVphLXpdK1xcc1wiKC4qKVwiXFwgKlxcXSQvLCAnJDEnKVxuICAgICAgICAgIGlmICh0cmltKGtleSkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGVhZGVyX29ialtrZXldID0gdmFsdWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGVhZGVyX29ialxuICAgICAgfVxuXG4gICAgICB2YXIgbmV3bGluZV9jaGFyID1cbiAgICAgICAgdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvcHRpb25zLm5ld2xpbmVfY2hhciA9PT0gJ3N0cmluZydcbiAgICAgICAgICA/IG9wdGlvbnMubmV3bGluZV9jaGFyXG4gICAgICAgICAgOiAnXFxyP1xcbidcblxuICAgICAgLy8gUmVnRXhwIHRvIHNwbGl0IGhlYWRlci4gVGFrZXMgYWR2YW50YWdlIG9mIHRoZSBmYWN0IHRoYXQgaGVhZGVyIGFuZCBtb3ZldGV4dFxuICAgICAgLy8gd2lsbCBhbHdheXMgaGF2ZSBhIGJsYW5rIGxpbmUgYmV0d2VlbiB0aGVtIChpZSwgdHdvIG5ld2xpbmVfY2hhcidzKS5cbiAgICAgIC8vIFdpdGggZGVmYXVsdCBuZXdsaW5lX2NoYXIsIHdpbGwgZXF1YWw6IC9eKFxcWygoPzpcXHI/XFxuKXwuKSpcXF0pKD86XFxyP1xcbil7Mn0vXG4gICAgICB2YXIgaGVhZGVyX3JlZ2V4ID0gbmV3IFJlZ0V4cChcbiAgICAgICAgJ14oXFxcXFsoKD86JyArXG4gICAgICAgICAgbWFzayhuZXdsaW5lX2NoYXIpICtcbiAgICAgICAgICAnKXwuKSpcXFxcXSknICtcbiAgICAgICAgICAnKD86JyArXG4gICAgICAgICAgbWFzayhuZXdsaW5lX2NoYXIpICtcbiAgICAgICAgICAnKXsyfSdcbiAgICAgIClcblxuICAgICAgLy8gSWYgbm8gaGVhZGVyIGdpdmVuLCBiZWdpbiB3aXRoIG1vdmVzLlxuICAgICAgdmFyIGhlYWRlcl9zdHJpbmcgPSBoZWFkZXJfcmVnZXgudGVzdChwZ24pXG4gICAgICAgID8gaGVhZGVyX3JlZ2V4LmV4ZWMocGduKVsxXVxuICAgICAgICA6ICcnXG5cbiAgICAgIC8vIFB1dCB0aGUgYm9hcmQgaW4gdGhlIHN0YXJ0aW5nIHBvc2l0aW9uXG4gICAgICByZXNldCgpXG5cbiAgICAgIC8qIHBhcnNlIFBHTiBoZWFkZXIgKi9cbiAgICAgIHZhciBoZWFkZXJzID0gcGFyc2VfcGduX2hlYWRlcihoZWFkZXJfc3RyaW5nLCBvcHRpb25zKVxuICAgICAgZm9yICh2YXIga2V5IGluIGhlYWRlcnMpIHtcbiAgICAgICAgc2V0X2hlYWRlcihba2V5LCBoZWFkZXJzW2tleV1dKVxuICAgICAgfVxuXG4gICAgICAvKiBsb2FkIHRoZSBzdGFydGluZyBwb3NpdGlvbiBpbmRpY2F0ZWQgYnkgW1NldHVwICcxJ10gYW5kXG4gICAgICAgKiBbRkVOIHBvc2l0aW9uXSAqL1xuICAgICAgaWYgKGhlYWRlcnNbJ1NldFVwJ10gPT09ICcxJykge1xuICAgICAgICBpZiAoISgnRkVOJyBpbiBoZWFkZXJzICYmIGxvYWQoaGVhZGVyc1snRkVOJ10sIHRydWUpKSkge1xuICAgICAgICAgIC8vIHNlY29uZCBhcmd1bWVudCB0byBsb2FkOiBkb24ndCBjbGVhciB0aGUgaGVhZGVyc1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qIE5COiB0aGUgcmVnZXhlcyBiZWxvdyB0aGF0IGRlbGV0ZSBtb3ZlIG51bWJlcnMsIHJlY3Vyc2l2ZVxuICAgICAgICogYW5ub3RhdGlvbnMsIGFuZCBudW1lcmljIGFubm90YXRpb24gZ2x5cGhzIG1heSBhbHNvIG1hdGNoXG4gICAgICAgKiB0ZXh0IGluIGNvbW1lbnRzLiBUbyBwcmV2ZW50IHRoaXMsIHdlIHRyYW5zZm9ybSBjb21tZW50c1xuICAgICAgICogYnkgaGV4LWVuY29kaW5nIHRoZW0gaW4gcGxhY2UgYW5kIGRlY29kaW5nIHRoZW0gYWdhaW4gYWZ0ZXJcbiAgICAgICAqIHRoZSBvdGhlciB0b2tlbnMgaGF2ZSBiZWVuIGRlbGV0ZWQuXG4gICAgICAgKlxuICAgICAgICogV2hpbGUgdGhlIHNwZWMgc3RhdGVzIHRoYXQgUEdOIGZpbGVzIHNob3VsZCBiZSBBU0NJSSBlbmNvZGVkLFxuICAgICAgICogd2UgdXNlIHtlbixkZX1jb2RlVVJJQ29tcG9uZW50IGhlcmUgdG8gc3VwcG9ydCBhcmJpdHJhcnkgVVRGOFxuICAgICAgICogYXMgYSBjb252ZW5pZW5jZSBmb3IgbW9kZXJuIHVzZXJzICovXG5cbiAgICAgIHZhciB0b19oZXggPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHN0cmluZylcbiAgICAgICAgICAubWFwKGZ1bmN0aW9uIChjKSB7XG4gICAgICAgICAgICAvKiBlbmNvZGVVUkkgZG9lc24ndCB0cmFuc2Zvcm0gbW9zdCBBU0NJSSBjaGFyYWN0ZXJzLFxuICAgICAgICAgICAgICogc28gd2UgaGFuZGxlIHRoZXNlIG91cnNlbHZlcyAqL1xuICAgICAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKSA8IDEyOFxuICAgICAgICAgICAgICA/IGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNilcbiAgICAgICAgICAgICAgOiBlbmNvZGVVUklDb21wb25lbnQoYykucmVwbGFjZSgvXFwlL2csICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuam9pbignJylcbiAgICAgIH1cblxuICAgICAgdmFyIGZyb21faGV4ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gc3RyaW5nLmxlbmd0aCA9PSAwXG4gICAgICAgICAgPyAnJ1xuICAgICAgICAgIDogZGVjb2RlVVJJQ29tcG9uZW50KCclJyArIHN0cmluZy5tYXRjaCgvLnsxLDJ9L2cpLmpvaW4oJyUnKSlcbiAgICAgIH1cblxuICAgICAgdmFyIGVuY29kZV9jb21tZW50ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShuZXcgUmVnRXhwKG1hc2sobmV3bGluZV9jaGFyKSwgJ2cnKSwgJyAnKVxuICAgICAgICByZXR1cm4gYHske3RvX2hleChzdHJpbmcuc2xpY2UoMSwgc3RyaW5nLmxlbmd0aCAtIDEpKX19YFxuICAgICAgfVxuXG4gICAgICB2YXIgZGVjb2RlX2NvbW1lbnQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGlmIChzdHJpbmcuc3RhcnRzV2l0aCgneycpICYmIHN0cmluZy5lbmRzV2l0aCgnfScpKSB7XG4gICAgICAgICAgcmV0dXJuIGZyb21faGV4KHN0cmluZy5zbGljZSgxLCBzdHJpbmcubGVuZ3RoIC0gMSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyogZGVsZXRlIGhlYWRlciB0byBnZXQgdGhlIG1vdmVzICovXG4gICAgICB2YXIgbXMgPSBwZ25cbiAgICAgICAgLnJlcGxhY2UoaGVhZGVyX3N0cmluZywgJycpXG4gICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgIC8qIGVuY29kZSBjb21tZW50cyBzbyB0aGV5IGRvbid0IGdldCBkZWxldGVkIGJlbG93ICovXG4gICAgICAgICAgbmV3IFJlZ0V4cChgKFxce1tefV0qXFx9KSs/fDsoW14ke21hc2sobmV3bGluZV9jaGFyKX1dKilgLCAnZycpLFxuICAgICAgICAgIGZ1bmN0aW9uIChtYXRjaCwgYnJhY2tldCwgc2VtaWNvbG9uKSB7XG4gICAgICAgICAgICByZXR1cm4gYnJhY2tldCAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgID8gZW5jb2RlX2NvbW1lbnQoYnJhY2tldClcbiAgICAgICAgICAgICAgOiAnICcgKyBlbmNvZGVfY29tbWVudChgeyR7c2VtaWNvbG9uLnNsaWNlKDEpfX1gKVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKG1hc2sobmV3bGluZV9jaGFyKSwgJ2cnKSwgJyAnKVxuXG4gICAgICAvKiBkZWxldGUgcmVjdXJzaXZlIGFubm90YXRpb24gdmFyaWF0aW9ucyAqL1xuICAgICAgdmFyIHJhdl9yZWdleCA9IC8oXFwoW15cXChcXCldK1xcKSkrPy9nXG4gICAgICB3aGlsZSAocmF2X3JlZ2V4LnRlc3QobXMpKSB7XG4gICAgICAgIG1zID0gbXMucmVwbGFjZShyYXZfcmVnZXgsICcnKVxuICAgICAgfVxuXG4gICAgICAvKiBkZWxldGUgbW92ZSBudW1iZXJzICovXG4gICAgICBtcyA9IG1zLnJlcGxhY2UoL1xcZCtcXC4oXFwuXFwuKT8vZywgJycpXG5cbiAgICAgIC8qIGRlbGV0ZSAuLi4gaW5kaWNhdGluZyBibGFjayB0byBtb3ZlICovXG4gICAgICBtcyA9IG1zLnJlcGxhY2UoL1xcLlxcLlxcLi9nLCAnJylcblxuICAgICAgLyogZGVsZXRlIG51bWVyaWMgYW5ub3RhdGlvbiBnbHlwaHMgKi9cbiAgICAgIG1zID0gbXMucmVwbGFjZSgvXFwkXFxkKy9nLCAnJylcblxuICAgICAgLyogdHJpbSBhbmQgZ2V0IGFycmF5IG9mIG1vdmVzICovXG4gICAgICB2YXIgbW92ZXMgPSB0cmltKG1zKS5zcGxpdChuZXcgUmVnRXhwKC9cXHMrLykpXG5cbiAgICAgIC8qIGRlbGV0ZSBlbXB0eSBlbnRyaWVzICovXG4gICAgICBtb3ZlcyA9IG1vdmVzLmpvaW4oJywnKS5yZXBsYWNlKC8sLCsvZywgJywnKS5zcGxpdCgnLCcpXG4gICAgICB2YXIgbW92ZSA9ICcnXG5cbiAgICAgIHZhciByZXN1bHQgPSAnJ1xuXG4gICAgICBmb3IgKHZhciBoYWxmX21vdmUgPSAwOyBoYWxmX21vdmUgPCBtb3Zlcy5sZW5ndGg7IGhhbGZfbW92ZSsrKSB7XG4gICAgICAgIHZhciBjb21tZW50ID0gZGVjb2RlX2NvbW1lbnQobW92ZXNbaGFsZl9tb3ZlXSlcbiAgICAgICAgaWYgKGNvbW1lbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbW1lbnRzW2dlbmVyYXRlX2ZlbigpXSA9IGNvbW1lbnRcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgbW92ZSA9IG1vdmVfZnJvbV9zYW4obW92ZXNbaGFsZl9tb3ZlXSwgc2xvcHB5KVxuXG4gICAgICAgIC8qIGludmFsaWQgbW92ZSAqL1xuICAgICAgICBpZiAobW92ZSA9PSBudWxsKSB7XG4gICAgICAgICAgLyogd2FzIHRoZSBtb3ZlIGFuIGVuZCBvZiBnYW1lIG1hcmtlciAqL1xuICAgICAgICAgIGlmIChURVJNSU5BVElPTl9NQVJLRVJTLmluZGV4T2YobW92ZXNbaGFsZl9tb3ZlXSkgPiAtMSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gbW92ZXNbaGFsZl9tb3ZlXVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLyogcmVzZXQgdGhlIGVuZCBvZiBnYW1lIG1hcmtlciBpZiBtYWtpbmcgYSB2YWxpZCBtb3ZlICovXG4gICAgICAgICAgcmVzdWx0ID0gJydcbiAgICAgICAgICBtYWtlX21vdmUobW92ZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKiBQZXIgc2VjdGlvbiA4LjIuNiBvZiB0aGUgUEdOIHNwZWMsIHRoZSBSZXN1bHQgdGFnIHBhaXIgbXVzdCBtYXRjaFxuICAgICAgICogbWF0Y2ggdGhlIHRlcm1pbmF0aW9uIG1hcmtlci4gT25seSBkbyB0aGlzIHdoZW4gaGVhZGVycyBhcmUgcHJlc2VudCxcbiAgICAgICAqIGJ1dCB0aGUgcmVzdWx0IHRhZyBpcyBtaXNzaW5nXG4gICAgICAgKi9cbiAgICAgIGlmIChyZXN1bHQgJiYgT2JqZWN0LmtleXMoaGVhZGVyKS5sZW5ndGggJiYgIWhlYWRlclsnUmVzdWx0J10pIHtcbiAgICAgICAgc2V0X2hlYWRlcihbJ1Jlc3VsdCcsIHJlc3VsdF0pXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcblxuICAgIGhlYWRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHNldF9oZWFkZXIoYXJndW1lbnRzKVxuICAgIH0sXG5cbiAgICBhc2NpaTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGFzY2lpKClcbiAgICB9LFxuXG4gICAgdHVybjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHR1cm5cbiAgICB9LFxuXG4gICAgbW92ZTogZnVuY3Rpb24gKG1vdmUsIG9wdGlvbnMpIHtcbiAgICAgIC8qIFRoZSBtb3ZlIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgd2l0aCBpbiB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnM6XG4gICAgICAgKlxuICAgICAgICogLm1vdmUoJ054YjcnKSAgICAgIDwtIHdoZXJlICdtb3ZlJyBpcyBhIGNhc2Utc2Vuc2l0aXZlIFNBTiBzdHJpbmdcbiAgICAgICAqXG4gICAgICAgKiAubW92ZSh7IGZyb206ICdoNycsIDwtIHdoZXJlIHRoZSAnbW92ZScgaXMgYSBtb3ZlIG9iamVjdCAoYWRkaXRpb25hbFxuICAgICAgICogICAgICAgICB0byA6J2g4JywgICAgICBmaWVsZHMgYXJlIGlnbm9yZWQpXG4gICAgICAgKiAgICAgICAgIHByb21vdGlvbjogJ3EnLFxuICAgICAgICogICAgICB9KVxuICAgICAgICovXG5cbiAgICAgIC8vIGFsbG93IHRoZSB1c2VyIHRvIHNwZWNpZnkgdGhlIHNsb3BweSBtb3ZlIHBhcnNlciB0byB3b3JrIGFyb3VuZCBvdmVyXG4gICAgICAvLyBkaXNhbWJpZ3VhdGlvbiBidWdzIGluIEZyaXR6IGFuZCBDaGVzc2Jhc2VcbiAgICAgIHZhciBzbG9wcHkgPVxuICAgICAgICB0eXBlb2Ygb3B0aW9ucyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ3Nsb3BweScgaW4gb3B0aW9uc1xuICAgICAgICAgID8gb3B0aW9ucy5zbG9wcHlcbiAgICAgICAgICA6IGZhbHNlXG5cbiAgICAgIHZhciBtb3ZlX29iaiA9IG51bGxcblxuICAgICAgaWYgKHR5cGVvZiBtb3ZlID09PSAnc3RyaW5nJykge1xuICAgICAgICBtb3ZlX29iaiA9IG1vdmVfZnJvbV9zYW4obW92ZSwgc2xvcHB5KVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbW92ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdmFyIG1vdmVzID0gZ2VuZXJhdGVfbW92ZXMoKVxuXG4gICAgICAgIC8qIGNvbnZlcnQgdGhlIHByZXR0eSBtb3ZlIG9iamVjdCB0byBhbiB1Z2x5IG1vdmUgb2JqZWN0ICovXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBtb3Zlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIG1vdmUuZnJvbSA9PT0gYWxnZWJyYWljKG1vdmVzW2ldLmZyb20pICYmXG4gICAgICAgICAgICBtb3ZlLnRvID09PSBhbGdlYnJhaWMobW92ZXNbaV0udG8pICYmXG4gICAgICAgICAgICAoISgncHJvbW90aW9uJyBpbiBtb3Zlc1tpXSkgfHxcbiAgICAgICAgICAgICAgbW92ZS5wcm9tb3Rpb24gPT09IG1vdmVzW2ldLnByb21vdGlvbilcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIG1vdmVfb2JqID0gbW92ZXNbaV1cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qIGZhaWxlZCB0byBmaW5kIG1vdmUgKi9cbiAgICAgIGlmICghbW92ZV9vYmopIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cblxuICAgICAgLyogbmVlZCB0byBtYWtlIGEgY29weSBvZiBtb3ZlIGJlY2F1c2Ugd2UgY2FuJ3QgZ2VuZXJhdGUgU0FOIGFmdGVyIHRoZVxuICAgICAgICogbW92ZSBpcyBtYWRlXG4gICAgICAgKi9cbiAgICAgIHZhciBwcmV0dHlfbW92ZSA9IG1ha2VfcHJldHR5KG1vdmVfb2JqKVxuXG4gICAgICBtYWtlX21vdmUobW92ZV9vYmopXG5cbiAgICAgIHJldHVybiBwcmV0dHlfbW92ZVxuICAgIH0sXG5cbiAgICB1bmRvOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbW92ZSA9IHVuZG9fbW92ZSgpXG4gICAgICByZXR1cm4gbW92ZSA/IG1ha2VfcHJldHR5KG1vdmUpIDogbnVsbFxuICAgIH0sXG5cbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGNsZWFyKClcbiAgICB9LFxuXG4gICAgcHV0OiBmdW5jdGlvbiAocGllY2UsIHNxdWFyZSkge1xuICAgICAgcmV0dXJuIHB1dChwaWVjZSwgc3F1YXJlKVxuICAgIH0sXG5cbiAgICBnZXQ6IGZ1bmN0aW9uIChzcXVhcmUpIHtcbiAgICAgIHJldHVybiBnZXQoc3F1YXJlKVxuICAgIH0sXG5cbiAgICByZW1vdmU6IGZ1bmN0aW9uIChzcXVhcmUpIHtcbiAgICAgIHJldHVybiByZW1vdmUoc3F1YXJlKVxuICAgIH0sXG5cbiAgICBwZXJmdDogZnVuY3Rpb24gKGRlcHRoKSB7XG4gICAgICByZXR1cm4gcGVyZnQoZGVwdGgpXG4gICAgfSxcblxuICAgIHNxdWFyZV9jb2xvcjogZnVuY3Rpb24gKHNxdWFyZSkge1xuICAgICAgaWYgKHNxdWFyZSBpbiBTUVVBUkVTKSB7XG4gICAgICAgIHZhciBzcV8weDg4ID0gU1FVQVJFU1tzcXVhcmVdXG4gICAgICAgIHJldHVybiAocmFuayhzcV8weDg4KSArIGZpbGUoc3FfMHg4OCkpICUgMiA9PT0gMCA/ICdsaWdodCcgOiAnZGFyaydcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGxcbiAgICB9LFxuXG4gICAgaGlzdG9yeTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIHZhciByZXZlcnNlZF9oaXN0b3J5ID0gW11cbiAgICAgIHZhciBtb3ZlX2hpc3RvcnkgPSBbXVxuICAgICAgdmFyIHZlcmJvc2UgPVxuICAgICAgICB0eXBlb2Ygb3B0aW9ucyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgJ3ZlcmJvc2UnIGluIG9wdGlvbnMgJiZcbiAgICAgICAgb3B0aW9ucy52ZXJib3NlXG5cbiAgICAgIHdoaWxlIChoaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV2ZXJzZWRfaGlzdG9yeS5wdXNoKHVuZG9fbW92ZSgpKVxuICAgICAgfVxuXG4gICAgICB3aGlsZSAocmV2ZXJzZWRfaGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBtb3ZlID0gcmV2ZXJzZWRfaGlzdG9yeS5wb3AoKVxuICAgICAgICBpZiAodmVyYm9zZSkge1xuICAgICAgICAgIG1vdmVfaGlzdG9yeS5wdXNoKG1ha2VfcHJldHR5KG1vdmUpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1vdmVfaGlzdG9yeS5wdXNoKG1vdmVfdG9fc2FuKG1vdmUsIGdlbmVyYXRlX21vdmVzKHsgbGVnYWw6IHRydWUgfSkpKVxuICAgICAgICB9XG4gICAgICAgIG1ha2VfbW92ZShtb3ZlKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbW92ZV9oaXN0b3J5XG4gICAgfSxcblxuICAgIGdldF9jb21tZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gY29tbWVudHNbZ2VuZXJhdGVfZmVuKCldXG4gICAgfSxcblxuICAgIHNldF9jb21tZW50OiBmdW5jdGlvbiAoY29tbWVudCkge1xuICAgICAgY29tbWVudHNbZ2VuZXJhdGVfZmVuKCldID0gY29tbWVudC5yZXBsYWNlKCd7JywgJ1snKS5yZXBsYWNlKCd9JywgJ10nKVxuICAgIH0sXG5cbiAgICBkZWxldGVfY29tbWVudDogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbW1lbnQgPSBjb21tZW50c1tnZW5lcmF0ZV9mZW4oKV1cbiAgICAgIGRlbGV0ZSBjb21tZW50c1tnZW5lcmF0ZV9mZW4oKV1cbiAgICAgIHJldHVybiBjb21tZW50XG4gICAgfSxcblxuICAgIGdldF9jb21tZW50czogZnVuY3Rpb24gKCkge1xuICAgICAgcHJ1bmVfY29tbWVudHMoKVxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGNvbW1lbnRzKS5tYXAoZnVuY3Rpb24gKGZlbikge1xuICAgICAgICByZXR1cm4geyBmZW46IGZlbiwgY29tbWVudDogY29tbWVudHNbZmVuXSB9XG4gICAgICB9KVxuICAgIH0sXG5cbiAgICBkZWxldGVfY29tbWVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHBydW5lX2NvbW1lbnRzKClcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhjb21tZW50cykubWFwKGZ1bmN0aW9uIChmZW4pIHtcbiAgICAgICAgdmFyIGNvbW1lbnQgPSBjb21tZW50c1tmZW5dXG4gICAgICAgIGRlbGV0ZSBjb21tZW50c1tmZW5dXG4gICAgICAgIHJldHVybiB7IGZlbjogZmVuLCBjb21tZW50OiBjb21tZW50IH1cbiAgICAgIH0pXG4gICAgfSxcbiAgfVxufVxuXG4vKiBleHBvcnQgQ2hlc3Mgb2JqZWN0IGlmIHVzaW5nIG5vZGUgb3IgYW55IG90aGVyIENvbW1vbkpTIGNvbXBhdGlibGVcbiAqIGVudmlyb25tZW50ICovXG5pZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSBleHBvcnRzLkNoZXNzID0gQ2hlc3Ncbi8qIGV4cG9ydCBDaGVzcyBvYmplY3QgZm9yIGFueSBSZXF1aXJlSlMgY29tcGF0aWJsZSBlbnZpcm9ubWVudCAqL1xuaWYgKHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnKVxuICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBDaGVzc1xuICB9KVxuIiwiZXhwb3J0IGNvbnN0IGNvbG9ycyA9IFsnd2hpdGUnLCAnYmxhY2snXTtcbmV4cG9ydCBjb25zdCBmaWxlcyA9IFsnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnLCAnZycsICdoJ107XG5leHBvcnQgY29uc3QgcmFua3MgPSBbJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCddO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHlwZXMuanMubWFwIiwiaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcy5qcyc7XG5leHBvcnQgY29uc3QgaW52UmFua3MgPSBbLi4uY2cucmFua3NdLnJldmVyc2UoKTtcbmV4cG9ydCBjb25zdCBhbGxLZXlzID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdCguLi5jZy5maWxlcy5tYXAoYyA9PiBjZy5yYW5rcy5tYXAociA9PiBjICsgcikpKTtcbmV4cG9ydCBjb25zdCBwb3Mya2V5ID0gKHBvcykgPT4gYWxsS2V5c1s4ICogcG9zWzBdICsgcG9zWzFdXTtcbmV4cG9ydCBjb25zdCBrZXkycG9zID0gKGspID0+IFtrLmNoYXJDb2RlQXQoMCkgLSA5Nywgay5jaGFyQ29kZUF0KDEpIC0gNDldO1xuZXhwb3J0IGNvbnN0IGFsbFBvcyA9IGFsbEtleXMubWFwKGtleTJwb3MpO1xuZXhwb3J0IGZ1bmN0aW9uIG1lbW8oZikge1xuICAgIGxldCB2O1xuICAgIGNvbnN0IHJldCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHYgPSBmKCk7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH07XG4gICAgcmV0LmNsZWFyID0gKCkgPT4ge1xuICAgICAgICB2ID0gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgcmV0dXJuIHJldDtcbn1cbmV4cG9ydCBjb25zdCB0aW1lciA9ICgpID0+IHtcbiAgICBsZXQgc3RhcnRBdDtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydCgpIHtcbiAgICAgICAgICAgIHN0YXJ0QXQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2FuY2VsKCkge1xuICAgICAgICAgICAgc3RhcnRBdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgc3RvcCgpIHtcbiAgICAgICAgICAgIGlmICghc3RhcnRBdClcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIGNvbnN0IHRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0QXQ7XG4gICAgICAgICAgICBzdGFydEF0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmV0dXJuIHRpbWU7XG4gICAgICAgIH0sXG4gICAgfTtcbn07XG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYykgPT4gKGMgPT09ICd3aGl0ZScgPyAnYmxhY2snIDogJ3doaXRlJyk7XG5leHBvcnQgY29uc3QgZGlzdGFuY2VTcSA9IChwb3MxLCBwb3MyKSA9PiB7XG4gICAgY29uc3QgZHggPSBwb3MxWzBdIC0gcG9zMlswXSwgZHkgPSBwb3MxWzFdIC0gcG9zMlsxXTtcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG59O1xuZXhwb3J0IGNvbnN0IHNhbWVQaWVjZSA9IChwMSwgcDIpID0+IHAxLnJvbGUgPT09IHAyLnJvbGUgJiYgcDEuY29sb3IgPT09IHAyLmNvbG9yO1xuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlID0gKGJvdW5kcykgPT4gKHBvcywgYXNXaGl0ZSkgPT4gWygoYXNXaGl0ZSA/IHBvc1swXSA6IDcgLSBwb3NbMF0pICogYm91bmRzLndpZHRoKSAvIDgsICgoYXNXaGl0ZSA/IDcgLSBwb3NbMV0gOiBwb3NbMV0pICogYm91bmRzLmhlaWdodCkgLyA4XTtcbmV4cG9ydCBjb25zdCB0cmFuc2xhdGUgPSAoZWwsIHBvcykgPT4ge1xuICAgIGVsLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtwb3NbMF19cHgsJHtwb3NbMV19cHgpYDtcbn07XG5leHBvcnQgY29uc3QgdHJhbnNsYXRlQW5kU2NhbGUgPSAoZWwsIHBvcywgc2NhbGUgPSAxKSA9PiB7XG4gICAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3Bvc1swXX1weCwke3Bvc1sxXX1weCkgc2NhbGUoJHtzY2FsZX0pYDtcbn07XG5leHBvcnQgY29uc3Qgc2V0VmlzaWJsZSA9IChlbCwgdikgPT4ge1xuICAgIGVsLnN0eWxlLnZpc2liaWxpdHkgPSB2ID8gJ3Zpc2libGUnIDogJ2hpZGRlbic7XG59O1xuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb24gPSAoZSkgPT4ge1xuICAgIHZhciBfYTtcbiAgICBpZiAoZS5jbGllbnRYIHx8IGUuY2xpZW50WCA9PT0gMClcbiAgICAgICAgcmV0dXJuIFtlLmNsaWVudFgsIGUuY2xpZW50WV07XG4gICAgaWYgKChfYSA9IGUudGFyZ2V0VG91Y2hlcykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hWzBdKVxuICAgICAgICByZXR1cm4gW2UudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYLCBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WV07XG4gICAgcmV0dXJuOyAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb24hXG59O1xuZXhwb3J0IGNvbnN0IGlzUmlnaHRCdXR0b24gPSAoZSkgPT4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUVsID0gKHRhZ05hbWUsIGNsYXNzTmFtZSkgPT4ge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbiAgICBpZiAoY2xhc3NOYW1lKVxuICAgICAgICBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gICAgcmV0dXJuIGVsO1xufTtcbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlU3F1YXJlQ2VudGVyKGtleSwgYXNXaGl0ZSwgYm91bmRzKSB7XG4gICAgY29uc3QgcG9zID0ga2V5MnBvcyhrZXkpO1xuICAgIGlmICghYXNXaGl0ZSkge1xuICAgICAgICBwb3NbMF0gPSA3IC0gcG9zWzBdO1xuICAgICAgICBwb3NbMV0gPSA3IC0gcG9zWzFdO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgICBib3VuZHMubGVmdCArIChib3VuZHMud2lkdGggKiBwb3NbMF0pIC8gOCArIGJvdW5kcy53aWR0aCAvIDE2LFxuICAgICAgICBib3VuZHMudG9wICsgKGJvdW5kcy5oZWlnaHQgKiAoNyAtIHBvc1sxXSkpIC8gOCArIGJvdW5kcy5oZWlnaHQgLyAxNixcbiAgICBdO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbC5qcy5tYXAiLCJpbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XG5mdW5jdGlvbiBkaWZmKGEsIGIpIHtcbiAgICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpO1xufVxuZnVuY3Rpb24gcGF3bihjb2xvcikge1xuICAgIHJldHVybiAoeDEsIHkxLCB4MiwgeTIpID0+IGRpZmYoeDEsIHgyKSA8IDIgJiZcbiAgICAgICAgKGNvbG9yID09PSAnd2hpdGUnXG4gICAgICAgICAgICA/IC8vIGFsbG93IDIgc3F1YXJlcyBmcm9tIGZpcnN0IHR3byByYW5rcywgZm9yIGhvcmRlXG4gICAgICAgICAgICAgICAgeTIgPT09IHkxICsgMSB8fCAoeTEgPD0gMSAmJiB5MiA9PT0geTEgKyAyICYmIHgxID09PSB4MilcbiAgICAgICAgICAgIDogeTIgPT09IHkxIC0gMSB8fCAoeTEgPj0gNiAmJiB5MiA9PT0geTEgLSAyICYmIHgxID09PSB4MikpO1xufVxuZXhwb3J0IGNvbnN0IGtuaWdodCA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICAgIGNvbnN0IHhkID0gZGlmZih4MSwgeDIpO1xuICAgIGNvbnN0IHlkID0gZGlmZih5MSwgeTIpO1xuICAgIHJldHVybiAoeGQgPT09IDEgJiYgeWQgPT09IDIpIHx8ICh4ZCA9PT0gMiAmJiB5ZCA9PT0gMSk7XG59O1xuY29uc3QgYmlzaG9wID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gICAgcmV0dXJuIGRpZmYoeDEsIHgyKSA9PT0gZGlmZih5MSwgeTIpO1xufTtcbmNvbnN0IHJvb2sgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgICByZXR1cm4geDEgPT09IHgyIHx8IHkxID09PSB5Mjtcbn07XG5leHBvcnQgY29uc3QgcXVlZW4gPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgICByZXR1cm4gYmlzaG9wKHgxLCB5MSwgeDIsIHkyKSB8fCByb29rKHgxLCB5MSwgeDIsIHkyKTtcbn07XG5mdW5jdGlvbiBraW5nKGNvbG9yLCByb29rRmlsZXMsIGNhbkNhc3RsZSkge1xuICAgIHJldHVybiAoeDEsIHkxLCB4MiwgeTIpID0+IChkaWZmKHgxLCB4MikgPCAyICYmIGRpZmYoeTEsIHkyKSA8IDIpIHx8XG4gICAgICAgIChjYW5DYXN0bGUgJiZcbiAgICAgICAgICAgIHkxID09PSB5MiAmJlxuICAgICAgICAgICAgeTEgPT09IChjb2xvciA9PT0gJ3doaXRlJyA/IDAgOiA3KSAmJlxuICAgICAgICAgICAgKCh4MSA9PT0gNCAmJiAoKHgyID09PSAyICYmIHJvb2tGaWxlcy5pbmNsdWRlcygwKSkgfHwgKHgyID09PSA2ICYmIHJvb2tGaWxlcy5pbmNsdWRlcyg3KSkpKSB8fFxuICAgICAgICAgICAgICAgIHJvb2tGaWxlcy5pbmNsdWRlcyh4MikpKTtcbn1cbmZ1bmN0aW9uIHJvb2tGaWxlc09mKHBpZWNlcywgY29sb3IpIHtcbiAgICBjb25zdCBiYWNrcmFuayA9IGNvbG9yID09PSAnd2hpdGUnID8gJzEnIDogJzgnO1xuICAgIGNvbnN0IGZpbGVzID0gW107XG4gICAgZm9yIChjb25zdCBba2V5LCBwaWVjZV0gb2YgcGllY2VzKSB7XG4gICAgICAgIGlmIChrZXlbMV0gPT09IGJhY2tyYW5rICYmIHBpZWNlLmNvbG9yID09PSBjb2xvciAmJiBwaWVjZS5yb2xlID09PSAncm9vaycpIHtcbiAgICAgICAgICAgIGZpbGVzLnB1c2godXRpbC5rZXkycG9zKGtleSlbMF0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmaWxlcztcbn1cbmV4cG9ydCBmdW5jdGlvbiBwcmVtb3ZlKHBpZWNlcywga2V5LCBjYW5DYXN0bGUpIHtcbiAgICBjb25zdCBwaWVjZSA9IHBpZWNlcy5nZXQoa2V5KTtcbiAgICBpZiAoIXBpZWNlKVxuICAgICAgICByZXR1cm4gW107XG4gICAgY29uc3QgcG9zID0gdXRpbC5rZXkycG9zKGtleSksIHIgPSBwaWVjZS5yb2xlLCBtb2JpbGl0eSA9IHIgPT09ICdwYXduJ1xuICAgICAgICA/IHBhd24ocGllY2UuY29sb3IpXG4gICAgICAgIDogciA9PT0gJ2tuaWdodCdcbiAgICAgICAgICAgID8ga25pZ2h0XG4gICAgICAgICAgICA6IHIgPT09ICdiaXNob3AnXG4gICAgICAgICAgICAgICAgPyBiaXNob3BcbiAgICAgICAgICAgICAgICA6IHIgPT09ICdyb29rJ1xuICAgICAgICAgICAgICAgICAgICA/IHJvb2tcbiAgICAgICAgICAgICAgICAgICAgOiByID09PSAncXVlZW4nXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHF1ZWVuXG4gICAgICAgICAgICAgICAgICAgICAgICA6IGtpbmcocGllY2UuY29sb3IsIHJvb2tGaWxlc09mKHBpZWNlcywgcGllY2UuY29sb3IpLCBjYW5DYXN0bGUpO1xuICAgIHJldHVybiB1dGlsLmFsbFBvc1xuICAgICAgICAuZmlsdGVyKHBvczIgPT4gKHBvc1swXSAhPT0gcG9zMlswXSB8fCBwb3NbMV0gIT09IHBvczJbMV0pICYmIG1vYmlsaXR5KHBvc1swXSwgcG9zWzFdLCBwb3MyWzBdLCBwb3MyWzFdKSlcbiAgICAgICAgLm1hcCh1dGlsLnBvczJrZXkpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJlbW92ZS5qcy5tYXAiLCJpbXBvcnQgeyBwb3Mya2V5LCBrZXkycG9zLCBvcHBvc2l0ZSwgZGlzdGFuY2VTcSwgYWxsUG9zLCBjb21wdXRlU3F1YXJlQ2VudGVyIH0gZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IHByZW1vdmUsIHF1ZWVuLCBrbmlnaHQgfSBmcm9tICcuL3ByZW1vdmUuanMnO1xuZXhwb3J0IGZ1bmN0aW9uIGNhbGxVc2VyRnVuY3Rpb24oZiwgLi4uYXJncykge1xuICAgIGlmIChmKVxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlKSB7XG4gICAgc3RhdGUub3JpZW50YXRpb24gPSBvcHBvc2l0ZShzdGF0ZS5vcmllbnRhdGlvbik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9IHN0YXRlLnNlbGVjdGVkID0gdW5kZWZpbmVkO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0KHN0YXRlKSB7XG4gICAgc3RhdGUubGFzdE1vdmUgPSB1bmRlZmluZWQ7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gICAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRQaWVjZXMoc3RhdGUsIHBpZWNlcykge1xuICAgIGZvciAoY29uc3QgW2tleSwgcGllY2VdIG9mIHBpZWNlcykge1xuICAgICAgICBpZiAocGllY2UpXG4gICAgICAgICAgICBzdGF0ZS5waWVjZXMuc2V0KGtleSwgcGllY2UpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzdGF0ZS5waWVjZXMuZGVsZXRlKGtleSk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNldENoZWNrKHN0YXRlLCBjb2xvcikge1xuICAgIHN0YXRlLmNoZWNrID0gdW5kZWZpbmVkO1xuICAgIGlmIChjb2xvciA9PT0gdHJ1ZSlcbiAgICAgICAgY29sb3IgPSBzdGF0ZS50dXJuQ29sb3I7XG4gICAgaWYgKGNvbG9yKVxuICAgICAgICBmb3IgKGNvbnN0IFtrLCBwXSBvZiBzdGF0ZS5waWVjZXMpIHtcbiAgICAgICAgICAgIGlmIChwLnJvbGUgPT09ICdraW5nJyAmJiBwLmNvbG9yID09PSBjb2xvcikge1xuICAgICAgICAgICAgICAgIHN0YXRlLmNoZWNrID0gaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxufVxuZnVuY3Rpb24gc2V0UHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCwgbWV0YSkge1xuICAgIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gICAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0gW29yaWcsIGRlc3RdO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlbW92YWJsZS5ldmVudHMuc2V0LCBvcmlnLCBkZXN0LCBtZXRhKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZW1vdmUoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgICAgIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy51bnNldCk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0UHJlZHJvcChzdGF0ZSwgcm9sZSwga2V5KSB7XG4gICAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHsgcm9sZSwga2V5IH07XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVkcm9wcGFibGUuZXZlbnRzLnNldCwgcm9sZSwga2V5KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZWRyb3Aoc3RhdGUpIHtcbiAgICBjb25zdCBwZCA9IHN0YXRlLnByZWRyb3BwYWJsZTtcbiAgICBpZiAocGQuY3VycmVudCkge1xuICAgICAgICBwZC5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICBjYWxsVXNlckZ1bmN0aW9uKHBkLmV2ZW50cy51bnNldCk7XG4gICAgfVxufVxuZnVuY3Rpb24gdHJ5QXV0b0Nhc3RsZShzdGF0ZSwgb3JpZywgZGVzdCkge1xuICAgIGlmICghc3RhdGUuYXV0b0Nhc3RsZSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGtpbmcgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICAgIGlmICgha2luZyB8fCBraW5nLnJvbGUgIT09ICdraW5nJylcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IG9yaWdQb3MgPSBrZXkycG9zKG9yaWcpO1xuICAgIGNvbnN0IGRlc3RQb3MgPSBrZXkycG9zKGRlc3QpO1xuICAgIGlmICgob3JpZ1Bvc1sxXSAhPT0gMCAmJiBvcmlnUG9zWzFdICE9PSA3KSB8fCBvcmlnUG9zWzFdICE9PSBkZXN0UG9zWzFdKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYgKG9yaWdQb3NbMF0gPT09IDQgJiYgIXN0YXRlLnBpZWNlcy5oYXMoZGVzdCkpIHtcbiAgICAgICAgaWYgKGRlc3RQb3NbMF0gPT09IDYpXG4gICAgICAgICAgICBkZXN0ID0gcG9zMmtleShbNywgZGVzdFBvc1sxXV0pO1xuICAgICAgICBlbHNlIGlmIChkZXN0UG9zWzBdID09PSAyKVxuICAgICAgICAgICAgZGVzdCA9IHBvczJrZXkoWzAsIGRlc3RQb3NbMV1dKTtcbiAgICB9XG4gICAgY29uc3Qgcm9vayA9IHN0YXRlLnBpZWNlcy5nZXQoZGVzdCk7XG4gICAgaWYgKCFyb29rIHx8IHJvb2suY29sb3IgIT09IGtpbmcuY29sb3IgfHwgcm9vay5yb2xlICE9PSAncm9vaycpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBzdGF0ZS5waWVjZXMuZGVsZXRlKG9yaWcpO1xuICAgIHN0YXRlLnBpZWNlcy5kZWxldGUoZGVzdCk7XG4gICAgaWYgKG9yaWdQb3NbMF0gPCBkZXN0UG9zWzBdKSB7XG4gICAgICAgIHN0YXRlLnBpZWNlcy5zZXQocG9zMmtleShbNiwgZGVzdFBvc1sxXV0pLCBraW5nKTtcbiAgICAgICAgc3RhdGUucGllY2VzLnNldChwb3Mya2V5KFs1LCBkZXN0UG9zWzFdXSksIHJvb2spO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc3RhdGUucGllY2VzLnNldChwb3Mya2V5KFsyLCBkZXN0UG9zWzFdXSksIGtpbmcpO1xuICAgICAgICBzdGF0ZS5waWVjZXMuc2V0KHBvczJrZXkoWzMsIGRlc3RQb3NbMV1dKSwgcm9vayk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSB7XG4gICAgY29uc3Qgb3JpZ1BpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKSwgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzLmdldChkZXN0KTtcbiAgICBpZiAob3JpZyA9PT0gZGVzdCB8fCAhb3JpZ1BpZWNlKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgY2FwdHVyZWQgPSBkZXN0UGllY2UgJiYgZGVzdFBpZWNlLmNvbG9yICE9PSBvcmlnUGllY2UuY29sb3IgPyBkZXN0UGllY2UgOiB1bmRlZmluZWQ7XG4gICAgaWYgKGRlc3QgPT09IHN0YXRlLnNlbGVjdGVkKVxuICAgICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMubW92ZSwgb3JpZywgZGVzdCwgY2FwdHVyZWQpO1xuICAgIGlmICghdHJ5QXV0b0Nhc3RsZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICAgICAgc3RhdGUucGllY2VzLnNldChkZXN0LCBvcmlnUGllY2UpO1xuICAgICAgICBzdGF0ZS5waWVjZXMuZGVsZXRlKG9yaWcpO1xuICAgIH1cbiAgICBzdGF0ZS5sYXN0TW92ZSA9IFtvcmlnLCBkZXN0XTtcbiAgICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICAgIHJldHVybiBjYXB0dXJlZCB8fCB0cnVlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGtleSwgZm9yY2UpIHtcbiAgICBpZiAoc3RhdGUucGllY2VzLmhhcyhrZXkpKSB7XG4gICAgICAgIGlmIChmb3JjZSlcbiAgICAgICAgICAgIHN0YXRlLnBpZWNlcy5kZWxldGUoa2V5KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5kcm9wTmV3UGllY2UsIHBpZWNlLCBrZXkpO1xuICAgIHN0YXRlLnBpZWNlcy5zZXQoa2V5LCBwaWVjZSk7XG4gICAgc3RhdGUubGFzdE1vdmUgPSBba2V5XTtcbiAgICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUudHVybkNvbG9yID0gb3Bwb3NpdGUoc3RhdGUudHVybkNvbG9yKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gICAgICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSB7XG4gICAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCk7XG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGNvbnN0IGhvbGRUaW1lID0gc3RhdGUuaG9sZC5zdG9wKCk7XG4gICAgICAgICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBwcmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjdHJsS2V5OiBzdGF0ZS5zdGF0cy5jdHJsS2V5LFxuICAgICAgICAgICAgICAgIGhvbGRUaW1lLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpXG4gICAgICAgICAgICAgICAgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICAgICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCBtZXRhZGF0YSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChjYW5QcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgICAgICBzZXRQcmVtb3ZlKHN0YXRlLCBvcmlnLCBkZXN0LCB7XG4gICAgICAgICAgICBjdHJsS2V5OiBzdGF0ZS5zdGF0cy5jdHJsS2V5LFxuICAgICAgICB9KTtcbiAgICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgIHJldHVybiBmYWxzZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkcm9wTmV3UGllY2Uoc3RhdGUsIG9yaWcsIGRlc3QsIGZvcmNlKSB7XG4gICAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICAgIGlmIChwaWVjZSAmJiAoY2FuRHJvcChzdGF0ZSwgb3JpZywgZGVzdCkgfHwgZm9yY2UpKSB7XG4gICAgICAgIHN0YXRlLnBpZWNlcy5kZWxldGUob3JpZyk7XG4gICAgICAgIGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGRlc3QsIGZvcmNlKTtcbiAgICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlck5ld1BpZWNlLCBwaWVjZS5yb2xlLCBkZXN0LCB7XG4gICAgICAgICAgICBwcmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgICAgIHByZWRyb3A6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGllY2UgJiYgY2FuUHJlZHJvcChzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICAgICAgc2V0UHJlZHJvcChzdGF0ZSwgcGllY2Uucm9sZSwgZGVzdCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICAgICAgICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICAgIH1cbiAgICBzdGF0ZS5waWVjZXMuZGVsZXRlKG9yaWcpO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTcXVhcmUoc3RhdGUsIGtleSwgZm9yY2UpIHtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5zZWxlY3QsIGtleSk7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZCA9PT0ga2V5ICYmICFzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCkge1xuICAgICAgICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgICAgICAgc3RhdGUuaG9sZC5jYW5jZWwoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJiBzdGF0ZS5zZWxlY3RlZCAhPT0ga2V5KSB7XG4gICAgICAgICAgICBpZiAodXNlck1vdmUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUuc3RhdHMuZHJhZ2dlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNNb3ZhYmxlKHN0YXRlLCBrZXkpIHx8IGlzUHJlbW92YWJsZShzdGF0ZSwga2V5KSkge1xuICAgICAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgICAgICAgc3RhdGUuaG9sZC5zdGFydCgpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KSB7XG4gICAgc3RhdGUuc2VsZWN0ZWQgPSBrZXk7XG4gICAgaWYgKGlzUHJlbW92YWJsZShzdGF0ZSwga2V5KSkge1xuICAgICAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gcHJlbW92ZShzdGF0ZS5waWVjZXMsIGtleSwgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpO1xuICAgIH1cbiAgICBlbHNlXG4gICAgICAgIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG59XG5leHBvcnQgZnVuY3Rpb24gdW5zZWxlY3Qoc3RhdGUpIHtcbiAgICBzdGF0ZS5zZWxlY3RlZCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmhvbGQuY2FuY2VsKCk7XG59XG5mdW5jdGlvbiBpc01vdmFibGUoc3RhdGUsIG9yaWcpIHtcbiAgICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gICAgcmV0dXJuICghIXBpZWNlICYmXG4gICAgICAgIChzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IpKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkge1xuICAgIHZhciBfYSwgX2I7XG4gICAgcmV0dXJuIChvcmlnICE9PSBkZXN0ICYmIGlzTW92YWJsZShzdGF0ZSwgb3JpZykgJiYgKHN0YXRlLm1vdmFibGUuZnJlZSB8fCAhISgoX2IgPSAoX2EgPSBzdGF0ZS5tb3ZhYmxlLmRlc3RzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZ2V0KG9yaWcpKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuaW5jbHVkZXMoZGVzdCkpKSk7XG59XG5mdW5jdGlvbiBjYW5Ecm9wKHN0YXRlLCBvcmlnLCBkZXN0KSB7XG4gICAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXMuZ2V0KG9yaWcpO1xuICAgIHJldHVybiAoISFwaWVjZSAmJlxuICAgICAgICAob3JpZyA9PT0gZGVzdCB8fCAhc3RhdGUucGllY2VzLmhhcyhkZXN0KSkgJiZcbiAgICAgICAgKHN0YXRlLm1vdmFibGUuY29sb3IgPT09ICdib3RoJyB8fCAoc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiYgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvcikpKTtcbn1cbmZ1bmN0aW9uIGlzUHJlbW92YWJsZShzdGF0ZSwgb3JpZykge1xuICAgIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzLmdldChvcmlnKTtcbiAgICByZXR1cm4gISFwaWVjZSAmJiBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWQgJiYgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiYgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvcjtcbn1cbmZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpIHtcbiAgICByZXR1cm4gKG9yaWcgIT09IGRlc3QgJiYgaXNQcmVtb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJiBwcmVtb3ZlKHN0YXRlLnBpZWNlcywgb3JpZywgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpLmluY2x1ZGVzKGRlc3QpKTtcbn1cbmZ1bmN0aW9uIGNhblByZWRyb3Aoc3RhdGUsIG9yaWcsIGRlc3QpIHtcbiAgICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gICAgY29uc3QgZGVzdFBpZWNlID0gc3RhdGUucGllY2VzLmdldChkZXN0KTtcbiAgICByZXR1cm4gKCEhcGllY2UgJiZcbiAgICAgICAgKCFkZXN0UGllY2UgfHwgZGVzdFBpZWNlLmNvbG9yICE9PSBzdGF0ZS5tb3ZhYmxlLmNvbG9yKSAmJlxuICAgICAgICBzdGF0ZS5wcmVkcm9wcGFibGUuZW5hYmxlZCAmJlxuICAgICAgICAocGllY2Uucm9sZSAhPT0gJ3Bhd24nIHx8IChkZXN0WzFdICE9PSAnMScgJiYgZGVzdFsxXSAhPT0gJzgnKSkgJiZcbiAgICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvcik7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNEcmFnZ2FibGUoc3RhdGUsIG9yaWcpIHtcbiAgICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlcy5nZXQob3JpZyk7XG4gICAgcmV0dXJuICghIXBpZWNlICYmXG4gICAgICAgIHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmXG4gICAgICAgIChzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHxcbiAgICAgICAgICAgIChzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJiAoc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvciB8fCBzdGF0ZS5wcmVtb3ZhYmxlLmVuYWJsZWQpKSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVtb3ZlKHN0YXRlKSB7XG4gICAgY29uc3QgbW92ZSA9IHN0YXRlLnByZW1vdmFibGUuY3VycmVudDtcbiAgICBpZiAoIW1vdmUpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCBvcmlnID0gbW92ZVswXSwgZGVzdCA9IG1vdmVbMV07XG4gICAgbGV0IHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB7IHByZW1vdmU6IHRydWUgfTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpXG4gICAgICAgICAgICAgICAgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICAgICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCBtZXRhZGF0YSk7XG4gICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICAgIHJldHVybiBzdWNjZXNzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVkcm9wKHN0YXRlLCB2YWxpZGF0ZSkge1xuICAgIGNvbnN0IGRyb3AgPSBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICAgIGlmICghZHJvcClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh2YWxpZGF0ZShkcm9wKSkge1xuICAgICAgICBjb25zdCBwaWVjZSA9IHtcbiAgICAgICAgICAgIHJvbGU6IGRyb3Aucm9sZSxcbiAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5tb3ZhYmxlLmNvbG9yLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZHJvcC5rZXkpKSB7XG4gICAgICAgICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyTmV3UGllY2UsIGRyb3Aucm9sZSwgZHJvcC5rZXksIHtcbiAgICAgICAgICAgICAgICBwcmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcmVkcm9wOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICAgIHJldHVybiBzdWNjZXNzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbE1vdmUoc3RhdGUpIHtcbiAgICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICAgIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gICAgdW5zZWxlY3Qoc3RhdGUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHN0b3Aoc3RhdGUpIHtcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID0gc3RhdGUubW92YWJsZS5kZXN0cyA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbmNlbE1vdmUoc3RhdGUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldEtleUF0RG9tUG9zKHBvcywgYXNXaGl0ZSwgYm91bmRzKSB7XG4gICAgbGV0IGZpbGUgPSBNYXRoLmZsb29yKCg4ICogKHBvc1swXSAtIGJvdW5kcy5sZWZ0KSkgLyBib3VuZHMud2lkdGgpO1xuICAgIGlmICghYXNXaGl0ZSlcbiAgICAgICAgZmlsZSA9IDcgLSBmaWxlO1xuICAgIGxldCByYW5rID0gNyAtIE1hdGguZmxvb3IoKDggKiAocG9zWzFdIC0gYm91bmRzLnRvcCkpIC8gYm91bmRzLmhlaWdodCk7XG4gICAgaWYgKCFhc1doaXRlKVxuICAgICAgICByYW5rID0gNyAtIHJhbms7XG4gICAgcmV0dXJuIGZpbGUgPj0gMCAmJiBmaWxlIDwgOCAmJiByYW5rID49IDAgJiYgcmFuayA8IDggPyBwb3Mya2V5KFtmaWxlLCByYW5rXSkgOiB1bmRlZmluZWQ7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0U25hcHBlZEtleUF0RG9tUG9zKG9yaWcsIHBvcywgYXNXaGl0ZSwgYm91bmRzKSB7XG4gICAgY29uc3Qgb3JpZ1BvcyA9IGtleTJwb3Mob3JpZyk7XG4gICAgY29uc3QgdmFsaWRTbmFwUG9zID0gYWxsUG9zLmZpbHRlcihwb3MyID0+IHtcbiAgICAgICAgcmV0dXJuIHF1ZWVuKG9yaWdQb3NbMF0sIG9yaWdQb3NbMV0sIHBvczJbMF0sIHBvczJbMV0pIHx8IGtuaWdodChvcmlnUG9zWzBdLCBvcmlnUG9zWzFdLCBwb3MyWzBdLCBwb3MyWzFdKTtcbiAgICB9KTtcbiAgICBjb25zdCB2YWxpZFNuYXBDZW50ZXJzID0gdmFsaWRTbmFwUG9zLm1hcChwb3MyID0+IGNvbXB1dGVTcXVhcmVDZW50ZXIocG9zMmtleShwb3MyKSwgYXNXaGl0ZSwgYm91bmRzKSk7XG4gICAgY29uc3QgdmFsaWRTbmFwRGlzdGFuY2VzID0gdmFsaWRTbmFwQ2VudGVycy5tYXAocG9zMiA9PiBkaXN0YW5jZVNxKHBvcywgcG9zMikpO1xuICAgIGNvbnN0IFssIGNsb3Nlc3RTbmFwSW5kZXhdID0gdmFsaWRTbmFwRGlzdGFuY2VzLnJlZHVjZSgoYSwgYiwgaW5kZXgpID0+IChhWzBdIDwgYiA/IGEgOiBbYiwgaW5kZXhdKSwgW3ZhbGlkU25hcERpc3RhbmNlc1swXSwgMF0pO1xuICAgIHJldHVybiBwb3Mya2V5KHZhbGlkU25hcFBvc1tjbG9zZXN0U25hcEluZGV4XSk7XG59XG5leHBvcnQgZnVuY3Rpb24gd2hpdGVQb3Yocykge1xuICAgIHJldHVybiBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Ym9hcmQuanMubWFwIiwiaW1wb3J0IHsgcG9zMmtleSwgaW52UmFua3MgfSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcy5qcyc7XG5leHBvcnQgY29uc3QgaW5pdGlhbCA9ICdybmJxa2Juci9wcHBwcHBwcC84LzgvOC84L1BQUFBQUFBQL1JOQlFLQk5SJztcbmNvbnN0IHJvbGVzID0ge1xuICAgIHA6ICdwYXduJyxcbiAgICByOiAncm9vaycsXG4gICAgbjogJ2tuaWdodCcsXG4gICAgYjogJ2Jpc2hvcCcsXG4gICAgcTogJ3F1ZWVuJyxcbiAgICBrOiAna2luZycsXG59O1xuY29uc3QgbGV0dGVycyA9IHtcbiAgICBwYXduOiAncCcsXG4gICAgcm9vazogJ3InLFxuICAgIGtuaWdodDogJ24nLFxuICAgIGJpc2hvcDogJ2InLFxuICAgIHF1ZWVuOiAncScsXG4gICAga2luZzogJ2snLFxufTtcbmV4cG9ydCBmdW5jdGlvbiByZWFkKGZlbikge1xuICAgIGlmIChmZW4gPT09ICdzdGFydCcpXG4gICAgICAgIGZlbiA9IGluaXRpYWw7XG4gICAgY29uc3QgcGllY2VzID0gbmV3IE1hcCgpO1xuICAgIGxldCByb3cgPSA3LCBjb2wgPSAwO1xuICAgIGZvciAoY29uc3QgYyBvZiBmZW4pIHtcbiAgICAgICAgc3dpdGNoIChjKSB7XG4gICAgICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgICAgIGNhc2UgJ1snOlxuICAgICAgICAgICAgICAgIHJldHVybiBwaWVjZXM7XG4gICAgICAgICAgICBjYXNlICcvJzpcbiAgICAgICAgICAgICAgICAtLXJvdztcbiAgICAgICAgICAgICAgICBpZiAocm93IDwgMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBpZWNlcztcbiAgICAgICAgICAgICAgICBjb2wgPSAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnfic6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwaWVjZSA9IHBpZWNlcy5nZXQocG9zMmtleShbY29sIC0gMSwgcm93XSkpO1xuICAgICAgICAgICAgICAgIGlmIChwaWVjZSlcbiAgICAgICAgICAgICAgICAgICAgcGllY2UucHJvbW90ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5iID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgICAgIGlmIChuYiA8IDU3KVxuICAgICAgICAgICAgICAgICAgICBjb2wgKz0gbmIgLSA0ODtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9sZSA9IGMudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcGllY2VzLnNldChwb3Mya2V5KFtjb2wsIHJvd10pLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlOiByb2xlc1tyb2xlXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjID09PSByb2xlID8gJ2JsYWNrJyA6ICd3aGl0ZScsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICArK2NvbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBpZWNlcztcbn1cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZShwaWVjZXMpIHtcbiAgICByZXR1cm4gaW52UmFua3NcbiAgICAgICAgLm1hcCh5ID0+IGNnLmZpbGVzXG4gICAgICAgIC5tYXAoeCA9PiB7XG4gICAgICAgIGNvbnN0IHBpZWNlID0gcGllY2VzLmdldCgoeCArIHkpKTtcbiAgICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgICAgICBsZXQgcCA9IGxldHRlcnNbcGllY2Uucm9sZV07XG4gICAgICAgICAgICBpZiAocGllY2UuY29sb3IgPT09ICd3aGl0ZScpXG4gICAgICAgICAgICAgICAgcCA9IHAudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIGlmIChwaWVjZS5wcm9tb3RlZClcbiAgICAgICAgICAgICAgICBwICs9ICd+JztcbiAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiAnMSc7XG4gICAgfSlcbiAgICAgICAgLmpvaW4oJycpKVxuICAgICAgICAuam9pbignLycpXG4gICAgICAgIC5yZXBsYWNlKC8xezIsfS9nLCBzID0+IHMubGVuZ3RoLnRvU3RyaW5nKCkpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZmVuLmpzLm1hcCIsImltcG9ydCB7IHNldENoZWNrLCBzZXRTZWxlY3RlZCB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgcmVhZCBhcyBmZW5SZWFkIH0gZnJvbSAnLi9mZW4uanMnO1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpIHtcbiAgICBpZiAoY29uZmlnLmFuaW1hdGlvbikge1xuICAgICAgICBkZWVwTWVyZ2Uoc3RhdGUuYW5pbWF0aW9uLCBjb25maWcuYW5pbWF0aW9uKTtcbiAgICAgICAgLy8gbm8gbmVlZCBmb3Igc3VjaCBzaG9ydCBhbmltYXRpb25zXG4gICAgICAgIGlmICgoc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uIHx8IDApIDwgNzApXG4gICAgICAgICAgICBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmUoc3RhdGUsIGNvbmZpZykge1xuICAgIHZhciBfYSwgX2I7XG4gICAgLy8gZG9uJ3QgbWVyZ2UgZGVzdGluYXRpb25zIGFuZCBhdXRvU2hhcGVzLiBKdXN0IG92ZXJyaWRlLlxuICAgIGlmICgoX2EgPSBjb25maWcubW92YWJsZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmRlc3RzKVxuICAgICAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIGlmICgoX2IgPSBjb25maWcuZHJhd2FibGUpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5hdXRvU2hhcGVzKVxuICAgICAgICBzdGF0ZS5kcmF3YWJsZS5hdXRvU2hhcGVzID0gW107XG4gICAgZGVlcE1lcmdlKHN0YXRlLCBjb25maWcpO1xuICAgIC8vIGlmIGEgZmVuIHdhcyBwcm92aWRlZCwgcmVwbGFjZSB0aGUgcGllY2VzXG4gICAgaWYgKGNvbmZpZy5mZW4pIHtcbiAgICAgICAgc3RhdGUucGllY2VzID0gZmVuUmVhZChjb25maWcuZmVuKTtcbiAgICAgICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gICAgfVxuICAgIC8vIGFwcGx5IGNvbmZpZyB2YWx1ZXMgdGhhdCBjb3VsZCBiZSB1bmRlZmluZWQgeWV0IG1lYW5pbmdmdWxcbiAgICBpZiAoJ2NoZWNrJyBpbiBjb25maWcpXG4gICAgICAgIHNldENoZWNrKHN0YXRlLCBjb25maWcuY2hlY2sgfHwgZmFsc2UpO1xuICAgIGlmICgnbGFzdE1vdmUnIGluIGNvbmZpZyAmJiAhY29uZmlnLmxhc3RNb3ZlKVxuICAgICAgICBzdGF0ZS5sYXN0TW92ZSA9IHVuZGVmaW5lZDtcbiAgICAvLyBpbiBjYXNlIG9mIFpIIGRyb3AgbGFzdCBtb3ZlLCB0aGVyZSdzIGEgc2luZ2xlIHNxdWFyZS5cbiAgICAvLyBpZiB0aGUgcHJldmlvdXMgbGFzdCBtb3ZlIGhhZCB0d28gc3F1YXJlcyxcbiAgICAvLyB0aGUgbWVyZ2UgYWxnb3JpdGhtIHdpbGwgaW5jb3JyZWN0bHkga2VlcCB0aGUgc2Vjb25kIHNxdWFyZS5cbiAgICBlbHNlIGlmIChjb25maWcubGFzdE1vdmUpXG4gICAgICAgIHN0YXRlLmxhc3RNb3ZlID0gY29uZmlnLmxhc3RNb3ZlO1xuICAgIC8vIGZpeCBtb3ZlL3ByZW1vdmUgZGVzdHNcbiAgICBpZiAoc3RhdGUuc2VsZWN0ZWQpXG4gICAgICAgIHNldFNlbGVjdGVkKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCk7XG4gICAgYXBwbHlBbmltYXRpb24oc3RhdGUsIGNvbmZpZyk7XG4gICAgaWYgKCFzdGF0ZS5tb3ZhYmxlLnJvb2tDYXN0bGUgJiYgc3RhdGUubW92YWJsZS5kZXN0cykge1xuICAgICAgICBjb25zdCByYW5rID0gc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ3doaXRlJyA/ICcxJyA6ICc4Jywga2luZ1N0YXJ0UG9zID0gKCdlJyArIHJhbmspLCBkZXN0cyA9IHN0YXRlLm1vdmFibGUuZGVzdHMuZ2V0KGtpbmdTdGFydFBvcyksIGtpbmcgPSBzdGF0ZS5waWVjZXMuZ2V0KGtpbmdTdGFydFBvcyk7XG4gICAgICAgIGlmICghZGVzdHMgfHwgIWtpbmcgfHwga2luZy5yb2xlICE9PSAna2luZycpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHN0YXRlLm1vdmFibGUuZGVzdHMuc2V0KGtpbmdTdGFydFBvcywgZGVzdHMuZmlsdGVyKGQgPT4gIShkID09PSAnYScgKyByYW5rICYmIGRlc3RzLmluY2x1ZGVzKCgnYycgKyByYW5rKSkpICYmXG4gICAgICAgICAgICAhKGQgPT09ICdoJyArIHJhbmsgJiYgZGVzdHMuaW5jbHVkZXMoKCdnJyArIHJhbmspKSkpKTtcbiAgICB9XG59XG5mdW5jdGlvbiBkZWVwTWVyZ2UoYmFzZSwgZXh0ZW5kKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZXh0ZW5kKSB7XG4gICAgICAgIGlmIChpc09iamVjdChiYXNlW2tleV0pICYmIGlzT2JqZWN0KGV4dGVuZFtrZXldKSlcbiAgICAgICAgICAgIGRlZXBNZXJnZShiYXNlW2tleV0sIGV4dGVuZFtrZXldKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYmFzZVtrZXldID0gZXh0ZW5kW2tleV07XG4gICAgfVxufVxuZnVuY3Rpb24gaXNPYmplY3Qobykge1xuICAgIHJldHVybiB0eXBlb2YgbyA9PT0gJ29iamVjdCc7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25maWcuanMubWFwIiwiaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW0obXV0YXRpb24sIHN0YXRlKSB7XG4gICAgcmV0dXJuIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID8gYW5pbWF0ZShtdXRhdGlvbiwgc3RhdGUpIDogcmVuZGVyKG11dGF0aW9uLCBzdGF0ZSk7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKG11dGF0aW9uLCBzdGF0ZSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKTtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG1ha2VQaWVjZShrZXksIHBpZWNlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgICAgIHBpZWNlOiBwaWVjZSxcbiAgICB9O1xufVxuZnVuY3Rpb24gY2xvc2VyKHBpZWNlLCBwaWVjZXMpIHtcbiAgICByZXR1cm4gcGllY2VzLnNvcnQoKHAxLCBwMikgPT4ge1xuICAgICAgICByZXR1cm4gdXRpbC5kaXN0YW5jZVNxKHBpZWNlLnBvcywgcDEucG9zKSAtIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAyLnBvcyk7XG4gICAgfSlbMF07XG59XG5mdW5jdGlvbiBjb21wdXRlUGxhbihwcmV2UGllY2VzLCBjdXJyZW50KSB7XG4gICAgY29uc3QgYW5pbXMgPSBuZXcgTWFwKCksIGFuaW1lZE9yaWdzID0gW10sIGZhZGluZ3MgPSBuZXcgTWFwKCksIG1pc3NpbmdzID0gW10sIG5ld3MgPSBbXSwgcHJlUGllY2VzID0gbmV3IE1hcCgpO1xuICAgIGxldCBjdXJQLCBwcmVQLCB2ZWN0b3I7XG4gICAgZm9yIChjb25zdCBbaywgcF0gb2YgcHJldlBpZWNlcykge1xuICAgICAgICBwcmVQaWVjZXMuc2V0KGssIG1ha2VQaWVjZShrLCBwKSk7XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IG9mIHV0aWwuYWxsS2V5cykge1xuICAgICAgICBjdXJQID0gY3VycmVudC5waWVjZXMuZ2V0KGtleSk7XG4gICAgICAgIHByZVAgPSBwcmVQaWVjZXMuZ2V0KGtleSk7XG4gICAgICAgIGlmIChjdXJQKSB7XG4gICAgICAgICAgICBpZiAocHJlUCkge1xuICAgICAgICAgICAgICAgIGlmICghdXRpbC5zYW1lUGllY2UoY3VyUCwgcHJlUC5waWVjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwcmVQKVxuICAgICAgICAgICAgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBuZXdQIG9mIG5ld3MpIHtcbiAgICAgICAgcHJlUCA9IGNsb3NlcihuZXdQLCBtaXNzaW5ncy5maWx0ZXIocCA9PiB1dGlsLnNhbWVQaWVjZShuZXdQLnBpZWNlLCBwLnBpZWNlKSkpO1xuICAgICAgICBpZiAocHJlUCkge1xuICAgICAgICAgICAgdmVjdG9yID0gW3ByZVAucG9zWzBdIC0gbmV3UC5wb3NbMF0sIHByZVAucG9zWzFdIC0gbmV3UC5wb3NbMV1dO1xuICAgICAgICAgICAgYW5pbXMuc2V0KG5ld1Aua2V5LCB2ZWN0b3IuY29uY2F0KHZlY3RvcikpO1xuICAgICAgICAgICAgYW5pbWVkT3JpZ3MucHVzaChwcmVQLmtleSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBwIG9mIG1pc3NpbmdzKSB7XG4gICAgICAgIGlmICghYW5pbWVkT3JpZ3MuaW5jbHVkZXMocC5rZXkpKVxuICAgICAgICAgICAgZmFkaW5ncy5zZXQocC5rZXksIHAucGllY2UpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBhbmltczogYW5pbXMsXG4gICAgICAgIGZhZGluZ3M6IGZhZGluZ3MsXG4gICAgfTtcbn1cbmZ1bmN0aW9uIHN0ZXAoc3RhdGUsIG5vdykge1xuICAgIGNvbnN0IGN1ciA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50O1xuICAgIGlmIChjdXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBhbmltYXRpb24gd2FzIGNhbmNlbGVkIDooXG4gICAgICAgIGlmICghc3RhdGUuZG9tLmRlc3Ryb3llZClcbiAgICAgICAgICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZXN0ID0gMSAtIChub3cgLSBjdXIuc3RhcnQpICogY3VyLmZyZXF1ZW5jeTtcbiAgICBpZiAocmVzdCA8PSAwKSB7XG4gICAgICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBlYXNlID0gZWFzaW5nKHJlc3QpO1xuICAgICAgICBmb3IgKGNvbnN0IGNmZyBvZiBjdXIucGxhbi5hbmltcy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgY2ZnWzJdID0gY2ZnWzBdICogZWFzZTtcbiAgICAgICAgICAgIGNmZ1szXSA9IGNmZ1sxXSAqIGVhc2U7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhd05vdyh0cnVlKTsgLy8gb3B0aW1pc2F0aW9uOiBkb24ndCByZW5kZXIgU1ZHIGNoYW5nZXMgZHVyaW5nIGFuaW1hdGlvbnNcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKChub3cgPSBwZXJmb3JtYW5jZS5ub3coKSkgPT4gc3RlcChzdGF0ZSwgbm93KSk7XG4gICAgfVxufVxuZnVuY3Rpb24gYW5pbWF0ZShtdXRhdGlvbiwgc3RhdGUpIHtcbiAgICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgICBjb25zdCBwcmV2UGllY2VzID0gbmV3IE1hcChzdGF0ZS5waWVjZXMpO1xuICAgIGNvbnN0IHJlc3VsdCA9IG11dGF0aW9uKHN0YXRlKTtcbiAgICBjb25zdCBwbGFuID0gY29tcHV0ZVBsYW4ocHJldlBpZWNlcywgc3RhdGUpO1xuICAgIGlmIChwbGFuLmFuaW1zLnNpemUgfHwgcGxhbi5mYWRpbmdzLnNpemUpIHtcbiAgICAgICAgY29uc3QgYWxyZWFkeVJ1bm5pbmcgPSBzdGF0ZS5hbmltYXRpb24uY3VycmVudCAmJiBzdGF0ZS5hbmltYXRpb24uY3VycmVudC5zdGFydDtcbiAgICAgICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB7XG4gICAgICAgICAgICBzdGFydDogcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICAgICAgICBmcmVxdWVuY3k6IDEgLyBzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24sXG4gICAgICAgICAgICBwbGFuOiBwbGFuLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoIWFscmVhZHlSdW5uaW5nKVxuICAgICAgICAgICAgc3RlcChzdGF0ZSwgcGVyZm9ybWFuY2Uubm93KCkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gZG9uJ3QgYW5pbWF0ZSwganVzdCByZW5kZXIgcmlnaHQgYXdheVxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuZnVuY3Rpb24gZWFzaW5nKHQpIHtcbiAgICByZXR1cm4gdCA8IDAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDE7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hbmltLmpzLm1hcCIsImltcG9ydCB7IHVuc2VsZWN0LCBjYW5jZWxNb3ZlLCBnZXRLZXlBdERvbVBvcywgZ2V0U25hcHBlZEtleUF0RG9tUG9zLCB3aGl0ZVBvdiB9IGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgZXZlbnRQb3NpdGlvbiwgaXNSaWdodEJ1dHRvbiB9IGZyb20gJy4vdXRpbC5qcyc7XG5jb25zdCBicnVzaGVzID0gWydncmVlbicsICdyZWQnLCAnYmx1ZScsICd5ZWxsb3cnXTtcbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZSwgZSkge1xuICAgIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gICAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuY3RybEtleSA/IHVuc2VsZWN0KHN0YXRlKSA6IGNhbmNlbE1vdmUoc3RhdGUpO1xuICAgIGNvbnN0IHBvcyA9IGV2ZW50UG9zaXRpb24oZSksIG9yaWcgPSBnZXRLZXlBdERvbVBvcyhwb3MsIHdoaXRlUG92KHN0YXRlKSwgc3RhdGUuZG9tLmJvdW5kcygpKTtcbiAgICBpZiAoIW9yaWcpXG4gICAgICAgIHJldHVybjtcbiAgICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0ge1xuICAgICAgICBvcmlnLFxuICAgICAgICBwb3MsXG4gICAgICAgIGJydXNoOiBldmVudEJydXNoKGUpLFxuICAgICAgICBzbmFwVG9WYWxpZE1vdmU6IHN0YXRlLmRyYXdhYmxlLmRlZmF1bHRTbmFwVG9WYWxpZE1vdmUsXG4gICAgfTtcbiAgICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG59XG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0RyYXcoc3RhdGUpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICAgICAgICBpZiAoY3VyKSB7XG4gICAgICAgICAgICBjb25zdCBrZXlBdERvbVBvcyA9IGdldEtleUF0RG9tUG9zKGN1ci5wb3MsIHdoaXRlUG92KHN0YXRlKSwgc3RhdGUuZG9tLmJvdW5kcygpKTtcbiAgICAgICAgICAgIGlmICgha2V5QXREb21Qb3MpIHtcbiAgICAgICAgICAgICAgICBjdXIuc25hcFRvVmFsaWRNb3ZlID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtb3VzZVNxID0gY3VyLnNuYXBUb1ZhbGlkTW92ZVxuICAgICAgICAgICAgICAgID8gZ2V0U25hcHBlZEtleUF0RG9tUG9zKGN1ci5vcmlnLCBjdXIucG9zLCB3aGl0ZVBvdihzdGF0ZSksIHN0YXRlLmRvbS5ib3VuZHMoKSlcbiAgICAgICAgICAgICAgICA6IGtleUF0RG9tUG9zO1xuICAgICAgICAgICAgaWYgKG1vdXNlU3EgIT09IGN1ci5tb3VzZVNxKSB7XG4gICAgICAgICAgICAgICAgY3VyLm1vdXNlU3EgPSBtb3VzZVNxO1xuICAgICAgICAgICAgICAgIGN1ci5kZXN0ID0gbW91c2VTcSAhPT0gY3VyLm9yaWcgPyBtb3VzZVNxIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoc3RhdGUsIGUpIHtcbiAgICBpZiAoc3RhdGUuZHJhd2FibGUuY3VycmVudClcbiAgICAgICAgc3RhdGUuZHJhd2FibGUuY3VycmVudC5wb3MgPSBldmVudFBvc2l0aW9uKGUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzdGF0ZSkge1xuICAgIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gICAgaWYgKGN1cikge1xuICAgICAgICBpZiAoY3VyLm1vdXNlU3EpXG4gICAgICAgICAgICBhZGRTaGFwZShzdGF0ZS5kcmF3YWJsZSwgY3VyKTtcbiAgICAgICAgY2FuY2VsKHN0YXRlKTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBjbGVhcihzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5kcmF3YWJsZS5zaGFwZXMubGVuZ3RoKSB7XG4gICAgICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICAgIG9uQ2hhbmdlKHN0YXRlLmRyYXdhYmxlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBldmVudEJydXNoKGUpIHtcbiAgICB2YXIgX2E7XG4gICAgY29uc3QgbW9kQSA9IChlLnNoaWZ0S2V5IHx8IGUuY3RybEtleSkgJiYgaXNSaWdodEJ1dHRvbihlKTtcbiAgICBjb25zdCBtb2RCID0gZS5hbHRLZXkgfHwgZS5tZXRhS2V5IHx8ICgoX2EgPSBlLmdldE1vZGlmaWVyU3RhdGUpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5jYWxsKGUsICdBbHRHcmFwaCcpKTtcbiAgICByZXR1cm4gYnJ1c2hlc1sobW9kQSA/IDEgOiAwKSArIChtb2RCID8gMiA6IDApXTtcbn1cbmZ1bmN0aW9uIGFkZFNoYXBlKGRyYXdhYmxlLCBjdXIpIHtcbiAgICBjb25zdCBzYW1lU2hhcGUgPSAocykgPT4gcy5vcmlnID09PSBjdXIub3JpZyAmJiBzLmRlc3QgPT09IGN1ci5kZXN0O1xuICAgIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmluZChzYW1lU2hhcGUpO1xuICAgIGlmIChzaW1pbGFyKVxuICAgICAgICBkcmF3YWJsZS5zaGFwZXMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHMgPT4gIXNhbWVTaGFwZShzKSk7XG4gICAgaWYgKCFzaW1pbGFyIHx8IHNpbWlsYXIuYnJ1c2ggIT09IGN1ci5icnVzaClcbiAgICAgICAgZHJhd2FibGUuc2hhcGVzLnB1c2goY3VyKTtcbiAgICBvbkNoYW5nZShkcmF3YWJsZSk7XG59XG5mdW5jdGlvbiBvbkNoYW5nZShkcmF3YWJsZSkge1xuICAgIGlmIChkcmF3YWJsZS5vbkNoYW5nZSlcbiAgICAgICAgZHJhd2FibGUub25DaGFuZ2UoZHJhd2FibGUuc2hhcGVzKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRyYXcuanMubWFwIiwiaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZC5qcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBjbGVhciBhcyBkcmF3Q2xlYXIgfSBmcm9tICcuL2RyYXcuanMnO1xuaW1wb3J0IHsgYW5pbSB9IGZyb20gJy4vYW5pbS5qcyc7XG5leHBvcnQgZnVuY3Rpb24gc3RhcnQocywgZSkge1xuICAgIGlmICghZS5pc1RydXN0ZWQgfHwgKGUuYnV0dG9uICE9PSB1bmRlZmluZWQgJiYgZS5idXR0b24gIT09IDApKVxuICAgICAgICByZXR1cm47IC8vIG9ubHkgdG91Y2ggb3IgbGVmdCBjbGlja1xuICAgIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpXG4gICAgICAgIHJldHVybjsgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgICBjb25zdCBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKSwgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSksIG9yaWcgPSBib2FyZC5nZXRLZXlBdERvbVBvcyhwb3NpdGlvbiwgYm9hcmQud2hpdGVQb3YocyksIGJvdW5kcyk7XG4gICAgaWYgKCFvcmlnKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgcGllY2UgPSBzLnBpZWNlcy5nZXQob3JpZyk7XG4gICAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkID0gcy5zZWxlY3RlZDtcbiAgICBpZiAoIXByZXZpb3VzbHlTZWxlY3RlZCAmJiBzLmRyYXdhYmxlLmVuYWJsZWQgJiYgKHMuZHJhd2FibGUuZXJhc2VPbkNsaWNrIHx8ICFwaWVjZSB8fCBwaWVjZS5jb2xvciAhPT0gcy50dXJuQ29sb3IpKVxuICAgICAgICBkcmF3Q2xlYXIocyk7XG4gICAgLy8gUHJldmVudCB0b3VjaCBzY3JvbGwgYW5kIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50LCBpZiB0aGVyZVxuICAgIC8vIGlzIGFuIGludGVudCB0byBpbnRlcmFjdCB3aXRoIHRoZSBib2FyZC5cbiAgICBpZiAoZS5jYW5jZWxhYmxlICE9PSBmYWxzZSAmJlxuICAgICAgICAoIWUudG91Y2hlcyB8fCBzLmJsb2NrVG91Y2hTY3JvbGwgfHwgcGllY2UgfHwgcHJldmlvdXNseVNlbGVjdGVkIHx8IHBpZWNlQ2xvc2VUbyhzLCBwb3NpdGlvbikpKVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gICAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgICBzLnN0YXRzLmN0cmxLZXkgPSBlLmN0cmxLZXk7XG4gICAgaWYgKHMuc2VsZWN0ZWQgJiYgYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkge1xuICAgICAgICBhbmltKHN0YXRlID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwgb3JpZyksIHMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgYm9hcmQuc2VsZWN0U3F1YXJlKHMsIG9yaWcpO1xuICAgIH1cbiAgICBjb25zdCBzdGlsbFNlbGVjdGVkID0gcy5zZWxlY3RlZCA9PT0gb3JpZztcbiAgICBjb25zdCBlbGVtZW50ID0gcGllY2VFbGVtZW50QnlLZXkocywgb3JpZyk7XG4gICAgaWYgKHBpZWNlICYmIGVsZW1lbnQgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBvcmlnKSkge1xuICAgICAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgICAgICAgICAgb3JpZyxcbiAgICAgICAgICAgIHBpZWNlLFxuICAgICAgICAgICAgb3JpZ1BvczogcG9zaXRpb24sXG4gICAgICAgICAgICBwb3M6IHBvc2l0aW9uLFxuICAgICAgICAgICAgc3RhcnRlZDogcy5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmIHMuc3RhdHMuZHJhZ2dlZCxcbiAgICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgICBwcmV2aW91c2x5U2VsZWN0ZWQsXG4gICAgICAgICAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0LFxuICAgICAgICAgICAga2V5SGFzQ2hhbmdlZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgICAgIGVsZW1lbnQuY2dEcmFnZ2luZyA9IHRydWU7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZHJhZ2dpbmcnKTtcbiAgICAgICAgLy8gcGxhY2UgZ2hvc3RcbiAgICAgICAgY29uc3QgZ2hvc3QgPSBzLmRvbS5lbGVtZW50cy5naG9zdDtcbiAgICAgICAgaWYgKGdob3N0KSB7XG4gICAgICAgICAgICBnaG9zdC5jbGFzc05hbWUgPSBgZ2hvc3QgJHtwaWVjZS5jb2xvcn0gJHtwaWVjZS5yb2xlfWA7XG4gICAgICAgICAgICB1dGlsLnRyYW5zbGF0ZShnaG9zdCwgdXRpbC5wb3NUb1RyYW5zbGF0ZShib3VuZHMpKHV0aWwua2V5MnBvcyhvcmlnKSwgYm9hcmQud2hpdGVQb3YocykpKTtcbiAgICAgICAgICAgIHV0aWwuc2V0VmlzaWJsZShnaG9zdCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvY2Vzc0RyYWcocyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoaGFkUHJlbW92ZSlcbiAgICAgICAgICAgIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICAgICAgaWYgKGhhZFByZWRyb3ApXG4gICAgICAgICAgICBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gICAgfVxuICAgIHMuZG9tLnJlZHJhdygpO1xufVxuZnVuY3Rpb24gcGllY2VDbG9zZVRvKHMsIHBvcykge1xuICAgIGNvbnN0IGFzV2hpdGUgPSBib2FyZC53aGl0ZVBvdihzKSwgYm91bmRzID0gcy5kb20uYm91bmRzKCksIHJhZGl1c1NxID0gTWF0aC5wb3coYm91bmRzLndpZHRoIC8gOCwgMik7XG4gICAgZm9yIChjb25zdCBrZXkgb2Ygcy5waWVjZXMua2V5cygpKSB7XG4gICAgICAgIGNvbnN0IGNlbnRlciA9IHV0aWwuY29tcHV0ZVNxdWFyZUNlbnRlcihrZXksIGFzV2hpdGUsIGJvdW5kcyk7XG4gICAgICAgIGlmICh1dGlsLmRpc3RhbmNlU3EoY2VudGVyLCBwb3MpIDw9IHJhZGl1c1NxKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkcmFnTmV3UGllY2UocywgcGllY2UsIGUsIGZvcmNlKSB7XG4gICAgY29uc3Qga2V5ID0gJ2EwJztcbiAgICBzLnBpZWNlcy5zZXQoa2V5LCBwaWVjZSk7XG4gICAgcy5kb20ucmVkcmF3KCk7XG4gICAgY29uc3QgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgICAgb3JpZzoga2V5LFxuICAgICAgICBwaWVjZSxcbiAgICAgICAgb3JpZ1BvczogcG9zaXRpb24sXG4gICAgICAgIHBvczogcG9zaXRpb24sXG4gICAgICAgIHN0YXJ0ZWQ6IHRydWUsXG4gICAgICAgIGVsZW1lbnQ6ICgpID0+IHBpZWNlRWxlbWVudEJ5S2V5KHMsIGtleSksXG4gICAgICAgIG9yaWdpblRhcmdldDogZS50YXJnZXQsXG4gICAgICAgIG5ld1BpZWNlOiB0cnVlLFxuICAgICAgICBmb3JjZTogISFmb3JjZSxcbiAgICAgICAga2V5SGFzQ2hhbmdlZDogZmFsc2UsXG4gICAgfTtcbiAgICBwcm9jZXNzRHJhZyhzKTtcbn1cbmZ1bmN0aW9uIHByb2Nlc3NEcmFnKHMpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gICAgICAgIGlmICghY3VyKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAvLyBjYW5jZWwgYW5pbWF0aW9ucyB3aGlsZSBkcmFnZ2luZ1xuICAgICAgICBpZiAoKF9hID0gcy5hbmltYXRpb24uY3VycmVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnBsYW4uYW5pbXMuaGFzKGN1ci5vcmlnKSlcbiAgICAgICAgICAgIHMuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIC8vIGlmIG1vdmluZyBwaWVjZSBpcyBnb25lLCBjYW5jZWxcbiAgICAgICAgY29uc3Qgb3JpZ1BpZWNlID0gcy5waWVjZXMuZ2V0KGN1ci5vcmlnKTtcbiAgICAgICAgaWYgKCFvcmlnUGllY2UgfHwgIXV0aWwuc2FtZVBpZWNlKG9yaWdQaWVjZSwgY3VyLnBpZWNlKSlcbiAgICAgICAgICAgIGNhbmNlbChzKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWN1ci5zdGFydGVkICYmIHV0aWwuZGlzdGFuY2VTcShjdXIucG9zLCBjdXIub3JpZ1BvcykgPj0gTWF0aC5wb3cocy5kcmFnZ2FibGUuZGlzdGFuY2UsIDIpKVxuICAgICAgICAgICAgICAgIGN1ci5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChjdXIuc3RhcnRlZCkge1xuICAgICAgICAgICAgICAgIC8vIHN1cHBvcnQgbGF6eSBlbGVtZW50c1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY3VyLmVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZm91bmQgPSBjdXIuZWxlbWVudCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWZvdW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBmb3VuZC5jZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgZm91bmQuY2xhc3NMaXN0LmFkZCgnZHJhZ2dpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgY3VyLmVsZW1lbnQgPSBmb3VuZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgYm91bmRzID0gcy5kb20uYm91bmRzKCk7XG4gICAgICAgICAgICAgICAgdXRpbC50cmFuc2xhdGUoY3VyLmVsZW1lbnQsIFtcbiAgICAgICAgICAgICAgICAgICAgY3VyLnBvc1swXSAtIGJvdW5kcy5sZWZ0IC0gYm91bmRzLndpZHRoIC8gMTYsXG4gICAgICAgICAgICAgICAgICAgIGN1ci5wb3NbMV0gLSBib3VuZHMudG9wIC0gYm91bmRzLmhlaWdodCAvIDE2LFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIGN1ci5rZXlIYXNDaGFuZ2VkIHx8IChjdXIua2V5SGFzQ2hhbmdlZCA9IGN1ci5vcmlnICE9PSBib2FyZC5nZXRLZXlBdERvbVBvcyhjdXIucG9zLCBib2FyZC53aGl0ZVBvdihzKSwgYm91bmRzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvY2Vzc0RyYWcocyk7XG4gICAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gbW92ZShzLCBlKSB7XG4gICAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCAmJiAoIWUudG91Y2hlcyB8fCBlLnRvdWNoZXMubGVuZ3RoIDwgMikpIHtcbiAgICAgICAgcy5kcmFnZ2FibGUuY3VycmVudC5wb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzLCBlKSB7XG4gICAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgICBpZiAoIWN1cilcbiAgICAgICAgcmV0dXJuO1xuICAgIC8vIGNyZWF0ZSBubyBjb3JyZXNwb25kaW5nIG1vdXNlIGV2ZW50XG4gICAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBlLmNhbmNlbGFibGUgIT09IGZhbHNlKVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gY29tcGFyaW5nIHdpdGggdGhlIG9yaWdpbiB0YXJnZXQgaXMgYW4gZWFzeSB3YXkgdG8gdGVzdCB0aGF0IHRoZSBlbmQgZXZlbnRcbiAgICAvLyBoYXMgdGhlIHNhbWUgdG91Y2ggb3JpZ2luXG4gICAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBjdXIub3JpZ2luVGFyZ2V0ICE9PSBlLnRhcmdldCAmJiAhY3VyLm5ld1BpZWNlKSB7XG4gICAgICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgICAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb247IHNvIHVzZSB0aGUgbGFzdCB0b3VjaG1vdmUgcG9zaXRpb24gaW5zdGVhZFxuICAgIGNvbnN0IGV2ZW50UG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIHx8IGN1ci5wb3M7XG4gICAgY29uc3QgZGVzdCA9IGJvYXJkLmdldEtleUF0RG9tUG9zKGV2ZW50UG9zLCBib2FyZC53aGl0ZVBvdihzKSwgcy5kb20uYm91bmRzKCkpO1xuICAgIGlmIChkZXN0ICYmIGN1ci5zdGFydGVkICYmIGN1ci5vcmlnICE9PSBkZXN0KSB7XG4gICAgICAgIGlmIChjdXIubmV3UGllY2UpXG4gICAgICAgICAgICBib2FyZC5kcm9wTmV3UGllY2UocywgY3VyLm9yaWcsIGRlc3QsIGN1ci5mb3JjZSk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICAgICAgICAgICAgaWYgKGJvYXJkLnVzZXJNb3ZlKHMsIGN1ci5vcmlnLCBkZXN0KSlcbiAgICAgICAgICAgICAgICBzLnN0YXRzLmRyYWdnZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGN1ci5uZXdQaWVjZSkge1xuICAgICAgICBzLnBpZWNlcy5kZWxldGUoY3VyLm9yaWcpO1xuICAgIH1cbiAgICBlbHNlIGlmIChzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYgJiYgIWRlc3QpIHtcbiAgICAgICAgcy5waWVjZXMuZGVsZXRlKGN1ci5vcmlnKTtcbiAgICAgICAgYm9hcmQuY2FsbFVzZXJGdW5jdGlvbihzLmV2ZW50cy5jaGFuZ2UpO1xuICAgIH1cbiAgICBpZiAoKGN1ci5vcmlnID09PSBjdXIucHJldmlvdXNseVNlbGVjdGVkIHx8IGN1ci5rZXlIYXNDaGFuZ2VkKSAmJiAoY3VyLm9yaWcgPT09IGRlc3QgfHwgIWRlc3QpKVxuICAgICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICBlbHNlIGlmICghcy5zZWxlY3RhYmxlLmVuYWJsZWQpXG4gICAgICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIHJlbW92ZURyYWdFbGVtZW50cyhzKTtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHMuZG9tLnJlZHJhdygpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbChzKSB7XG4gICAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgICBpZiAoY3VyKSB7XG4gICAgICAgIGlmIChjdXIubmV3UGllY2UpXG4gICAgICAgICAgICBzLnBpZWNlcy5kZWxldGUoY3VyLm9yaWcpO1xuICAgICAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICBib2FyZC51bnNlbGVjdChzKTtcbiAgICAgICAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuICAgICAgICBzLmRvbS5yZWRyYXcoKTtcbiAgICB9XG59XG5mdW5jdGlvbiByZW1vdmVEcmFnRWxlbWVudHMocykge1xuICAgIGNvbnN0IGUgPSBzLmRvbS5lbGVtZW50cztcbiAgICBpZiAoZS5naG9zdClcbiAgICAgICAgdXRpbC5zZXRWaXNpYmxlKGUuZ2hvc3QsIGZhbHNlKTtcbn1cbmZ1bmN0aW9uIHBpZWNlRWxlbWVudEJ5S2V5KHMsIGtleSkge1xuICAgIGxldCBlbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLmZpcnN0Q2hpbGQ7XG4gICAgd2hpbGUgKGVsKSB7XG4gICAgICAgIGlmIChlbC5jZ0tleSA9PT0ga2V5ICYmIGVsLnRhZ05hbWUgPT09ICdQSUVDRScpXG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIGVsID0gZWwubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIHJldHVybjtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRyYWcuanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIGV4cGxvc2lvbihzdGF0ZSwga2V5cykge1xuICAgIHN0YXRlLmV4cGxvZGluZyA9IHsgc3RhZ2U6IDEsIGtleXMgfTtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNldFN0YWdlKHN0YXRlLCAyKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRTdGFnZShzdGF0ZSwgdW5kZWZpbmVkKSwgMTIwKTtcbiAgICB9LCAxMjApO1xufVxuZnVuY3Rpb24gc2V0U3RhZ2Uoc3RhdGUsIHN0YWdlKSB7XG4gICAgaWYgKHN0YXRlLmV4cGxvZGluZykge1xuICAgICAgICBpZiAoc3RhZ2UpXG4gICAgICAgICAgICBzdGF0ZS5leHBsb2Rpbmcuc3RhZ2UgPSBzdGFnZTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3RhdGUuZXhwbG9kaW5nID0gdW5kZWZpbmVkO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXhwbG9zaW9uLmpzLm1hcCIsImltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQuanMnO1xuaW1wb3J0IHsgd3JpdGUgYXMgZmVuV3JpdGUgfSBmcm9tICcuL2Zlbi5qcyc7XG5pbXBvcnQgeyBjb25maWd1cmUsIGFwcGx5QW5pbWF0aW9uIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgYW5pbSwgcmVuZGVyIH0gZnJvbSAnLi9hbmltLmpzJztcbmltcG9ydCB7IGNhbmNlbCBhcyBkcmFnQ2FuY2VsLCBkcmFnTmV3UGllY2UgfSBmcm9tICcuL2RyYWcuanMnO1xuaW1wb3J0IHsgZXhwbG9zaW9uIH0gZnJvbSAnLi9leHBsb3Npb24uanMnO1xuLy8gc2VlIEFQSSB0eXBlcyBhbmQgZG9jdW1lbnRhdGlvbnMgaW4gZHRzL2FwaS5kLnRzXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGUsIHJlZHJhd0FsbCkge1xuICAgIGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKCkge1xuICAgICAgICBib2FyZC50b2dnbGVPcmllbnRhdGlvbihzdGF0ZSk7XG4gICAgICAgIHJlZHJhd0FsbCgpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBzZXQoY29uZmlnKSB7XG4gICAgICAgICAgICBpZiAoY29uZmlnLm9yaWVudGF0aW9uICYmIGNvbmZpZy5vcmllbnRhdGlvbiAhPT0gc3RhdGUub3JpZW50YXRpb24pXG4gICAgICAgICAgICAgICAgdG9nZ2xlT3JpZW50YXRpb24oKTtcbiAgICAgICAgICAgIGFwcGx5QW5pbWF0aW9uKHN0YXRlLCBjb25maWcpO1xuICAgICAgICAgICAgKGNvbmZpZy5mZW4gPyBhbmltIDogcmVuZGVyKShzdGF0ZSA9PiBjb25maWd1cmUoc3RhdGUsIGNvbmZpZyksIHN0YXRlKTtcbiAgICAgICAgfSxcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIGdldEZlbjogKCkgPT4gZmVuV3JpdGUoc3RhdGUucGllY2VzKSxcbiAgICAgICAgdG9nZ2xlT3JpZW50YXRpb24sXG4gICAgICAgIHNldFBpZWNlcyhwaWVjZXMpIHtcbiAgICAgICAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2V0UGllY2VzKHN0YXRlLCBwaWVjZXMpLCBzdGF0ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNlbGVjdFNxdWFyZShrZXksIGZvcmNlKSB7XG4gICAgICAgICAgICBpZiAoa2V5KVxuICAgICAgICAgICAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBrZXksIGZvcmNlKSwgc3RhdGUpO1xuICAgICAgICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgICAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtb3ZlKG9yaWcsIGRlc3QpIHtcbiAgICAgICAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpLCBzdGF0ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIG5ld1BpZWNlKHBpZWNlLCBrZXkpIHtcbiAgICAgICAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwga2V5KSwgc3RhdGUpO1xuICAgICAgICB9LFxuICAgICAgICBwbGF5UHJlbW92ZSgpIHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5pbShib2FyZC5wbGF5UHJlbW92ZSwgc3RhdGUpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgcHJlbW92ZSBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICAgICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgcGxheVByZWRyb3AodmFsaWRhdGUpIHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGJvYXJkLnBsYXlQcmVkcm9wKHN0YXRlLCB2YWxpZGF0ZSk7XG4gICAgICAgICAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIGNhbmNlbFByZW1vdmUoKSB7XG4gICAgICAgICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVtb3ZlLCBzdGF0ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhbmNlbFByZWRyb3AoKSB7XG4gICAgICAgICAgICByZW5kZXIoYm9hcmQudW5zZXRQcmVkcm9wLCBzdGF0ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhbmNlbE1vdmUoKSB7XG4gICAgICAgICAgICByZW5kZXIoc3RhdGUgPT4ge1xuICAgICAgICAgICAgICAgIGJvYXJkLmNhbmNlbE1vdmUoc3RhdGUpO1xuICAgICAgICAgICAgICAgIGRyYWdDYW5jZWwoc3RhdGUpO1xuICAgICAgICAgICAgfSwgc3RhdGUpO1xuICAgICAgICB9LFxuICAgICAgICBzdG9wKCkge1xuICAgICAgICAgICAgcmVuZGVyKHN0YXRlID0+IHtcbiAgICAgICAgICAgICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgICAgICAgICAgICBkcmFnQ2FuY2VsKHN0YXRlKTtcbiAgICAgICAgICAgIH0sIHN0YXRlKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXhwbG9kZShrZXlzKSB7XG4gICAgICAgICAgICBleHBsb3Npb24oc3RhdGUsIGtleXMpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRBdXRvU2hhcGVzKHNoYXBlcykge1xuICAgICAgICAgICAgcmVuZGVyKHN0YXRlID0+IChzdGF0ZS5kcmF3YWJsZS5hdXRvU2hhcGVzID0gc2hhcGVzKSwgc3RhdGUpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRTaGFwZXMoc2hhcGVzKSB7XG4gICAgICAgICAgICByZW5kZXIoc3RhdGUgPT4gKHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IHNoYXBlcyksIHN0YXRlKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0S2V5QXREb21Qb3MocG9zKSB7XG4gICAgICAgICAgICByZXR1cm4gYm9hcmQuZ2V0S2V5QXREb21Qb3MocG9zLCBib2FyZC53aGl0ZVBvdihzdGF0ZSksIHN0YXRlLmRvbS5ib3VuZHMoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlZHJhd0FsbCxcbiAgICAgICAgZHJhZ05ld1BpZWNlKHBpZWNlLCBldmVudCwgZm9yY2UpIHtcbiAgICAgICAgICAgIGRyYWdOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGV2ZW50LCBmb3JjZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3koKSB7XG4gICAgICAgICAgICBib2FyZC5zdG9wKHN0YXRlKTtcbiAgICAgICAgICAgIHN0YXRlLmRvbS51bmJpbmQgJiYgc3RhdGUuZG9tLnVuYmluZCgpO1xuICAgICAgICAgICAgc3RhdGUuZG9tLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIH0sXG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwaS5qcy5tYXAiLCJpbXBvcnQgKiBhcyBmZW4gZnJvbSAnLi9mZW4uanMnO1xuaW1wb3J0IHsgdGltZXIgfSBmcm9tICcuL3V0aWwuanMnO1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHBpZWNlczogZmVuLnJlYWQoZmVuLmluaXRpYWwpLFxuICAgICAgICBvcmllbnRhdGlvbjogJ3doaXRlJyxcbiAgICAgICAgdHVybkNvbG9yOiAnd2hpdGUnLFxuICAgICAgICBjb29yZGluYXRlczogdHJ1ZSxcbiAgICAgICAgcmFua3NQb3NpdGlvbjogJ3JpZ2h0JyxcbiAgICAgICAgYXV0b0Nhc3RsZTogdHJ1ZSxcbiAgICAgICAgdmlld09ubHk6IGZhbHNlLFxuICAgICAgICBkaXNhYmxlQ29udGV4dE1lbnU6IGZhbHNlLFxuICAgICAgICBhZGRQaWVjZVpJbmRleDogZmFsc2UsXG4gICAgICAgIGFkZERpbWVuc2lvbnNDc3NWYXJzOiBmYWxzZSxcbiAgICAgICAgYmxvY2tUb3VjaFNjcm9sbDogZmFsc2UsXG4gICAgICAgIHBpZWNlS2V5OiBmYWxzZSxcbiAgICAgICAgaGlnaGxpZ2h0OiB7XG4gICAgICAgICAgICBsYXN0TW92ZTogdHJ1ZSxcbiAgICAgICAgICAgIGNoZWNrOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBhbmltYXRpb246IHtcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBkdXJhdGlvbjogMjAwLFxuICAgICAgICB9LFxuICAgICAgICBtb3ZhYmxlOiB7XG4gICAgICAgICAgICBmcmVlOiB0cnVlLFxuICAgICAgICAgICAgY29sb3I6ICdib3RoJyxcbiAgICAgICAgICAgIHNob3dEZXN0czogdHJ1ZSxcbiAgICAgICAgICAgIGV2ZW50czoge30sXG4gICAgICAgICAgICByb29rQ2FzdGxlOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBwcmVtb3ZhYmxlOiB7XG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0Rlc3RzOiB0cnVlLFxuICAgICAgICAgICAgY2FzdGxlOiB0cnVlLFxuICAgICAgICAgICAgZXZlbnRzOiB7fSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJlZHJvcHBhYmxlOiB7XG4gICAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGV2ZW50czoge30sXG4gICAgICAgIH0sXG4gICAgICAgIGRyYWdnYWJsZToge1xuICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIGRpc3RhbmNlOiAzLFxuICAgICAgICAgICAgYXV0b0Rpc3RhbmNlOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0dob3N0OiB0cnVlLFxuICAgICAgICAgICAgZGVsZXRlT25Ecm9wT2ZmOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgZHJvcG1vZGU6IHtcbiAgICAgICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIHNlbGVjdGFibGU6IHtcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRzOiB7XG4gICAgICAgICAgICAvLyBvbiB0b3VjaHNjcmVlbiwgZGVmYXVsdCB0byBcInRhcC10YXBcIiBtb3Zlc1xuICAgICAgICAgICAgLy8gaW5zdGVhZCBvZiBkcmFnXG4gICAgICAgICAgICBkcmFnZ2VkOiAhKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyksXG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50czoge30sXG4gICAgICAgIGRyYXdhYmxlOiB7XG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGRlZmF1bHRTbmFwVG9WYWxpZE1vdmU6IHRydWUsXG4gICAgICAgICAgICBlcmFzZU9uQ2xpY2s6IHRydWUsXG4gICAgICAgICAgICBzaGFwZXM6IFtdLFxuICAgICAgICAgICAgYXV0b1NoYXBlczogW10sXG4gICAgICAgICAgICBicnVzaGVzOiB7XG4gICAgICAgICAgICAgICAgZ3JlZW46IHsga2V5OiAnZycsIGNvbG9yOiAnIzE1NzgxQicsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgICAgICAgICByZWQ6IHsga2V5OiAncicsIGNvbG9yOiAnIzg4MjAyMCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgICAgICAgICBibHVlOiB7IGtleTogJ2InLCBjb2xvcjogJyMwMDMwODgnLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgICAgICAgICAgeWVsbG93OiB7IGtleTogJ3knLCBjb2xvcjogJyNlNjhmMDAnLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgICAgICAgICAgcGFsZUJsdWU6IHsga2V5OiAncGInLCBjb2xvcjogJyMwMDMwODgnLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgICAgICAgICBwYWxlR3JlZW46IHsga2V5OiAncGcnLCBjb2xvcjogJyMxNTc4MUInLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgICAgICAgICBwYWxlUmVkOiB7IGtleTogJ3ByJywgY29sb3I6ICcjODgyMDIwJywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgICAgICAgICAgcGFsZUdyZXk6IHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiAncGdyJyxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNGE0YTRhJyxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMC4zNSxcbiAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAxNSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByZXZTdmdIYXNoOiAnJyxcbiAgICAgICAgfSxcbiAgICAgICAgaG9sZDogdGltZXIoKSxcbiAgICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3RhdGUuanMubWFwIiwiLy8gYXBwZW5kIGFuZCByZW1vdmUgb25seS4gTm8gdXBkYXRlcy5cbmV4cG9ydCBmdW5jdGlvbiBzeW5jU2hhcGVzKHNoYXBlcywgcm9vdCwgcmVuZGVyU2hhcGUpIHtcbiAgICBjb25zdCBoYXNoZXNJbkRvbSA9IG5ldyBNYXAoKSwgLy8gYnkgaGFzaFxuICAgIHRvUmVtb3ZlID0gW107XG4gICAgZm9yIChjb25zdCBzYyBvZiBzaGFwZXMpXG4gICAgICAgIGhhc2hlc0luRG9tLnNldChzYy5oYXNoLCBmYWxzZSk7XG4gICAgbGV0IGVsID0gcm9vdC5maXJzdENoaWxkLCBlbEhhc2g7XG4gICAgd2hpbGUgKGVsKSB7XG4gICAgICAgIGVsSGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnY2dIYXNoJyk7XG4gICAgICAgIC8vIGZvdW5kIGEgc2hhcGUgZWxlbWVudCB0aGF0J3MgaGVyZSB0byBzdGF5XG4gICAgICAgIGlmIChoYXNoZXNJbkRvbS5oYXMoZWxIYXNoKSlcbiAgICAgICAgICAgIGhhc2hlc0luRG9tLnNldChlbEhhc2gsIHRydWUpO1xuICAgICAgICAvLyBvciByZW1vdmUgaXRcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdG9SZW1vdmUucHVzaChlbCk7XG4gICAgICAgIGVsID0gZWwubmV4dFNpYmxpbmc7XG4gICAgfVxuICAgIC8vIHJlbW92ZSBvbGQgc2hhcGVzXG4gICAgZm9yIChjb25zdCBlbCBvZiB0b1JlbW92ZSlcbiAgICAgICAgcm9vdC5yZW1vdmVDaGlsZChlbCk7XG4gICAgLy8gaW5zZXJ0IHNoYXBlcyB0aGF0IGFyZSBub3QgeWV0IGluIGRvbVxuICAgIGZvciAoY29uc3Qgc2Mgb2Ygc2hhcGVzKSB7XG4gICAgICAgIGlmICghaGFzaGVzSW5Eb20uZ2V0KHNjLmhhc2gpKVxuICAgICAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChyZW5kZXJTaGFwZShzYykpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN5bmMuanMubWFwIiwiaW1wb3J0IHsga2V5MnBvcyB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBzeW5jU2hhcGVzIH0gZnJvbSAnLi9zeW5jLmpzJztcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIHRhZ05hbWUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclN2ZyhzdGF0ZSwgc3ZnLCBjdXN0b21TdmcpIHtcbiAgICBjb25zdCBkID0gc3RhdGUuZHJhd2FibGUsIGN1ckQgPSBkLmN1cnJlbnQsIGN1ciA9IGN1ckQgJiYgY3VyRC5tb3VzZVNxID8gY3VyRCA6IHVuZGVmaW5lZCwgYXJyb3dEZXN0cyA9IG5ldyBNYXAoKSwgYm91bmRzID0gc3RhdGUuZG9tLmJvdW5kcygpLCBub25QaWVjZUF1dG9TaGFwZXMgPSBkLmF1dG9TaGFwZXMuZmlsdGVyKGF1dG9TaGFwZSA9PiAhYXV0b1NoYXBlLnBpZWNlKTtcbiAgICBmb3IgKGNvbnN0IHMgb2YgZC5zaGFwZXMuY29uY2F0KG5vblBpZWNlQXV0b1NoYXBlcykuY29uY2F0KGN1ciA/IFtjdXJdIDogW10pKSB7XG4gICAgICAgIGlmIChzLmRlc3QpXG4gICAgICAgICAgICBhcnJvd0Rlc3RzLnNldChzLmRlc3QsIChhcnJvd0Rlc3RzLmdldChzLmRlc3QpIHx8IDApICsgMSk7XG4gICAgfVxuICAgIGNvbnN0IHNoYXBlcyA9IGQuc2hhcGVzLmNvbmNhdChub25QaWVjZUF1dG9TaGFwZXMpLm1hcCgocykgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2hhcGU6IHMsXG4gICAgICAgICAgICBjdXJyZW50OiBmYWxzZSxcbiAgICAgICAgICAgIGhhc2g6IHNoYXBlSGFzaChzLCBhcnJvd0Rlc3RzLCBmYWxzZSwgYm91bmRzKSxcbiAgICAgICAgfTtcbiAgICB9KTtcbiAgICBpZiAoY3VyKVxuICAgICAgICBzaGFwZXMucHVzaCh7XG4gICAgICAgICAgICBzaGFwZTogY3VyLFxuICAgICAgICAgICAgY3VycmVudDogdHJ1ZSxcbiAgICAgICAgICAgIGhhc2g6IHNoYXBlSGFzaChjdXIsIGFycm93RGVzdHMsIHRydWUsIGJvdW5kcyksXG4gICAgICAgIH0pO1xuICAgIGNvbnN0IGZ1bGxIYXNoID0gc2hhcGVzLm1hcChzYyA9PiBzYy5oYXNoKS5qb2luKCc7Jyk7XG4gICAgaWYgKGZ1bGxIYXNoID09PSBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaClcbiAgICAgICAgcmV0dXJuO1xuICAgIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gZnVsbEhhc2g7XG4gICAgLypcbiAgICAgIC0tIERPTSBoaWVyYXJjaHkgLS1cbiAgICAgIDxzdmcgY2xhc3M9XCJjZy1zaGFwZXNcIj4gICAgICAoPD0gc3ZnKVxuICAgICAgICA8ZGVmcz5cbiAgICAgICAgICAuLi4oZm9yIGJydXNoZXMpLi4uXG4gICAgICAgIDwvZGVmcz5cbiAgICAgICAgPGc+XG4gICAgICAgICAgLi4uKGZvciBhcnJvd3MgYW5kIGNpcmNsZXMpLi4uXG4gICAgICAgIDwvZz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPHN2ZyBjbGFzcz1cImNnLWN1c3RvbS1zdmdzXCI+ICg8PSBjdXN0b21TdmcpXG4gICAgICAgIDxnPlxuICAgICAgICAgIC4uLihmb3IgY3VzdG9tIHN2Z3MpLi4uXG4gICAgICAgIDwvZz5cbiAgICAgIDwvc3ZnPlxuICAgICovXG4gICAgY29uc3QgZGVmc0VsID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoJ2RlZnMnKTtcbiAgICBjb25zdCBzaGFwZXNFbCA9IHN2Zy5xdWVyeVNlbGVjdG9yKCdnJyk7XG4gICAgY29uc3QgY3VzdG9tU3Znc0VsID0gY3VzdG9tU3ZnLnF1ZXJ5U2VsZWN0b3IoJ2cnKTtcbiAgICBzeW5jRGVmcyhkLCBzaGFwZXMsIGRlZnNFbCk7XG4gICAgc3luY1NoYXBlcyhzaGFwZXMuZmlsdGVyKHMgPT4gIXMuc2hhcGUuY3VzdG9tU3ZnKSwgc2hhcGVzRWwsIHNoYXBlID0+IHJlbmRlclNoYXBlKHN0YXRlLCBzaGFwZSwgZC5icnVzaGVzLCBhcnJvd0Rlc3RzLCBib3VuZHMpKTtcbiAgICBzeW5jU2hhcGVzKHNoYXBlcy5maWx0ZXIocyA9PiBzLnNoYXBlLmN1c3RvbVN2ZyksIGN1c3RvbVN2Z3NFbCwgc2hhcGUgPT4gcmVuZGVyU2hhcGUoc3RhdGUsIHNoYXBlLCBkLmJydXNoZXMsIGFycm93RGVzdHMsIGJvdW5kcykpO1xufVxuLy8gYXBwZW5kIG9ubHkuIERvbid0IHRyeSB0byB1cGRhdGUvcmVtb3ZlLlxuZnVuY3Rpb24gc3luY0RlZnMoZCwgc2hhcGVzLCBkZWZzRWwpIHtcbiAgICBjb25zdCBicnVzaGVzID0gbmV3IE1hcCgpO1xuICAgIGxldCBicnVzaDtcbiAgICBmb3IgKGNvbnN0IHMgb2Ygc2hhcGVzKSB7XG4gICAgICAgIGlmIChzLnNoYXBlLmRlc3QpIHtcbiAgICAgICAgICAgIGJydXNoID0gZC5icnVzaGVzW3Muc2hhcGUuYnJ1c2hdO1xuICAgICAgICAgICAgaWYgKHMuc2hhcGUubW9kaWZpZXJzKVxuICAgICAgICAgICAgICAgIGJydXNoID0gbWFrZUN1c3RvbUJydXNoKGJydXNoLCBzLnNoYXBlLm1vZGlmaWVycyk7XG4gICAgICAgICAgICBicnVzaGVzLnNldChicnVzaC5rZXksIGJydXNoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBrZXlzSW5Eb20gPSBuZXcgU2V0KCk7XG4gICAgbGV0IGVsID0gZGVmc0VsLmZpcnN0Q2hpbGQ7XG4gICAgd2hpbGUgKGVsKSB7XG4gICAgICAgIGtleXNJbkRvbS5hZGQoZWwuZ2V0QXR0cmlidXRlKCdjZ0tleScpKTtcbiAgICAgICAgZWwgPSBlbC5uZXh0U2libGluZztcbiAgICB9XG4gICAgZm9yIChjb25zdCBba2V5LCBicnVzaF0gb2YgYnJ1c2hlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKCFrZXlzSW5Eb20uaGFzKGtleSkpXG4gICAgICAgICAgICBkZWZzRWwuYXBwZW5kQ2hpbGQocmVuZGVyTWFya2VyKGJydXNoKSk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2hhcGVIYXNoKHsgb3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBtb2RpZmllcnMsIGN1c3RvbVN2ZyB9LCBhcnJvd0Rlc3RzLCBjdXJyZW50LCBib3VuZHMpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICBib3VuZHMud2lkdGgsXG4gICAgICAgIGJvdW5kcy5oZWlnaHQsXG4gICAgICAgIGN1cnJlbnQsXG4gICAgICAgIG9yaWcsXG4gICAgICAgIGRlc3QsXG4gICAgICAgIGJydXNoLFxuICAgICAgICBkZXN0ICYmIChhcnJvd0Rlc3RzLmdldChkZXN0KSB8fCAwKSA+IDEsXG4gICAgICAgIHBpZWNlICYmIHBpZWNlSGFzaChwaWVjZSksXG4gICAgICAgIG1vZGlmaWVycyAmJiBtb2RpZmllcnNIYXNoKG1vZGlmaWVycyksXG4gICAgICAgIGN1c3RvbVN2ZyAmJiBjdXN0b21TdmdIYXNoKGN1c3RvbVN2ZyksXG4gICAgXVxuICAgICAgICAuZmlsdGVyKHggPT4geClcbiAgICAgICAgLmpvaW4oJywnKTtcbn1cbmZ1bmN0aW9uIHBpZWNlSGFzaChwaWVjZSkge1xuICAgIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcsJyk7XG59XG5mdW5jdGlvbiBtb2RpZmllcnNIYXNoKG0pIHtcbiAgICByZXR1cm4gJycgKyAobS5saW5lV2lkdGggfHwgJycpO1xufVxuZnVuY3Rpb24gY3VzdG9tU3ZnSGFzaChzKSB7XG4gICAgLy8gUm9sbGluZyBoYXNoIHdpdGggYmFzZSAzMSAoY2YuIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzc2MTY0NjEvZ2VuZXJhdGUtYS1oYXNoLWZyb20tc3RyaW5nLWluLWphdmFzY3JpcHQpXG4gICAgbGV0IGggPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBoID0gKChoIDw8IDUpIC0gaCArIHMuY2hhckNvZGVBdChpKSkgPj4+IDA7XG4gICAgfVxuICAgIHJldHVybiAnY3VzdG9tLScgKyBoLnRvU3RyaW5nKCk7XG59XG5mdW5jdGlvbiByZW5kZXJTaGFwZShzdGF0ZSwgeyBzaGFwZSwgY3VycmVudCwgaGFzaCB9LCBicnVzaGVzLCBhcnJvd0Rlc3RzLCBib3VuZHMpIHtcbiAgICBsZXQgZWw7XG4gICAgY29uc3Qgb3JpZyA9IG9yaWVudChrZXkycG9zKHNoYXBlLm9yaWcpLCBzdGF0ZS5vcmllbnRhdGlvbik7XG4gICAgaWYgKHNoYXBlLmN1c3RvbVN2Zykge1xuICAgICAgICBlbCA9IHJlbmRlckN1c3RvbVN2ZyhzaGFwZS5jdXN0b21TdmcsIG9yaWcsIGJvdW5kcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoc2hhcGUuZGVzdCkge1xuICAgICAgICAgICAgbGV0IGJydXNoID0gYnJ1c2hlc1tzaGFwZS5icnVzaF07XG4gICAgICAgICAgICBpZiAoc2hhcGUubW9kaWZpZXJzKVxuICAgICAgICAgICAgICAgIGJydXNoID0gbWFrZUN1c3RvbUJydXNoKGJydXNoLCBzaGFwZS5tb2RpZmllcnMpO1xuICAgICAgICAgICAgZWwgPSByZW5kZXJBcnJvdyhicnVzaCwgb3JpZywgb3JpZW50KGtleTJwb3Moc2hhcGUuZGVzdCksIHN0YXRlLm9yaWVudGF0aW9uKSwgY3VycmVudCwgKGFycm93RGVzdHMuZ2V0KHNoYXBlLmRlc3QpIHx8IDApID4gMSwgYm91bmRzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBlbCA9IHJlbmRlckNpcmNsZShicnVzaGVzW3NoYXBlLmJydXNoXSwgb3JpZywgY3VycmVudCwgYm91bmRzKTtcbiAgICB9XG4gICAgZWwuc2V0QXR0cmlidXRlKCdjZ0hhc2gnLCBoYXNoKTtcbiAgICByZXR1cm4gZWw7XG59XG5mdW5jdGlvbiByZW5kZXJDdXN0b21TdmcoY3VzdG9tU3ZnLCBwb3MsIGJvdW5kcykge1xuICAgIGNvbnN0IFt4LCB5XSA9IHBvczJ1c2VyKHBvcywgYm91bmRzKTtcbiAgICAvLyBUcmFuc2xhdGUgdG8gdG9wLWxlZnQgb2YgYG9yaWdgIHNxdWFyZVxuICAgIGNvbnN0IGcgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ2cnKSwgeyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt4fSwke3l9KWAgfSk7XG4gICAgLy8gR2l2ZSAxMDB4MTAwIGNvb3JkaW5hdGUgc3lzdGVtIHRvIHRoZSB1c2VyIGZvciBgb3JpZ2Agc3F1YXJlXG4gICAgY29uc3Qgc3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdzdmcnKSwgeyB3aWR0aDogMSwgaGVpZ2h0OiAxLCB2aWV3Qm94OiAnMCAwIDEwMCAxMDAnIH0pO1xuICAgIGcuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgICBzdmcuaW5uZXJIVE1MID0gY3VzdG9tU3ZnO1xuICAgIHJldHVybiBnO1xufVxuZnVuY3Rpb24gcmVuZGVyQ2lyY2xlKGJydXNoLCBwb3MsIGN1cnJlbnQsIGJvdW5kcykge1xuICAgIGNvbnN0IG8gPSBwb3MydXNlcihwb3MsIGJvdW5kcyksIHdpZHRocyA9IGNpcmNsZVdpZHRoKCksIHJhZGl1cyA9IChib3VuZHMud2lkdGggKyBib3VuZHMuaGVpZ2h0KSAvICg0ICogTWF0aC5tYXgoYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0KSk7XG4gICAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgnY2lyY2xlJyksIHtcbiAgICAgICAgc3Ryb2tlOiBicnVzaC5jb2xvcixcbiAgICAgICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoc1tjdXJyZW50ID8gMCA6IDFdLFxuICAgICAgICBmaWxsOiAnbm9uZScsXG4gICAgICAgIG9wYWNpdHk6IG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpLFxuICAgICAgICBjeDogb1swXSxcbiAgICAgICAgY3k6IG9bMV0sXG4gICAgICAgIHI6IHJhZGl1cyAtIHdpZHRoc1sxXSAvIDIsXG4gICAgfSk7XG59XG5mdW5jdGlvbiByZW5kZXJBcnJvdyhicnVzaCwgb3JpZywgZGVzdCwgY3VycmVudCwgc2hvcnRlbiwgYm91bmRzKSB7XG4gICAgY29uc3QgbSA9IGFycm93TWFyZ2luKHNob3J0ZW4gJiYgIWN1cnJlbnQpLCBhID0gcG9zMnVzZXIob3JpZywgYm91bmRzKSwgYiA9IHBvczJ1c2VyKGRlc3QsIGJvdW5kcyksIGR4ID0gYlswXSAtIGFbMF0sIGR5ID0gYlsxXSAtIGFbMV0sIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpLCB4byA9IE1hdGguY29zKGFuZ2xlKSAqIG0sIHlvID0gTWF0aC5zaW4oYW5nbGUpICogbTtcbiAgICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdsaW5lJyksIHtcbiAgICAgICAgc3Ryb2tlOiBicnVzaC5jb2xvcixcbiAgICAgICAgJ3N0cm9rZS13aWR0aCc6IGxpbmVXaWR0aChicnVzaCwgY3VycmVudCksXG4gICAgICAgICdzdHJva2UtbGluZWNhcCc6ICdyb3VuZCcsXG4gICAgICAgICdtYXJrZXItZW5kJzogJ3VybCgjYXJyb3doZWFkLScgKyBicnVzaC5rZXkgKyAnKScsXG4gICAgICAgIG9wYWNpdHk6IG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpLFxuICAgICAgICB4MTogYVswXSxcbiAgICAgICAgeTE6IGFbMV0sXG4gICAgICAgIHgyOiBiWzBdIC0geG8sXG4gICAgICAgIHkyOiBiWzFdIC0geW8sXG4gICAgfSk7XG59XG5mdW5jdGlvbiByZW5kZXJNYXJrZXIoYnJ1c2gpIHtcbiAgICBjb25zdCBtYXJrZXIgPSBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ21hcmtlcicpLCB7XG4gICAgICAgIGlkOiAnYXJyb3doZWFkLScgKyBicnVzaC5rZXksXG4gICAgICAgIG9yaWVudDogJ2F1dG8nLFxuICAgICAgICBtYXJrZXJXaWR0aDogNCxcbiAgICAgICAgbWFya2VySGVpZ2h0OiA4LFxuICAgICAgICByZWZYOiAyLjA1LFxuICAgICAgICByZWZZOiAyLjAxLFxuICAgIH0pO1xuICAgIG1hcmtlci5hcHBlbmRDaGlsZChzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ3BhdGgnKSwge1xuICAgICAgICBkOiAnTTAsMCBWNCBMMywyIFonLFxuICAgICAgICBmaWxsOiBicnVzaC5jb2xvcixcbiAgICB9KSk7XG4gICAgbWFya2VyLnNldEF0dHJpYnV0ZSgnY2dLZXknLCBicnVzaC5rZXkpO1xuICAgIHJldHVybiBtYXJrZXI7XG59XG5leHBvcnQgZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhlbCwgYXR0cnMpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRycylcbiAgICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gICAgcmV0dXJuIGVsO1xufVxuZnVuY3Rpb24gb3JpZW50KHBvcywgY29sb3IpIHtcbiAgICByZXR1cm4gY29sb3IgPT09ICd3aGl0ZScgPyBwb3MgOiBbNyAtIHBvc1swXSwgNyAtIHBvc1sxXV07XG59XG5mdW5jdGlvbiBtYWtlQ3VzdG9tQnJ1c2goYmFzZSwgbW9kaWZpZXJzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29sb3I6IGJhc2UuY29sb3IsXG4gICAgICAgIG9wYWNpdHk6IE1hdGgucm91bmQoYmFzZS5vcGFjaXR5ICogMTApIC8gMTAsXG4gICAgICAgIGxpbmVXaWR0aDogTWF0aC5yb3VuZChtb2RpZmllcnMubGluZVdpZHRoIHx8IGJhc2UubGluZVdpZHRoKSxcbiAgICAgICAga2V5OiBbYmFzZS5rZXksIG1vZGlmaWVycy5saW5lV2lkdGhdLmZpbHRlcih4ID0+IHgpLmpvaW4oJycpLFxuICAgIH07XG59XG5mdW5jdGlvbiBjaXJjbGVXaWR0aCgpIHtcbiAgICByZXR1cm4gWzMgLyA2NCwgNCAvIDY0XTtcbn1cbmZ1bmN0aW9uIGxpbmVXaWR0aChicnVzaCwgY3VycmVudCkge1xuICAgIHJldHVybiAoKGJydXNoLmxpbmVXaWR0aCB8fCAxMCkgKiAoY3VycmVudCA/IDAuODUgOiAxKSkgLyA2NDtcbn1cbmZ1bmN0aW9uIG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpIHtcbiAgICByZXR1cm4gKGJydXNoLm9wYWNpdHkgfHwgMSkgKiAoY3VycmVudCA/IDAuOSA6IDEpO1xufVxuZnVuY3Rpb24gYXJyb3dNYXJnaW4oc2hvcnRlbikge1xuICAgIHJldHVybiAoc2hvcnRlbiA/IDIwIDogMTApIC8gNjQ7XG59XG5mdW5jdGlvbiBwb3MydXNlcihwb3MsIGJvdW5kcykge1xuICAgIGNvbnN0IHhTY2FsZSA9IE1hdGgubWluKDEsIGJvdW5kcy53aWR0aCAvIGJvdW5kcy5oZWlnaHQpO1xuICAgIGNvbnN0IHlTY2FsZSA9IE1hdGgubWluKDEsIGJvdW5kcy5oZWlnaHQgLyBib3VuZHMud2lkdGgpO1xuICAgIHJldHVybiBbKHBvc1swXSAtIDMuNSkgKiB4U2NhbGUsICgzLjUgLSBwb3NbMV0pICogeVNjYWxlXTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN2Zy5qcy5tYXAiLCJpbXBvcnQgeyBzZXRWaXNpYmxlLCBjcmVhdGVFbCB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyBjb2xvcnMsIGZpbGVzLCByYW5rcyB9IGZyb20gJy4vdHlwZXMuanMnO1xuaW1wb3J0IHsgY3JlYXRlRWxlbWVudCBhcyBjcmVhdGVTVkcsIHNldEF0dHJpYnV0ZXMgfSBmcm9tICcuL3N2Zy5qcyc7XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyV3JhcChlbGVtZW50LCBzKSB7XG4gICAgLy8gLmNnLXdyYXAgKGVsZW1lbnQgcGFzc2VkIHRvIENoZXNzZ3JvdW5kKVxuICAgIC8vICAgY2ctY29udGFpbmVyXG4gICAgLy8gICAgIGNnLWJvYXJkXG4gICAgLy8gICAgIHN2Zy5jZy1zaGFwZXNcbiAgICAvLyAgICAgICBkZWZzXG4gICAgLy8gICAgICAgZ1xuICAgIC8vICAgICBzdmcuY2ctY3VzdG9tLXN2Z3NcbiAgICAvLyAgICAgICBnXG4gICAgLy8gICAgIGNnLWF1dG8tcGllY2VzXG4gICAgLy8gICAgIGNvb3Jkcy5yYW5rc1xuICAgIC8vICAgICBjb29yZHMuZmlsZXNcbiAgICAvLyAgICAgcGllY2UuZ2hvc3RcbiAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgIC8vIGVuc3VyZSB0aGUgY2ctd3JhcCBjbGFzcyBpcyBzZXRcbiAgICAvLyBzbyBib3VuZHMgY2FsY3VsYXRpb24gY2FuIHVzZSB0aGUgQ1NTIHdpZHRoL2hlaWdodCB2YWx1ZXNcbiAgICAvLyBhZGQgdGhhdCBjbGFzcyB5b3Vyc2VsZiB0byB0aGUgZWxlbWVudCBiZWZvcmUgY2FsbGluZyBjaGVzc2dyb3VuZFxuICAgIC8vIGZvciBhIHNsaWdodCBwZXJmb3JtYW5jZSBpbXByb3ZlbWVudCEgKGF2b2lkcyByZWNvbXB1dGluZyBzdHlsZSlcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NnLXdyYXAnKTtcbiAgICBmb3IgKGNvbnN0IGMgb2YgY29sb3JzKVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ29yaWVudGF0aW9uLScgKyBjLCBzLm9yaWVudGF0aW9uID09PSBjKTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ21hbmlwdWxhYmxlJywgIXMudmlld09ubHkpO1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGNyZWF0ZUVsKCdjZy1jb250YWluZXInKTtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgY29uc3QgYm9hcmQgPSBjcmVhdGVFbCgnY2ctYm9hcmQnKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm9hcmQpO1xuICAgIGxldCBzdmc7XG4gICAgbGV0IGN1c3RvbVN2ZztcbiAgICBsZXQgYXV0b1BpZWNlcztcbiAgICBpZiAocy5kcmF3YWJsZS52aXNpYmxlKSB7XG4gICAgICAgIHN2ZyA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlU1ZHKCdzdmcnKSwge1xuICAgICAgICAgICAgY2xhc3M6ICdjZy1zaGFwZXMnLFxuICAgICAgICAgICAgdmlld0JveDogJy00IC00IDggOCcsXG4gICAgICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvOiAneE1pZFlNaWQgc2xpY2UnLFxuICAgICAgICB9KTtcbiAgICAgICAgc3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWRygnZGVmcycpKTtcbiAgICAgICAgc3ZnLmFwcGVuZENoaWxkKGNyZWF0ZVNWRygnZycpKTtcbiAgICAgICAgY3VzdG9tU3ZnID0gc2V0QXR0cmlidXRlcyhjcmVhdGVTVkcoJ3N2ZycpLCB7XG4gICAgICAgICAgICBjbGFzczogJ2NnLWN1c3RvbS1zdmdzJyxcbiAgICAgICAgICAgIHZpZXdCb3g6ICctMy41IC0zLjUgOCA4JyxcbiAgICAgICAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW86ICd4TWlkWU1pZCBzbGljZScsXG4gICAgICAgIH0pO1xuICAgICAgICBjdXN0b21TdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHKCdnJykpO1xuICAgICAgICBhdXRvUGllY2VzID0gY3JlYXRlRWwoJ2NnLWF1dG8tcGllY2VzJyk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzdmcpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY3VzdG9tU3ZnKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGF1dG9QaWVjZXMpO1xuICAgIH1cbiAgICBpZiAocy5jb29yZGluYXRlcykge1xuICAgICAgICBjb25zdCBvcmllbnRDbGFzcyA9IHMub3JpZW50YXRpb24gPT09ICdibGFjaycgPyAnIGJsYWNrJyA6ICcnO1xuICAgICAgICBjb25zdCByYW5rc1Bvc2l0aW9uQ2xhc3MgPSBzLnJhbmtzUG9zaXRpb24gPT09ICdsZWZ0JyA/ICcgbGVmdCcgOiAnJztcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhyYW5rcywgJ3JhbmtzJyArIG9yaWVudENsYXNzICsgcmFua3NQb3NpdGlvbkNsYXNzKSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsICdmaWxlcycgKyBvcmllbnRDbGFzcykpO1xuICAgIH1cbiAgICBsZXQgZ2hvc3Q7XG4gICAgaWYgKHMuZHJhZ2dhYmxlLnNob3dHaG9zdCkge1xuICAgICAgICBnaG9zdCA9IGNyZWF0ZUVsKCdwaWVjZScsICdnaG9zdCcpO1xuICAgICAgICBzZXRWaXNpYmxlKGdob3N0LCBmYWxzZSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChnaG9zdCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGJvYXJkLFxuICAgICAgICBjb250YWluZXIsXG4gICAgICAgIHdyYXA6IGVsZW1lbnQsXG4gICAgICAgIGdob3N0LFxuICAgICAgICBzdmcsXG4gICAgICAgIGN1c3RvbVN2ZyxcbiAgICAgICAgYXV0b1BpZWNlcyxcbiAgICB9O1xufVxuZnVuY3Rpb24gcmVuZGVyQ29vcmRzKGVsZW1zLCBjbGFzc05hbWUpIHtcbiAgICBjb25zdCBlbCA9IGNyZWF0ZUVsKCdjb29yZHMnLCBjbGFzc05hbWUpO1xuICAgIGxldCBmO1xuICAgIGZvciAoY29uc3QgZWxlbSBvZiBlbGVtcykge1xuICAgICAgICBmID0gY3JlYXRlRWwoJ2Nvb3JkJyk7XG4gICAgICAgIGYudGV4dENvbnRlbnQgPSBlbGVtO1xuICAgICAgICBlbC5hcHBlbmRDaGlsZChmKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d3JhcC5qcy5tYXAiLCJpbXBvcnQgKiBhcyBib2FyZCBmcm9tICcuL2JvYXJkLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcbmltcG9ydCB7IGNhbmNlbCBhcyBkcmFnQ2FuY2VsIH0gZnJvbSAnLi9kcmFnLmpzJztcbmV4cG9ydCBmdW5jdGlvbiBzZXREcm9wTW9kZShzLCBwaWVjZSkge1xuICAgIHMuZHJvcG1vZGUgPSB7XG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgcGllY2UsXG4gICAgfTtcbiAgICBkcmFnQ2FuY2VsKHMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbERyb3BNb2RlKHMpIHtcbiAgICBzLmRyb3Btb2RlID0ge1xuICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gZHJvcChzLCBlKSB7XG4gICAgaWYgKCFzLmRyb3Btb2RlLmFjdGl2ZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgICBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gICAgY29uc3QgcGllY2UgPSBzLmRyb3Btb2RlLnBpZWNlO1xuICAgIGlmIChwaWVjZSkge1xuICAgICAgICBzLnBpZWNlcy5zZXQoJ2EwJywgcGllY2UpO1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKTtcbiAgICAgICAgY29uc3QgZGVzdCA9IHBvc2l0aW9uICYmIGJvYXJkLmdldEtleUF0RG9tUG9zKHBvc2l0aW9uLCBib2FyZC53aGl0ZVBvdihzKSwgcy5kb20uYm91bmRzKCkpO1xuICAgICAgICBpZiAoZGVzdClcbiAgICAgICAgICAgIGJvYXJkLmRyb3BOZXdQaWVjZShzLCAnYTAnLCBkZXN0KTtcbiAgICB9XG4gICAgcy5kb20ucmVkcmF3KCk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kcm9wLmpzLm1hcCIsImltcG9ydCAqIGFzIGRyYWcgZnJvbSAnLi9kcmFnLmpzJztcbmltcG9ydCAqIGFzIGRyYXcgZnJvbSAnLi9kcmF3LmpzJztcbmltcG9ydCB7IGRyb3AgfSBmcm9tICcuL2Ryb3AuanMnO1xuaW1wb3J0IHsgaXNSaWdodEJ1dHRvbiB9IGZyb20gJy4vdXRpbC5qcyc7XG5leHBvcnQgZnVuY3Rpb24gYmluZEJvYXJkKHMsIG9uUmVzaXplKSB7XG4gICAgY29uc3QgYm9hcmRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkO1xuICAgIGlmICgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdylcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKS5vYnNlcnZlKHMuZG9tLmVsZW1lbnRzLndyYXApO1xuICAgIGlmIChzLnZpZXdPbmx5KVxuICAgICAgICByZXR1cm47XG4gICAgLy8gQ2Fubm90IGJlIHBhc3NpdmUsIGJlY2F1c2Ugd2UgcHJldmVudCB0b3VjaCBzY3JvbGxpbmcgYW5kIGRyYWdnaW5nIG9mXG4gICAgLy8gc2VsZWN0ZWQgZWxlbWVudHMuXG4gICAgY29uc3Qgb25TdGFydCA9IHN0YXJ0RHJhZ09yRHJhdyhzKTtcbiAgICBib2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblN0YXJ0LCB7XG4gICAgICAgIHBhc3NpdmU6IGZhbHNlLFxuICAgIH0pO1xuICAgIGJvYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25TdGFydCwge1xuICAgICAgICBwYXNzaXZlOiBmYWxzZSxcbiAgICB9KTtcbiAgICBpZiAocy5kaXNhYmxlQ29udGV4dE1lbnUgfHwgcy5kcmF3YWJsZS5lbmFibGVkKSB7XG4gICAgICAgIGJvYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBlID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gICAgfVxufVxuLy8gcmV0dXJucyB0aGUgdW5iaW5kIGZ1bmN0aW9uXG5leHBvcnQgZnVuY3Rpb24gYmluZERvY3VtZW50KHMsIG9uUmVzaXplKSB7XG4gICAgY29uc3QgdW5iaW5kcyA9IFtdO1xuICAgIC8vIE9sZCB2ZXJzaW9ucyBvZiBFZGdlIGFuZCBTYWZhcmkgZG8gbm90IHN1cHBvcnQgUmVzaXplT2JzZXJ2ZXIuIFNlbmRcbiAgICAvLyBjaGVzc2dyb3VuZC5yZXNpemUgaWYgYSB1c2VyIGFjdGlvbiBoYXMgY2hhbmdlZCB0aGUgYm91bmRzIG9mIHRoZSBib2FyZC5cbiAgICBpZiAoISgnUmVzaXplT2JzZXJ2ZXInIGluIHdpbmRvdykpXG4gICAgICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LmJvZHksICdjaGVzc2dyb3VuZC5yZXNpemUnLCBvblJlc2l6ZSkpO1xuICAgIGlmICghcy52aWV3T25seSkge1xuICAgICAgICBjb25zdCBvbm1vdmUgPSBkcmFnT3JEcmF3KHMsIGRyYWcubW92ZSwgZHJhdy5tb3ZlKTtcbiAgICAgICAgY29uc3Qgb25lbmQgPSBkcmFnT3JEcmF3KHMsIGRyYWcuZW5kLCBkcmF3LmVuZCk7XG4gICAgICAgIGZvciAoY29uc3QgZXYgb2YgWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ10pXG4gICAgICAgICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9ubW92ZSkpO1xuICAgICAgICBmb3IgKGNvbnN0IGV2IG9mIFsndG91Y2hlbmQnLCAnbW91c2V1cCddKVxuICAgICAgICAgICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbmVuZCkpO1xuICAgICAgICBjb25zdCBvblNjcm9sbCA9ICgpID0+IHMuZG9tLmJvdW5kcy5jbGVhcigpO1xuICAgICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgJ3Njcm9sbCcsIG9uU2Nyb2xsLCB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfSkpO1xuICAgICAgICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZSh3aW5kb3csICdyZXNpemUnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlIH0pKTtcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHVuYmluZHMuZm9yRWFjaChmID0+IGYoKSk7XG59XG5mdW5jdGlvbiB1bmJpbmRhYmxlKGVsLCBldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHN0YXJ0RHJhZ09yRHJhdyhzKSB7XG4gICAgcmV0dXJuIGUgPT4ge1xuICAgICAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudClcbiAgICAgICAgICAgIGRyYWcuY2FuY2VsKHMpO1xuICAgICAgICBlbHNlIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpXG4gICAgICAgICAgICBkcmF3LmNhbmNlbChzKTtcbiAgICAgICAgZWxzZSBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpKSB7XG4gICAgICAgICAgICBpZiAocy5kcmF3YWJsZS5lbmFibGVkKVxuICAgICAgICAgICAgICAgIGRyYXcuc3RhcnQocywgZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXMudmlld09ubHkpIHtcbiAgICAgICAgICAgIGlmIChzLmRyb3Btb2RlLmFjdGl2ZSlcbiAgICAgICAgICAgICAgICBkcm9wKHMsIGUpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRyYWcuc3RhcnQocywgZSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gZHJhZ09yRHJhdyhzLCB3aXRoRHJhZywgd2l0aERyYXcpIHtcbiAgICByZXR1cm4gZSA9PiB7XG4gICAgICAgIGlmIChzLmRyYXdhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpXG4gICAgICAgICAgICAgICAgd2l0aERyYXcocywgZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIXMudmlld09ubHkpXG4gICAgICAgICAgICB3aXRoRHJhZyhzLCBlKTtcbiAgICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXZlbnRzLmpzLm1hcCIsImltcG9ydCB7IGtleTJwb3MsIGNyZWF0ZUVsLCBwb3NUb1RyYW5zbGF0ZSBhcyBwb3NUb1RyYW5zbGF0ZUZyb21Cb3VuZHMsIHRyYW5zbGF0ZSB9IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQgeyB3aGl0ZVBvdiB9IGZyb20gJy4vYm9hcmQuanMnO1xuLy8gcG9ydGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3ZlbG9jZS9saWNob2JpbGUvYmxvYi9tYXN0ZXIvc3JjL2pzL2NoZXNzZ3JvdW5kL3ZpZXcuanNcbi8vIGluIGNhc2Ugb2YgYnVncywgYmxhbWUgQHZlbG9jZVxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcihzKSB7XG4gICAgY29uc3QgYXNXaGl0ZSA9IHdoaXRlUG92KHMpLCBwb3NUb1RyYW5zbGF0ZSA9IHBvc1RvVHJhbnNsYXRlRnJvbUJvdW5kcyhzLmRvbS5ib3VuZHMoKSksIGJvYXJkRWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZCwgcGllY2VzID0gcy5waWVjZXMsIGN1ckFuaW0gPSBzLmFuaW1hdGlvbi5jdXJyZW50LCBhbmltcyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uYW5pbXMgOiBuZXcgTWFwKCksIGZhZGluZ3MgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmZhZGluZ3MgOiBuZXcgTWFwKCksIGN1ckRyYWcgPSBzLmRyYWdnYWJsZS5jdXJyZW50LCBzcXVhcmVzID0gY29tcHV0ZVNxdWFyZUNsYXNzZXMocyksIHNhbWVQaWVjZXMgPSBuZXcgU2V0KCksIHNhbWVTcXVhcmVzID0gbmV3IFNldCgpLCBtb3ZlZFBpZWNlcyA9IG5ldyBNYXAoKSwgbW92ZWRTcXVhcmVzID0gbmV3IE1hcCgpOyAvLyBieSBjbGFzcyBuYW1lXG4gICAgbGV0IGssIGVsLCBwaWVjZUF0S2V5LCBlbFBpZWNlTmFtZSwgYW5pbSwgZmFkaW5nLCBwTXZkc2V0LCBwTXZkLCBzTXZkc2V0LCBzTXZkO1xuICAgIC8vIHdhbGsgb3ZlciBhbGwgYm9hcmQgZG9tIGVsZW1lbnRzLCBhcHBseSBhbmltYXRpb25zIGFuZCBmbGFnIG1vdmVkIHBpZWNlc1xuICAgIGVsID0gYm9hcmRFbC5maXJzdENoaWxkO1xuICAgIHdoaWxlIChlbCkge1xuICAgICAgICBrID0gZWwuY2dLZXk7XG4gICAgICAgIGlmIChpc1BpZWNlTm9kZShlbCkpIHtcbiAgICAgICAgICAgIHBpZWNlQXRLZXkgPSBwaWVjZXMuZ2V0KGspO1xuICAgICAgICAgICAgYW5pbSA9IGFuaW1zLmdldChrKTtcbiAgICAgICAgICAgIGZhZGluZyA9IGZhZGluZ3MuZ2V0KGspO1xuICAgICAgICAgICAgZWxQaWVjZU5hbWUgPSBlbC5jZ1BpZWNlO1xuICAgICAgICAgICAgLy8gaWYgcGllY2Ugbm90IGJlaW5nIGRyYWdnZWQgYW55bW9yZSwgcmVtb3ZlIGRyYWdnaW5nIHN0eWxlXG4gICAgICAgICAgICBpZiAoZWwuY2dEcmFnZ2luZyAmJiAoIWN1ckRyYWcgfHwgY3VyRHJhZy5vcmlnICE9PSBrKSkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdnaW5nJyk7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1doaXRlKSk7XG4gICAgICAgICAgICAgICAgZWwuY2dEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVtb3ZlIGZhZGluZyBjbGFzcyBpZiBpdCBzdGlsbCByZW1haW5zXG4gICAgICAgICAgICBpZiAoIWZhZGluZyAmJiBlbC5jZ0ZhZGluZykge1xuICAgICAgICAgICAgICAgIGVsLmNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZmFkaW5nJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0aGVyZSBpcyBub3cgYSBwaWVjZSBhdCB0aGlzIGRvbSBrZXlcbiAgICAgICAgICAgIGlmIChwaWVjZUF0S2V5KSB7XG4gICAgICAgICAgICAgICAgLy8gY29udGludWUgYW5pbWF0aW9uIGlmIGFscmVhZHkgYW5pbWF0aW5nIGFuZCBzYW1lIHBpZWNlXG4gICAgICAgICAgICAgICAgLy8gKG90aGVyd2lzZSBpdCBjb3VsZCBhbmltYXRlIGEgY2FwdHVyZWQgcGllY2UpXG4gICAgICAgICAgICAgICAgaWYgKGFuaW0gJiYgZWwuY2dBbmltYXRpbmcgJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgICAgICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgICAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnYW5pbScpO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChlbC5jZ0FuaW1hdGluZykge1xuICAgICAgICAgICAgICAgICAgICBlbC5jZ0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdhbmltJyk7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZShlbCwgcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhrKSwgYXNXaGl0ZSkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocy5hZGRQaWVjZVpJbmRleClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChrZXkycG9zKGspLCBhc1doaXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gc2FtZSBwaWVjZTogZmxhZyBhcyBzYW1lXG4gICAgICAgICAgICAgICAgaWYgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSAmJiAoIWZhZGluZyB8fCAhZWwuY2dGYWRpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNhbWVQaWVjZXMuYWRkKGspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBkaWZmZXJlbnQgcGllY2U6IGZsYWcgYXMgbW92ZWQgdW5sZXNzIGl0IGlzIGEgZmFkaW5nIHBpZWNlXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmYWRpbmcgJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKGZhZGluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2ZhZGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuY2dGYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwZW5kVmFsdWUobW92ZWRQaWVjZXMsIGVsUGllY2VOYW1lLCBlbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBubyBwaWVjZTogZmxhZyBhcyBtb3ZlZFxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXBwZW5kVmFsdWUobW92ZWRQaWVjZXMsIGVsUGllY2VOYW1lLCBlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNTcXVhcmVOb2RlKGVsKSkge1xuICAgICAgICAgICAgY29uc3QgY24gPSBlbC5jbGFzc05hbWU7XG4gICAgICAgICAgICBpZiAoc3F1YXJlcy5nZXQoaykgPT09IGNuKVxuICAgICAgICAgICAgICAgIHNhbWVTcXVhcmVzLmFkZChrKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBhcHBlbmRWYWx1ZShtb3ZlZFNxdWFyZXMsIGNuLCBlbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWwgPSBlbC5uZXh0U2libGluZztcbiAgICB9XG4gICAgLy8gd2FsayBvdmVyIGFsbCBzcXVhcmVzIGluIGN1cnJlbnQgc2V0LCBhcHBseSBkb20gY2hhbmdlcyB0byBtb3ZlZCBzcXVhcmVzXG4gICAgLy8gb3IgYXBwZW5kIG5ldyBzcXVhcmVzXG4gICAgZm9yIChjb25zdCBbc2ssIGNsYXNzTmFtZV0gb2Ygc3F1YXJlcykge1xuICAgICAgICBpZiAoIXNhbWVTcXVhcmVzLmhhcyhzaykpIHtcbiAgICAgICAgICAgIHNNdmRzZXQgPSBtb3ZlZFNxdWFyZXMuZ2V0KGNsYXNzTmFtZSk7XG4gICAgICAgICAgICBzTXZkID0gc012ZHNldCAmJiBzTXZkc2V0LnBvcCgpO1xuICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKHNrKSwgYXNXaGl0ZSk7XG4gICAgICAgICAgICBpZiAoc012ZCkge1xuICAgICAgICAgICAgICAgIHNNdmQuY2dLZXkgPSBzaztcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUoc012ZCwgdHJhbnNsYXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3F1YXJlTm9kZSA9IGNyZWF0ZUVsKCdzcXVhcmUnLCBjbGFzc05hbWUpO1xuICAgICAgICAgICAgICAgIHNxdWFyZU5vZGUuY2dLZXkgPSBzaztcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUoc3F1YXJlTm9kZSwgdHJhbnNsYXRpb24pO1xuICAgICAgICAgICAgICAgIGJvYXJkRWwuaW5zZXJ0QmVmb3JlKHNxdWFyZU5vZGUsIGJvYXJkRWwuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gd2FsayBvdmVyIGFsbCBwaWVjZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHBpZWNlc1xuICAgIC8vIG9yIGFwcGVuZCBuZXcgcGllY2VzXG4gICAgZm9yIChjb25zdCBbaywgcF0gb2YgcGllY2VzKSB7XG4gICAgICAgIGFuaW0gPSBhbmltcy5nZXQoayk7XG4gICAgICAgIGlmICghc2FtZVBpZWNlcy5oYXMoaykpIHtcbiAgICAgICAgICAgIHBNdmRzZXQgPSBtb3ZlZFBpZWNlcy5nZXQocGllY2VOYW1lT2YocCkpO1xuICAgICAgICAgICAgcE12ZCA9IHBNdmRzZXQgJiYgcE12ZHNldC5wb3AoKTtcbiAgICAgICAgICAgIC8vIGEgc2FtZSBwaWVjZSB3YXMgbW92ZWRcbiAgICAgICAgICAgIGlmIChwTXZkKSB7XG4gICAgICAgICAgICAgICAgLy8gYXBwbHkgZG9tIGNoYW5nZXNcbiAgICAgICAgICAgICAgICBwTXZkLmNnS2V5ID0gaztcbiAgICAgICAgICAgICAgICBpZiAocE12ZC5jZ0ZhZGluZykge1xuICAgICAgICAgICAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgICAgICAgICAgICAgICBwTXZkLmNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgICAgICAgICAgaWYgKHMuYWRkUGllY2VaSW5kZXgpXG4gICAgICAgICAgICAgICAgICAgIHBNdmQuc3R5bGUuekluZGV4ID0gcG9zWkluZGV4KHBvcywgYXNXaGl0ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcE12ZC5jZ0FuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHBNdmQuY2xhc3NMaXN0LmFkZCgnYW5pbScpO1xuICAgICAgICAgICAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZShwTXZkLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzV2hpdGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG5vIHBpZWNlIGluIG1vdmVkIG9iajogaW5zZXJ0IHRoZSBuZXcgcGllY2VcbiAgICAgICAgICAgIC8vIGFzc3VtZXMgdGhlIG5ldyBwaWVjZSBpcyBub3QgYmVpbmcgZHJhZ2dlZFxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGllY2VOYW1lID0gcGllY2VOYW1lT2YocCksIHBpZWNlTm9kZSA9IGNyZWF0ZUVsKCdwaWVjZScsIHBpZWNlTmFtZSksIHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgICAgICAgICAgcGllY2VOb2RlLmNnUGllY2UgPSBwaWVjZU5hbWU7XG4gICAgICAgICAgICAgICAgcGllY2VOb2RlLmNnS2V5ID0gaztcbiAgICAgICAgICAgICAgICBpZiAoYW5pbSkge1xuICAgICAgICAgICAgICAgICAgICBwaWVjZU5vZGUuY2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZShwaWVjZU5vZGUsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuICAgICAgICAgICAgICAgIGlmIChzLmFkZFBpZWNlWkluZGV4KVxuICAgICAgICAgICAgICAgICAgICBwaWVjZU5vZGUuc3R5bGUuekluZGV4ID0gcG9zWkluZGV4KHBvcywgYXNXaGl0ZSk7XG4gICAgICAgICAgICAgICAgYm9hcmRFbC5hcHBlbmRDaGlsZChwaWVjZU5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIHJlbW92ZSBhbnkgZWxlbWVudCB0aGF0IHJlbWFpbnMgaW4gdGhlIG1vdmVkIHNldHNcbiAgICBmb3IgKGNvbnN0IG5vZGVzIG9mIG1vdmVkUGllY2VzLnZhbHVlcygpKVxuICAgICAgICByZW1vdmVOb2RlcyhzLCBub2Rlcyk7XG4gICAgZm9yIChjb25zdCBub2RlcyBvZiBtb3ZlZFNxdWFyZXMudmFsdWVzKCkpXG4gICAgICAgIHJlbW92ZU5vZGVzKHMsIG5vZGVzKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJSZXNpemVkKHMpIHtcbiAgICBjb25zdCBhc1doaXRlID0gd2hpdGVQb3YocyksIHBvc1RvVHJhbnNsYXRlID0gcG9zVG9UcmFuc2xhdGVGcm9tQm91bmRzKHMuZG9tLmJvdW5kcygpKTtcbiAgICBsZXQgZWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZC5maXJzdENoaWxkO1xuICAgIHdoaWxlIChlbCkge1xuICAgICAgICBpZiAoKGlzUGllY2VOb2RlKGVsKSAmJiAhZWwuY2dBbmltYXRpbmcpIHx8IGlzU3F1YXJlTm9kZShlbCkpIHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZShlbCwgcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhlbC5jZ0tleSksIGFzV2hpdGUpKTtcbiAgICAgICAgfVxuICAgICAgICBlbCA9IGVsLm5leHRTaWJsaW5nO1xuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVCb3VuZHMocykge1xuICAgIGNvbnN0IGJvdW5kcyA9IHMuZG9tLmVsZW1lbnRzLndyYXAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgY29udGFpbmVyID0gcy5kb20uZWxlbWVudHMuY29udGFpbmVyO1xuICAgIGNvbnN0IHJhdGlvID0gYm91bmRzLmhlaWdodCAvIGJvdW5kcy53aWR0aDtcbiAgICBjb25zdCB3aWR0aCA9IChNYXRoLmZsb29yKChib3VuZHMud2lkdGggKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbykgLyA4KSAqIDgpIC8gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgY29uc3QgaGVpZ2h0ID0gd2lkdGggKiByYXRpbztcbiAgICBjb250YWluZXIuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCc7XG4gICAgY29udGFpbmVyLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgcy5kb20uYm91bmRzLmNsZWFyKCk7XG4gICAgaWYgKHMuYWRkRGltZW5zaW9uc0Nzc1ZhcnMpIHtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLWNnLXdpZHRoJywgd2lkdGggKyAncHgnKTtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCctLWNnLWhlaWdodCcsIGhlaWdodCArICdweCcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzUGllY2VOb2RlKGVsKSB7XG4gICAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdQSUVDRSc7XG59XG5mdW5jdGlvbiBpc1NxdWFyZU5vZGUoZWwpIHtcbiAgICByZXR1cm4gZWwudGFnTmFtZSA9PT0gJ1NRVUFSRSc7XG59XG5mdW5jdGlvbiByZW1vdmVOb2RlcyhzLCBub2Rlcykge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2RlcylcbiAgICAgICAgcy5kb20uZWxlbWVudHMuYm9hcmQucmVtb3ZlQ2hpbGQobm9kZSk7XG59XG5mdW5jdGlvbiBwb3NaSW5kZXgocG9zLCBhc1doaXRlKSB7XG4gICAgY29uc3QgbWluWiA9IDM7XG4gICAgY29uc3QgcmFuayA9IHBvc1sxXTtcbiAgICBjb25zdCB6ID0gYXNXaGl0ZSA/IG1pblogKyA3IC0gcmFuayA6IG1pblogKyByYW5rO1xuICAgIHJldHVybiBgJHt6fWA7XG59XG5mdW5jdGlvbiBwaWVjZU5hbWVPZihwaWVjZSkge1xuICAgIHJldHVybiBgJHtwaWVjZS5jb2xvcn0gJHtwaWVjZS5yb2xlfWA7XG59XG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzKSB7XG4gICAgdmFyIF9hO1xuICAgIGNvbnN0IHNxdWFyZXMgPSBuZXcgTWFwKCk7XG4gICAgaWYgKHMubGFzdE1vdmUgJiYgcy5oaWdobGlnaHQubGFzdE1vdmUpXG4gICAgICAgIGZvciAoY29uc3QgayBvZiBzLmxhc3RNb3ZlKSB7XG4gICAgICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ2xhc3QtbW92ZScpO1xuICAgICAgICB9XG4gICAgaWYgKHMuY2hlY2sgJiYgcy5oaWdobGlnaHQuY2hlY2spXG4gICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLmNoZWNrLCAnY2hlY2snKTtcbiAgICBpZiAocy5zZWxlY3RlZCkge1xuICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgcy5zZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XG4gICAgICAgIGlmIChzLm1vdmFibGUuc2hvd0Rlc3RzKSB7XG4gICAgICAgICAgICBjb25zdCBkZXN0cyA9IChfYSA9IHMubW92YWJsZS5kZXN0cykgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdldChzLnNlbGVjdGVkKTtcbiAgICAgICAgICAgIGlmIChkZXN0cylcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGsgb2YgZGVzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdtb3ZlLWRlc3QnICsgKHMucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJycpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwRGVzdHMgPSBzLnByZW1vdmFibGUuZGVzdHM7XG4gICAgICAgICAgICBpZiAocERlc3RzKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgayBvZiBwRGVzdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdwcmVtb3ZlLWRlc3QnICsgKHMucGllY2VzLmhhcyhrKSA/ICcgb2MnIDogJycpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcHJlbW92ZSA9IHMucHJlbW92YWJsZS5jdXJyZW50O1xuICAgIGlmIChwcmVtb3ZlKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2YgcHJlbW92ZSlcbiAgICAgICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnY3VycmVudC1wcmVtb3ZlJyk7XG4gICAgZWxzZSBpZiAocy5wcmVkcm9wcGFibGUuY3VycmVudClcbiAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIHMucHJlZHJvcHBhYmxlLmN1cnJlbnQua2V5LCAnY3VycmVudC1wcmVtb3ZlJyk7XG4gICAgY29uc3QgbyA9IHMuZXhwbG9kaW5nO1xuICAgIGlmIChvKVxuICAgICAgICBmb3IgKGNvbnN0IGsgb2Ygby5rZXlzKVxuICAgICAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdleHBsb2RpbmcnICsgby5zdGFnZSk7XG4gICAgcmV0dXJuIHNxdWFyZXM7XG59XG5mdW5jdGlvbiBhZGRTcXVhcmUoc3F1YXJlcywga2V5LCBrbGFzcykge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBzcXVhcmVzLmdldChrZXkpO1xuICAgIGlmIChjbGFzc2VzKVxuICAgICAgICBzcXVhcmVzLnNldChrZXksIGAke2NsYXNzZXN9ICR7a2xhc3N9YCk7XG4gICAgZWxzZVxuICAgICAgICBzcXVhcmVzLnNldChrZXksIGtsYXNzKTtcbn1cbmZ1bmN0aW9uIGFwcGVuZFZhbHVlKG1hcCwga2V5LCB2YWx1ZSkge1xuICAgIGNvbnN0IGFyciA9IG1hcC5nZXQoa2V5KTtcbiAgICBpZiAoYXJyKVxuICAgICAgICBhcnIucHVzaCh2YWx1ZSk7XG4gICAgZWxzZVxuICAgICAgICBtYXAuc2V0KGtleSwgW3ZhbHVlXSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZW5kZXIuanMubWFwIiwiaW1wb3J0IHsga2V5MnBvcywgY3JlYXRlRWwsIHBvc1RvVHJhbnNsYXRlIGFzIHBvc1RvVHJhbnNsYXRlRnJvbUJvdW5kcywgdHJhbnNsYXRlQW5kU2NhbGUgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHsgd2hpdGVQb3YgfSBmcm9tICcuL2JvYXJkJztcbmltcG9ydCB7IHN5bmNTaGFwZXMgfSBmcm9tICcuL3N5bmMnO1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcihzdGF0ZSwgYXV0b1BpZWNlRWwpIHtcbiAgICBjb25zdCBhdXRvUGllY2VzID0gc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcy5maWx0ZXIoYXV0b1NoYXBlID0+IGF1dG9TaGFwZS5waWVjZSk7XG4gICAgY29uc3QgYXV0b1BpZWNlU2hhcGVzID0gYXV0b1BpZWNlcy5tYXAoKHMpID0+IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNoYXBlOiBzLFxuICAgICAgICAgICAgaGFzaDogaGFzaChzKSxcbiAgICAgICAgICAgIGN1cnJlbnQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH0pO1xuICAgIHN5bmNTaGFwZXMoYXV0b1BpZWNlU2hhcGVzLCBhdXRvUGllY2VFbCwgc2hhcGUgPT4gcmVuZGVyU2hhcGUoc3RhdGUsIHNoYXBlLCBzdGF0ZS5kb20uYm91bmRzKCkpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJSZXNpemVkKHN0YXRlKSB7XG4gICAgdmFyIF9hO1xuICAgIGNvbnN0IGFzV2hpdGUgPSB3aGl0ZVBvdihzdGF0ZSksIHBvc1RvVHJhbnNsYXRlID0gcG9zVG9UcmFuc2xhdGVGcm9tQm91bmRzKHN0YXRlLmRvbS5ib3VuZHMoKSk7XG4gICAgbGV0IGVsID0gKF9hID0gc3RhdGUuZG9tLmVsZW1lbnRzLmF1dG9QaWVjZXMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5maXJzdENoaWxkO1xuICAgIHdoaWxlIChlbCkge1xuICAgICAgICB0cmFuc2xhdGVBbmRTY2FsZShlbCwgcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhlbC5jZ0tleSksIGFzV2hpdGUpLCBlbC5jZ1NjYWxlKTtcbiAgICAgICAgZWwgPSBlbC5uZXh0U2libGluZztcbiAgICB9XG59XG5mdW5jdGlvbiByZW5kZXJTaGFwZShzdGF0ZSwgeyBzaGFwZSwgaGFzaCB9LCBib3VuZHMpIHtcbiAgICB2YXIgX2EsIF9iLCBfYztcbiAgICBjb25zdCBvcmlnID0gc2hhcGUub3JpZztcbiAgICBjb25zdCByb2xlID0gKF9hID0gc2hhcGUucGllY2UpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5yb2xlO1xuICAgIGNvbnN0IGNvbG9yID0gKF9iID0gc2hhcGUucGllY2UpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5jb2xvcjtcbiAgICBjb25zdCBzY2FsZSA9IChfYyA9IHNoYXBlLnBpZWNlKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Muc2NhbGU7XG4gICAgY29uc3QgcGllY2VFbCA9IGNyZWF0ZUVsKCdwaWVjZScsIGAke3JvbGV9ICR7Y29sb3J9YCk7XG4gICAgcGllY2VFbC5zZXRBdHRyaWJ1dGUoJ2NnSGFzaCcsIGhhc2gpO1xuICAgIHBpZWNlRWwuY2dLZXkgPSBvcmlnO1xuICAgIHBpZWNlRWwuY2dTY2FsZSA9IHNjYWxlO1xuICAgIHRyYW5zbGF0ZUFuZFNjYWxlKHBpZWNlRWwsIHBvc1RvVHJhbnNsYXRlRnJvbUJvdW5kcyhib3VuZHMpKGtleTJwb3Mob3JpZyksIHdoaXRlUG92KHN0YXRlKSksIHNjYWxlKTtcbiAgICByZXR1cm4gcGllY2VFbDtcbn1cbmZ1bmN0aW9uIGhhc2goYXV0b1BpZWNlKSB7XG4gICAgdmFyIF9hLCBfYiwgX2M7XG4gICAgcmV0dXJuIFthdXRvUGllY2Uub3JpZywgKF9hID0gYXV0b1BpZWNlLnBpZWNlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Eucm9sZSwgKF9iID0gYXV0b1BpZWNlLnBpZWNlKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY29sb3IsIChfYyA9IGF1dG9QaWVjZS5waWVjZSkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLnNjYWxlXS5qb2luKCcsJyk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdXRvUGllY2VzLmpzLm1hcCIsImltcG9ydCB7IHN0YXJ0IH0gZnJvbSAnLi9hcGkuanMnO1xuaW1wb3J0IHsgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcuanMnO1xuaW1wb3J0IHsgZGVmYXVsdHMgfSBmcm9tICcuL3N0YXRlLmpzJztcbmltcG9ydCB7IHJlbmRlcldyYXAgfSBmcm9tICcuL3dyYXAuanMnO1xuaW1wb3J0ICogYXMgZXZlbnRzIGZyb20gJy4vZXZlbnRzLmpzJztcbmltcG9ydCB7IHJlbmRlciwgcmVuZGVyUmVzaXplZCwgdXBkYXRlQm91bmRzIH0gZnJvbSAnLi9yZW5kZXIuanMnO1xuaW1wb3J0ICogYXMgYXV0b1BpZWNlcyBmcm9tICcuL2F1dG9QaWVjZXMuanMnO1xuaW1wb3J0ICogYXMgc3ZnIGZyb20gJy4vc3ZnLmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcbmV4cG9ydCBmdW5jdGlvbiBDaGVzc2dyb3VuZChlbGVtZW50LCBjb25maWcpIHtcbiAgICBjb25zdCBtYXliZVN0YXRlID0gZGVmYXVsdHMoKTtcbiAgICBjb25maWd1cmUobWF5YmVTdGF0ZSwgY29uZmlnIHx8IHt9KTtcbiAgICBmdW5jdGlvbiByZWRyYXdBbGwoKSB7XG4gICAgICAgIGNvbnN0IHByZXZVbmJpbmQgPSAnZG9tJyBpbiBtYXliZVN0YXRlID8gbWF5YmVTdGF0ZS5kb20udW5iaW5kIDogdW5kZWZpbmVkO1xuICAgICAgICAvLyBjb21wdXRlIGJvdW5kcyBmcm9tIGV4aXN0aW5nIGJvYXJkIGVsZW1lbnQgaWYgcG9zc2libGVcbiAgICAgICAgLy8gdGhpcyBhbGxvd3Mgbm9uLXNxdWFyZSBib2FyZHMgZnJvbSBDU1MgdG8gYmUgaGFuZGxlZCAoZm9yIDNEKVxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHJlbmRlcldyYXAoZWxlbWVudCwgbWF5YmVTdGF0ZSksIGJvdW5kcyA9IHV0aWwubWVtbygoKSA9PiBlbGVtZW50cy5ib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSksIHJlZHJhd05vdyA9IChza2lwU3ZnKSA9PiB7XG4gICAgICAgICAgICByZW5kZXIoc3RhdGUpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRzLmF1dG9QaWVjZXMpXG4gICAgICAgICAgICAgICAgYXV0b1BpZWNlcy5yZW5kZXIoc3RhdGUsIGVsZW1lbnRzLmF1dG9QaWVjZXMpO1xuICAgICAgICAgICAgaWYgKCFza2lwU3ZnICYmIGVsZW1lbnRzLnN2ZylcbiAgICAgICAgICAgICAgICBzdmcucmVuZGVyU3ZnKHN0YXRlLCBlbGVtZW50cy5zdmcsIGVsZW1lbnRzLmN1c3RvbVN2Zyk7XG4gICAgICAgIH0sIG9uUmVzaXplID0gKCkgPT4ge1xuICAgICAgICAgICAgdXBkYXRlQm91bmRzKHN0YXRlKTtcbiAgICAgICAgICAgIHJlbmRlclJlc2l6ZWQoc3RhdGUpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRzLmF1dG9QaWVjZXMpXG4gICAgICAgICAgICAgICAgYXV0b1BpZWNlcy5yZW5kZXJSZXNpemVkKHN0YXRlKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBtYXliZVN0YXRlO1xuICAgICAgICBzdGF0ZS5kb20gPSB7XG4gICAgICAgICAgICBlbGVtZW50cyxcbiAgICAgICAgICAgIGJvdW5kcyxcbiAgICAgICAgICAgIHJlZHJhdzogZGVib3VuY2VSZWRyYXcocmVkcmF3Tm93KSxcbiAgICAgICAgICAgIHJlZHJhd05vdyxcbiAgICAgICAgICAgIHVuYmluZDogcHJldlVuYmluZCxcbiAgICAgICAgfTtcbiAgICAgICAgc3RhdGUuZHJhd2FibGUucHJldlN2Z0hhc2ggPSAnJztcbiAgICAgICAgdXBkYXRlQm91bmRzKHN0YXRlKTtcbiAgICAgICAgcmVkcmF3Tm93KGZhbHNlKTtcbiAgICAgICAgZXZlbnRzLmJpbmRCb2FyZChzdGF0ZSwgb25SZXNpemUpO1xuICAgICAgICBpZiAoIXByZXZVbmJpbmQpXG4gICAgICAgICAgICBzdGF0ZS5kb20udW5iaW5kID0gZXZlbnRzLmJpbmREb2N1bWVudChzdGF0ZSwgb25SZXNpemUpO1xuICAgICAgICBzdGF0ZS5ldmVudHMuaW5zZXJ0ICYmIHN0YXRlLmV2ZW50cy5pbnNlcnQoZWxlbWVudHMpO1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuICAgIHJldHVybiBzdGFydChyZWRyYXdBbGwoKSwgcmVkcmF3QWxsKTtcbn1cbmZ1bmN0aW9uIGRlYm91bmNlUmVkcmF3KHJlZHJhd05vdykge1xuICAgIGxldCByZWRyYXdpbmcgPSBmYWxzZTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZiAocmVkcmF3aW5nKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICByZWRyYXdpbmcgPSB0cnVlO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgcmVkcmF3Tm93KCk7XG4gICAgICAgICAgICByZWRyYXdpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNoZXNzZ3JvdW5kLmpzLm1hcCIsImltcG9ydCB7IHBhcnNlWWFtbCB9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5cclxuaW1wb3J0IHsgQ2hlc3NlclNldHRpbmdzIH0gZnJvbSBcIi4vQ2hlc3NlclNldHRpbmdzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENoZXNzZXJDb25maWcgZXh0ZW5kcyBDaGVzc2VyU2V0dGluZ3Mge1xyXG4gIGlkPzogc3RyaW5nO1xyXG4gIGZlbjogc3RyaW5nO1xyXG4gIHBnbj86IHN0cmluZztcclxuICBzaGFwZXM/OiBhbnk7XHJcbiAgY3VycmVudE1vdmVJZHg/OiBudW1iZXI7XHJcbiAgbW92ZXM/OiBzdHJpbmdbXTtcclxufVxyXG5cclxuY29uc3QgT1JJRU5UQVRJT05TID0gW1wid2hpdGVcIiwgXCJibGFja1wiXTtcclxuZXhwb3J0IGNvbnN0IFBJRUNFX1NUWUxFUyA9IFtcclxuICBcImFscGhhXCIsXHJcbiAgXCJjYWxpZm9ybmlhXCIsXHJcbiAgXCJjYXJkaW5hbFwiLFxyXG4gIFwiY2J1cm5ldHRcIixcclxuICBcImNoZXNzN1wiLFxyXG4gIFwiY2hlc3NudXRcIixcclxuICBcImNvbXBhbmlvblwiLFxyXG4gIFwiZHVicm92bnlcIixcclxuICBcImZhbnRhc3lcIixcclxuICBcImZyZXNjYVwiLFxyXG4gIFwiZ2lvY29cIixcclxuICBcImdvdmVybm9yXCIsXHJcbiAgXCJob3JzZXlcIixcclxuICBcImljcGllY2VzXCIsXHJcbiAgXCJrb3NhbFwiLFxyXG4gIFwibGVpcHppZ1wiLFxyXG4gIFwibGV0dGVyXCIsXHJcbiAgXCJsaWJyYVwiLFxyXG4gIFwibWFlc3Ryb1wiLFxyXG4gIFwibWVyaWRhXCIsXHJcbiAgXCJwaXJvdWV0dGlcIixcclxuICBcInBpeGVsXCIsXHJcbiAgXCJyZWlsbHljcmFpZ1wiLFxyXG4gIFwicmlvaGFjaGFcIixcclxuICBcInNoYXBlc1wiLFxyXG4gIFwic3BhdGlhbFwiLFxyXG4gIFwic3RhdW50eVwiLFxyXG4gIFwidGF0aWFuYVwiLFxyXG5dO1xyXG5leHBvcnQgY29uc3QgQk9BUkRfU1RZTEVTID0gW1wiYmx1ZVwiLCBcImJyb3duXCIsIFwiZ3JlZW5cIiwgXCJpY1wiLCBcInB1cnBsZVwiXTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZV91c2VyX2NvbmZpZyhcclxuICBzZXR0aW5nczogQ2hlc3NlclNldHRpbmdzLFxyXG4gIGNvbnRlbnQ6IHN0cmluZ1xyXG4pOiBDaGVzc2VyQ29uZmlnIHtcclxuICBsZXQgdXNlckNvbmZpZzogQ2hlc3NlckNvbmZpZyA9IHtcclxuICAgIC4uLnNldHRpbmdzLFxyXG4gICAgZmVuOiBcIlwiLFxyXG4gIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAuLi51c2VyQ29uZmlnLFxyXG4gICAgICAuLi5wYXJzZVlhbWwoY29udGVudCksXHJcbiAgICB9O1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIC8vIGZhaWxlZCB0byBwYXJzZVxyXG4gICAgcmV0dXJuIHVzZXJDb25maWc7XHJcbiAgfVxyXG59XHJcbiIsImV4cG9ydCBjbGFzcyBTdGFydGluZ1Bvc2l0aW9uIHtcclxuICBlY286IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgZmVuOiBzdHJpbmc7XHJcbiAgd2lraVBhdGg6IHN0cmluZztcclxuICBtb3Zlczogc3RyaW5nW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKGVjbzogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGZlbjogc3RyaW5nLCB3aWtpUGF0aDogc3RyaW5nLCBtb3Zlczogc3RyaW5nW10pIHtcclxuICAgIHRoaXMuZWNvID0gZWNvO1xyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuZmVuID0gZmVuO1xyXG4gICAgdGhpcy53aWtpUGF0aCA9IHdpa2lQYXRoO1xyXG4gICAgdGhpcy5tb3ZlcyA9IG1vdmVzO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENhdGVnb3J5IHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGl0ZW1zOiBTdGFydGluZ1Bvc2l0aW9uW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIGl0ZW1zOiBTdGFydGluZ1Bvc2l0aW9uW10pIHtcclxuICAgIHRoaXMuaWQgPSBpZDtcclxuICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IGNhdGVnb3JpZXMgPSBbXHJcbiAgbmV3IENhdGVnb3J5KFwiZTRcIiwgW1xyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQjAwXCIsXHJcbiAgICAgIFwiS2luZydzIFBhd25cIixcclxuICAgICAgXCJybmJxa2Juci9wcHBwcHBwcC84LzgvNFAzLzgvUFBQUDFQUFAvUk5CUUtCTlIgYiBLUWtxIC0gMCAxXCIsXHJcbiAgICAgIFwiS2luZydzX1Bhd25fR2FtZVwiLFxyXG4gICAgICBbXCJlNFwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkIwMFwiLFxyXG4gICAgICBcIk9wZW4gR2FtZVwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcHAxcHBwLzgvNHAzLzRQMy84L1BQUFAxUFBQL1JOQlFLQk5SIHcgS1FrcSAtIDAgMlwiLFxyXG4gICAgICBcIk9wZW5fR2FtZVwiLFxyXG4gICAgICBbXCJlNCBlNVwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkIwMlwiLFxyXG4gICAgICBcIkFsZWtoaW5lJ3MgRGVmZW5jZVwiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwcHBwcHBwLzVuMi84LzRQMy84L1BQUFAxUFBQL1JOQlFLQk5SIHcgS1FrcSAtIDEgMlwiLFxyXG4gICAgICBcIkFsZWtoaW5lJ3NfRGVmZW5jZVwiLFxyXG4gICAgICBbXCJlNCBOZjZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMDRcIixcclxuICAgICAgXCJBbGVraGluZSdzIERlZmVuY2U6IE1vZGVybiBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxa2Ixci9wcHAxcHBwcC8zcDQvM25QMy8zUDQvNU4yL1BQUDJQUFAvUk5CUUtCMVIgYiBLUWtxIC0gMSA0XCIsXHJcbiAgICAgIFwiQWxla2hpbmUnc19EZWZlbmNlI01vZGVybl9WYXJpYXRpb246XzMuZDRfZDZfNC5OZjNcIixcclxuICAgICAgW1wiZTQgTmY2XCIsIFwiZTUgTmQ1XCIsIFwiZDQgZDZcIiwgXCJOZjNcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDMjNcIixcclxuICAgICAgXCJCaXNob3AncyBPcGVuaW5nXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcDFwcHAvOC80cDMvMkIxUDMvOC9QUFBQMVBQUC9STkJRSzFOUiBiIEtRa3EgLSAxIDJcIixcclxuICAgICAgXCJCaXNob3AlMjdzX09wZW5pbmdcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJCYzRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMTBcIixcclxuICAgICAgXCJDYXJvLUthbm4gRGVmZW5jZVwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwMXBwcHBwLzJwNS84LzRQMy84L1BQUFAxUFBQL1JOQlFLQk5SIHcgS1FrcSAtIDAgMlwiLFxyXG4gICAgICBcIkNhcm/igJNLYW5uX0RlZmVuY2VcIixcclxuICAgICAgW1wiZTQgYzZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMTJcIixcclxuICAgICAgXCJDYXJvLUthbm4gRGVmZW5jZTogQWR2YW5jZSBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxa2Juci9wcDJwcHBwLzJwNS8zcFAzLzNQNC84L1BQUDJQUFAvUk5CUUtCTlIgYiBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiQ2Fyb+KAk0thbm5fRGVmZW5jZSNBZHZhbmNlX1ZhcmlhdGlvbjpfMy5lNVwiLFxyXG4gICAgICBbXCJlNCBjNlwiLCBcImQ0IGQ1XCIsIFwiZTVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMThcIixcclxuICAgICAgXCJDYXJvLUthbm4gRGVmZW5jZTogQ2xhc3NpY2FsIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuMXFrYm5yL3BwMnBwcHAvMnA1LzViMi8zUE4zLzgvUFBQMlBQUC9SMUJRS0JOUiB3IEtRa3EgLSAxIDVcIixcclxuICAgICAgXCJDYXJv4oCTS2Fubl9EZWZlbmNlI0NsYXNzaWNhbF9WYXJpYXRpb246XzQuLi5CZjVcIixcclxuICAgICAgW1wiZTQgYzZcIiwgXCJkNCBkNVwiLCBcIk5jMyBkeGU0XCIsIFwiTnhlNCBCZjVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMTNcIixcclxuICAgICAgXCJDYXJvLUthbm4gRGVmZW5jZTogRXhjaGFuZ2UgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHAycHBwcC8ycDUvM1A0LzNQNC84L1BQUDJQUFAvUk5CUUtCTlIgYiBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiQ2FybyVFMiU4MCU5M0thbm5fRGVmZW5jZSNFeGNoYW5nZV9WYXJpYXRpb246XzMuZXhkNV9jeGQ1XCIsXHJcbiAgICAgIFtcImU0IGM2XCIsIFwiZDQgZDVcIiwgXCJleGQ1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQjE0XCIsXHJcbiAgICAgIFwiQ2Fyby1LYW5uIERlZmVuY2U6IFBhbm92LUJvdHZpbm5payBBdHRhY2tcIixcclxuICAgICAgXCJybmJxa2Ixci9wcDJwcHBwLzVuMi8zcDQvMlBQNC8yTjUvUFAzUFBQL1IxQlFLQk5SIGIgS1FrcSAtIDIgNVwiLFxyXG4gICAgICBcIkNhcm/igJNLYW5uX0RlZmVuY2UjUGFub3YuRTIuODAuOTNCb3R2aW5uaWtfQXR0YWNrOl80LmM0XCIsXHJcbiAgICAgIFtcImU0IGM2XCIsIFwiZDQgZDVcIiwgXCJleGQ1IGN4ZDVcIiwgXCJjNCBOZjZcIiwgXCJOYzNcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMTdcIixcclxuICAgICAgXCJDYXJvLUthbm4gRGVmZW5jZTogU3RlaW5pdHogVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicjFicWtibnIvcHAxbnBwcHAvMnA1LzgvM1BOMy84L1BQUDJQUFAvUjFCUUtCTlIgdyBLUWtxIC0gMSA1XCIsXHJcbiAgICAgIFwiQ2Fyb+KAk0thbm5fRGVmZW5jZSNNb2Rlcm5fVmFyaWF0aW9uOl80Li4uTmQ3XCIsXHJcbiAgICAgIFtcImU0IGM2XCIsIFwiZDQgZDVcIiwgXCJOYzMgZHhlNFwiLCBcIk54ZTQgTmQ3XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzIxXCIsXHJcbiAgICAgIFwiRGFuaXNoIEdhbWJpdFwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcHAxcHBwLzgvOC8zcFAzLzJQNS9QUDNQUFAvUk5CUUtCTlIgYiBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiRGFuaXNoX0dhbWJpdFwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcImQ0IGV4ZDRcIiwgXCJjM1wiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkM0NlwiLFxyXG4gICAgICBcIkZvdXIgS25pZ2h0cyBHYW1lXCIsXHJcbiAgICAgIFwicjFicWtiMXIvcHBwcDFwcHAvMm4ybjIvNHAzLzRQMy8yTjJOMi9QUFBQMVBQUC9SMUJRS0IxUiB3IEtRa3EgLSA0IDRcIixcclxuICAgICAgXCJGb3VyX0tuaWdodHNfR2FtZVwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBOYzZcIiwgXCJOYzMgTmY2XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzQ3XCIsXHJcbiAgICAgIFwiRm91ciBLbmlnaHRzIEdhbWU6IFNjb3RjaCBWYXJpYXRpb25cIixcclxuICAgICAgXCJyMWJxa2Ixci9wcHBwMXBwcC8ybjJuMi80cDMvM1BQMy8yTjJOMi9QUFAyUFBQL1IxQlFLQjFSIGIgS1FrcSAtIDAgNFwiLFxyXG4gICAgICBcIkZvdXJfS25pZ2h0c19HYW1lIzQuZDRcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOZjMgTmM2XCIsIFwiTmMzIE5mNlwiLCBcImQ0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzQ4XCIsXHJcbiAgICAgIFwiRm91ciBLbmlnaHRzIEdhbWU6IFNwYW5pc2ggVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicjFicWtiMXIvcHBwcDFwcHAvMm4ybjIvMUIycDMvNFAzLzJOMk4yL1BQUFAxUFBQL1IxQlFLMlIgYiBLUWtxIC0gNSA0XCIsXHJcbiAgICAgIFwiRm91cl9LbmlnaHRzX0dhbWUjNC5CYjVcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOZjMgTmY2XCIsIFwiTmMzIE5jNlwiLCBcIkJiNVwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkMwMFwiLFxyXG4gICAgICBcIkZyZW5jaCBEZWZlbmNlXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcDFwcHAvNHAzLzgvNFAzLzgvUFBQUDFQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCAyXCIsXHJcbiAgICAgIFwiRnJlbmNoX0RlZmVuY2VcIixcclxuICAgICAgW1wiZTQgZTZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDMDJcIixcclxuICAgICAgXCJGcmVuY2ggRGVmZW5jZTogQWR2YW5jZSBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxa2Juci9wcHAycHBwLzRwMy8zcFAzLzNQNC84L1BQUDJQUFAvUk5CUUtCTlIgYiBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiRnJlbmNoX0RlZmVuY2UjQWR2YW5jZV9WYXJpYXRpb246XzMuZTVcIixcclxuICAgICAgW1wiZTQgZTZcIiwgXCJkNCBkNVwiLCBcImU1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzExXCIsXHJcbiAgICAgIFwiRnJlbmNoIERlZmVuY2U6IEJ1cm4gVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHBwMnBwcC80cG4yLzNwMkIxLzNQUDMvMk41L1BQUDJQUFAvUjJRS0JOUiBiIEtRa3EgLSAwIDVcIixcclxuICAgICAgXCJGcmVuY2hfRGVmZW5jZSMzLk5jM1wiLFxyXG4gICAgICBbXCJlNCBlNlwiLCBcImQ0IGQ1XCIsIFwiTmMzIE5mNlwiLCBcIkJnNSBkeGU0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzExXCIsXHJcbiAgICAgIFwiRnJlbmNoIERlZmVuY2U6IENsYXNzaWNhbCBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxa2Ixci9wcHAycHBwLzRwbjIvM3A0LzNQUDMvMk41L1BQUDJQUFAvUjFCUUtCTlIgdyBLUWtxIC0gMiA0XCIsXHJcbiAgICAgIFwiRnJlbmNoX0RlZmVuY2UjQ2xhc3NpY2FsX1ZhcmlhdGlvbjpfMy4uLk5mNlwiLFxyXG4gICAgICBbXCJlNCBlNlwiLCBcImQ0IGQ1XCIsIFwiTmMzIE5mNlwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkMwMVwiLFxyXG4gICAgICBcIkZyZW5jaCBEZWZlbmNlOiBFeGNoYW5nZSBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxa2Juci9wcHAycHBwLzRwMy8zUDQvM1A0LzgvUFBQMlBQUC9STkJRS0JOUiBiIEtRa3EgLSAwIDNcIixcclxuICAgICAgXCJGcmVuY2hfRGVmZW5jZSNFeGNoYW5nZV9WYXJpYXRpb246XzMuZXhkNV9leGQ1XCIsXHJcbiAgICAgIFtcImU0IGU2XCIsIFwiZDQgZDVcIiwgXCJleGQ1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzEwXCIsXHJcbiAgICAgIFwiRnJlbmNoIERlZmVuY2U6IFJ1Ymluc3RlaW4gVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwMnBwcC80cDMvOC8zUHAzLzJONS9QUFAyUFBQL1IxQlFLQk5SIHcgS1FrcSAtIDAgNFwiLFxyXG4gICAgICBcIkZyZW5jaF9EZWZlbmNlI1J1Ymluc3RlaW5fVmFyaWF0aW9uOl8zLi4uZHhlNFwiLFxyXG4gICAgICBbXCJlNCBlNlwiLCBcImQ0IGQ1XCIsIFwiTmMzIGR4ZTRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDMDNcIixcclxuICAgICAgXCJGcmVuY2ggRGVmZW5jZTogVGFycmFzY2ggVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwMnBwcC80cDMvM3A0LzNQUDMvOC9QUFBOMVBQUC9SMUJRS0JOUiBiIEtRa3EgLSAxIDNcIixcclxuICAgICAgXCJGcmVuY2hfRGVmZW5jZSNUYXJyYXNjaF9WYXJpYXRpb246XzMuTmQyXCIsXHJcbiAgICAgIFtcImU0IGU2XCIsIFwiZDQgZDVcIiwgXCJOZDJcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDMTVcIixcclxuICAgICAgXCJGcmVuY2ggRGVmZW5jZTogV2luYXdlciBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxazFuci9wcHAycHBwLzRwMy8zcDQvMWIxUFAzLzJONS9QUFAyUFBQL1IxQlFLQk5SIHcgS1FrcSAtIDIgNFwiLFxyXG4gICAgICBcIkZyZW5jaF9EZWZlbmNlI1dpbmF3ZXJfVmFyaWF0aW9uOl8zLi4uQmI0XCIsXHJcbiAgICAgIFtcImU0IGU2XCIsIFwiZDQgZDVcIiwgXCJOYzMgQmI0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzUwXCIsXHJcbiAgICAgIFwiR2l1b2NvIFBpYW5vXCIsXHJcbiAgICAgIFwicjFicWsxbnIvcHBwcDFwcHAvMm41LzJiMXAzLzJCMVAzLzVOMi9QUFBQMVBQUC9STkJRSzJSIHcgS1FrcSAtIDQgNFwiLFxyXG4gICAgICBcIkdpdW9jb19QaWFub1wiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBOYzZcIiwgXCJCYzQgQmM1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzUwXCIsXHJcbiAgICAgIFwiSXRhbGlhbiBHYW1lXCIsXHJcbiAgICAgIFwicjFicWtibnIvcHBwcDFwcHAvMm41LzRwMy8yQjFQMy81TjIvUFBQUDFQUFAvUk5CUUsyUiBiIEtRa3EgLSAzIDNcIixcclxuICAgICAgXCJJdGFsaWFuX0dhbWVcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOZjMgTmM2XCIsIFwiQmM0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzUxXCIsXHJcbiAgICAgIFwiRXZhbnMgR2FtYml0XCIsXHJcbiAgICAgIFwicjFicWsxbnIvcHBwcDFwcHAvMm41LzJiMXAzLzFQQjFQMy81TjIvUDFQUDFQUFAvUk5CUUsyUiBiIEtRa3EgLSAwIDRcIixcclxuICAgICAgXCJFdmFuc19HYW1iaXRcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOZjMgTmM2XCIsIFwiQmM0IEJjNVwiLCBcImI0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzUwXCIsXHJcbiAgICAgIFwiSXRhbGlhbiBHYW1lOiBIdW5nYXJpYW4gRGVmZW5jZVwiLFxyXG4gICAgICBcInIxYnFrMW5yL3BwcHBicHBwLzJuNS80cDMvMkIxUDMvNU4yL1BQUFAxUFBQL1JOQlFLMlIgdyBLUWtxIC0gNCA0XCIsXHJcbiAgICAgIFwiSHVuZ2FyaWFuX0RlZmVuc2VcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOZjMgTmM2XCIsIFwiQmM0IEJlN1wiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkM1NVwiLFxyXG4gICAgICBcIkl0YWxpYW4gR2FtZTogVHdvIEtuaWdodHMgRGVmZW5jZVwiLFxyXG4gICAgICBcInIxYnFrYjFyL3BwcHAxcHBwLzJuMm4yLzRwMy8yQjFQMy81TjIvUFBQUDFQUFAvUk5CUUsyUiB3IEtRa3EgLSA0IDRcIixcclxuICAgICAgXCJUd29fS25pZ2h0c19EZWZlbnNlXCIsXHJcbiAgICAgIFtcImU0IGU1XCIsIFwiTmYzIE5jNlwiLCBcIkJjNCBOZjZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDMzBcIixcclxuICAgICAgXCJLaW5nJ3MgR2FtYml0XCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcDFwcHAvOC80cDMvNFBQMi84L1BQUFAyUFAvUk5CUUtCTlIgYiBLUWtxIC0gMCAyXCIsXHJcbiAgICAgIFwiS2luZydzX0dhbWJpdFwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcImY0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzMzXCIsXHJcbiAgICAgIFwiS2luZydzIEdhbWJpdCBBY2NlcHRlZFwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcHAxcHBwLzgvOC80UHAyLzgvUFBQUDJQUC9STkJRS0JOUiB3IEtRa3EgLSAwIDNcIixcclxuICAgICAgXCJLaW5nJ3NfR2FtYml0I0tpbmcuMjdzX0dhbWJpdF9BY2NlcHRlZDpfMi4uLmV4ZjRcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJmNCBleGY0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzMzXCIsXHJcbiAgICAgIFwiS2luZydzIEdhbWJpdCBBY2NlcHRlZDogQmlzaG9wJ3MgR2FtYml0XCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcDFwcHAvOC84LzJCMVBwMi84L1BQUFAyUFAvUk5CUUsxTlIgYiBLUWtxIC0gMSAzXCIsXHJcbiAgICAgIFwiS2luZydzX0dhbWJpdCNLaW5nLjI3c19HYW1iaXRfQWNjZXB0ZWQ6XzIuLi5leGY0XCIsXHJcbiAgICAgIFtcImU0IGU1XCIsIFwiZjQgZXhmNFwiLCBcIkJjNFwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkMzNlwiLFxyXG4gICAgICBcIktpbmcncyBHYW1iaXQgQWNjZXB0ZWQ6IE1vZGVybiBEZWZlbmNlXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwMnBwcC84LzNwNC80UHAyLzVOMi9QUFBQMlBQL1JOQlFLQjFSIHcgS1FrcSBkNiAwIDRcIixcclxuICAgICAgXCJLaW5nJ3NfR2FtYml0I01vZGVybl9EZWZlbmNlOl8zLi4uZDVcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJmNCBleGY0XCIsIFwiTmYzIGQ1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzMwXCIsXHJcbiAgICAgIFwiS2luZydzIEdhbWJpdCBBY2NlcHRlZDogQ2xhc3NpY2FsIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcHAxcDFwLzgvNnAxLzRQcDIvNU4yL1BQUFAyUFAvUk5CUUtCMVIgdyBLUWtxIC0gMCA0XCIsXHJcbiAgICAgIFwiS2luZydzX0dhbWJpdCNDbGFzc2ljYWxfVmFyaWF0aW9uOl8zLi4uZzVcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJmNCBleGY0XCIsIFwiTmYzIGc1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzMwXCIsXHJcbiAgICAgIFwiS2luZydzIEdhbWJpdCBEZWNsaW5lZDogQ2xhc3NpY2FsIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnFrMW5yL3BwcHAxcHBwLzgvMmIxcDMvNFBQMi84L1BQUFAyUFAvUk5CUUtCTlIgdyBLUWtxIC0gMSAzXCIsXHJcbiAgICAgIFwiS2luZydzX0dhbWJpdCNDbGFzc2ljYWxfRGVmZW5jZTpfMi4uLkJjNVwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcImY0IEJjNVwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkMzMVwiLFxyXG4gICAgICBcIktpbmcncyBHYW1iaXQ6IEZhbGtiZWVyIENvdW50ZXJnYW1iaXRcIixcclxuICAgICAgXCJybmJxa2Juci9wcHAycHBwLzgvM3BwMy80UFAyLzgvUFBQUDJQUC9STkJRS0JOUiB3IEtRa3EgLSAwIDNcIixcclxuICAgICAgXCJLaW5nJTI3c19HYW1iaXQsX0ZhbGtiZWVyX0NvdW50ZXJnYW1iaXRcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJmNCBkNVwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkIwNlwiLFxyXG4gICAgICBcIk1vZGVybiBEZWZlbmNlXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcHBwMXAvNnAxLzgvNFAzLzgvUFBQUDFQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCAyXCIsXHJcbiAgICAgIFwiTW9kZXJuX0RlZmVuc2VcIixcclxuICAgICAgW1wiZTQgZzZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMDZcIixcclxuICAgICAgXCJNb2Rlcm4gRGVmZW5jZTogUm9iYXRzY2ggRGVmZW5jZVwiLFxyXG4gICAgICBcInJuYnFrMW5yL3BwcHBwcGJwLzZwMS84LzNQUDMvMk41L1BQUDJQUFAvUjFCUUtCTlIgYiBLUWtxIC0gMiAzXCIsXHJcbiAgICAgIFwiTW9kZXJuX0RlZmVuc2VcIixcclxuICAgICAgW1wiZTQgZzZcIiwgXCJkNCBCZzdcIiwgXCJOYzNcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDNDFcIixcclxuICAgICAgXCJQaGlsaWRvciBEZWZlbmNlXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwMnBwcC8zcDQvNHAzLzRQMy81TjIvUFBQUDFQUFAvUk5CUUtCMVIgdyBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiUGhpbGlkb3JfRGVmZW5jZVwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBkNlwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkM0MVwiLFxyXG4gICAgICBcIlBoaWxpZG9yIERlZmVuY2U6IExpb24gVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicjFicWtiMXIvcHBwbjFwcHAvM3AxbjIvNHAzLzNQUDMvMk4yTjIvUFBQMlBQUC9SMUJRS0IxUiB3IEtRa3EgLSAyIDVcIixcclxuICAgICAgXCJQaGlsaWRvcl9EZWZlbmNlXCIsXHJcbiAgICAgIFtcImU0IGQ2XCIsIFwiZDQgTmY2XCIsIFwiTmMzIGU1XCIsIFwiTmYzIE5iZDdcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMDdcIixcclxuICAgICAgXCJMaW9uIFZhcmlhdGlvbjogQW50aS1QaGlsaWRvclwiLFxyXG4gICAgICBcInIxYnFrYjFyL3BwcG4xcHBwLzNwMW4yLzRwMy8zUFBQMi8yTjUvUFBQM1BQL1IxQlFLQk5SIHcgS1FrcSAtIDAgNVwiLFxyXG4gICAgICBcIlBoaWxpZG9yX0RlZmVuY2VcIixcclxuICAgICAgW1wiZTQgZDZcIiwgXCJkNCBOZjZcIiwgXCJOYzMgTmJkN1wiLCBcImY0IGU1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQjA3XCIsXHJcbiAgICAgIFwiUGlyYyBEZWZlbmNlXCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHBwMXBwcHAvM3AxbjIvOC8zUFAzLzgvUFBQMlBQUC9STkJRS0JOUiB3IEtRa3EgLSAyIDNcIixcclxuICAgICAgXCJQaXJjX0RlZmVuY2VcIixcclxuICAgICAgW1wiZTQgZDZcIiwgXCJkNCBOZjZcIiwgXCJOYzNcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMDlcIixcclxuICAgICAgXCJQaXJjIERlZmVuY2U6IEF1c3RyaWFuIEF0dGFja1wiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwcDFwcDFwLzNwMW5wMS84LzNQUFAyLzJONS9QUFAzUFAvUjFCUUtCTlIgYiBLUWtxIC0gMCA0XCIsXHJcbiAgICAgIFwiUGlyY19EZWZlbmNlI0F1c3RyaWFuX0F0dGFjazpfNC5mNFwiLFxyXG4gICAgICBbXCJlNCBkNlwiLCBcImQ0IE5mNlwiLCBcIk5jMyBnNlwiLCBcImY0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQjA3XCIsXHJcbiAgICAgIFwiUGlyYyBEZWZlbmNlOiBDbGFzc2ljYWwgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHBwMXBwMXAvM3AxbnAxLzgvM1BQMy8yTjJOMi9QUFAyUFBQL1IxQlFLQjFSIGIgS1FrcSAtIDEgNFwiLFxyXG4gICAgICBcIlBpcmNfRGVmZW5jZSNDbGFzc2ljYWxfLjI4VHdvX0tuaWdodHMuMjlfU3lzdGVtOl80Lk5mM1wiLFxyXG4gICAgICBbXCJlNCBkNlwiLCBcImQ0IE5mNlwiLCBcIk5jMyBnNlwiLCBcIk5mM1wiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkIwN1wiLFxyXG4gICAgICBcIlBpcmMgRGVmZW5jZTogTGlvbiBWYXJpYXRpb25cIixcclxuICAgICAgXCJyMWJxa2Ixci9wcHBucHBwcC8zcDFuMi84LzNQUDMvMk41L1BQUDJQUFAvUjFCUUtCTlIgdyBLUWtxIC0gMyA0XCIsXHJcbiAgICAgIFwiUGlyY19EZWZlbmNlI0NsYXNzaWNhbF8uMjhUd29fS25pZ2h0cy4yOV9TeXN0ZW1cIixcclxuICAgICAgW1wiZTQgZDZcIiwgXCJkNCBOZjZcIiwgXCJOYzMgTmJkN1wiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkM0MlwiLFxyXG4gICAgICBcIlBldHJvdidzIERlZmVuY2VcIixcclxuICAgICAgXCJybmJxa2Ixci9wcHBwMXBwcC81bjIvNHAzLzRQMy81TjIvUFBQUDFQUFAvUk5CUUtCMVIgdyBLUWtxIC0gMiAzXCIsXHJcbiAgICAgIFwiUGV0cm92J3NfRGVmZW5jZVwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBOZjZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDNDJcIixcclxuICAgICAgXCJQZXRyb3YncyBEZWZlbmNlOiBDbGFzc2ljYWwgQXR0YWNrXCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHBwMnBwcC8zcDQvOC8zUG4zLzVOMi9QUFAyUFBQL1JOQlFLQjFSIGIgS1FrcSAtIDAgNVwiLFxyXG4gICAgICBcIlBldHJvdidzX0RlZmVuY2UjMy5OeGU1XCIsXHJcbiAgICAgIFtcImU0IGU1XCIsIFwiTmYzIE5mNlwiLCBcIk54ZTUgZDZcIiwgXCJOZjMgTnhlNFwiLCBcImQ0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzQzXCIsXHJcbiAgICAgIFwiUGV0cm92J3MgRGVmZW5jZTogU3RlaW5pdHogQXR0YWNrXCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHBwcDFwcHAvNW4yLzRwMy8zUFAzLzVOMi9QUFAyUFBQL1JOQlFLQjFSIGIgS1FrcSAtIDAgM1wiLFxyXG4gICAgICBcIlBldHJvdidzX0RlZmVuY2UjMy5kNFwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBOZjZcIiwgXCJkNFwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkM0MlwiLFxyXG4gICAgICBcIlBldHJvdidzIERlZmVuY2U6IFRocmVlIEtuaWdodHMgR2FtZVwiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwcHAxcHBwLzVuMi80cDMvNFAzLzJOMk4yL1BQUFAxUFBQL1IxQlFLQjFSIGIgS1FrcSAtIDMgM1wiLFxyXG4gICAgICBcIlBldHJvdidzX0RlZmVuY2UjMy5OYzNcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOZjMgTmY2XCIsIFwiTmMzXCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzYwXCIsXHJcbiAgICAgIFwiUnV5IExvcGV6XCIsXHJcbiAgICAgIFwicjFicWtibnIvcHBwcDFwcHAvMm41LzFCMnAzLzRQMy81TjIvUFBQUDFQUFAvUk5CUUsyUiBiIEtRa3EgLSAzIDNcIixcclxuICAgICAgXCJSdXlfTG9wZXpcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOZjMgTmM2XCIsIFwiQmI1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzY1XCIsXHJcbiAgICAgIFwiUnV5IExvcGV6OiBCZXJsaW4gRGVmZW5jZVwiLFxyXG4gICAgICBcInIxYnFrYjFyL3BwcHAxcHBwLzJuMm4yLzFCMnAzLzRQMy81TjIvUFBQUDFQUFAvUk5CUUsyUiB3IEtRa3EgLSA0IDRcIixcclxuICAgICAgXCJSdXlfTG9wZXojQmVybGluX0RlZmVuY2U6XzMuLi5OZjZcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOZjMgTmM2XCIsIFwiQmI1IE5mNlwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkM2NFwiLFxyXG4gICAgICBcIlJ1eSBMb3BlejogQ2xhc3NpY2FsIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInIxYnFrMW5yL3BwcHAxcHBwLzJuNS8xQmIxcDMvNFAzLzVOMi9QUFBQMVBQUC9STkJRSzJSIHcgS1FrcSAtIDQgNFwiLFxyXG4gICAgICBcIlJ1eV9Mb3BleiNDbGFzc2ljYWxfRGVmZW5jZTpfMy4uLkJjNVwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBOYzZcIiwgXCJCYjUgQmM1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzg0XCIsXHJcbiAgICAgIFwiUnV5IExvcGV6OiBDbG9zZWQgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicjFicWsyci8ycHBicHBwL3AxbjJuMi8xcDJwMy80UDMvMUIzTjIvUFBQUDFQUFAvUk5CUVIxSzEgYiBrcSAtIDEgN1wiLFxyXG4gICAgICBcIlJ1eV9Mb3BleiNNYWluX2xpbmU6XzQuQmE0X05mNl81LjAtMF9CZTdfNi5SZTFfYjVfNy5CYjNfZDZfOC5jM18wLTBcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOZjMgTmM2XCIsIFwiQmI1IGE2XCIsIFwiQmE0IE5mNlwiLCBcIk8tTyBCZTdcIiwgXCJSZTEgYjVcIiwgXCJCYjNcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDNjhcIixcclxuICAgICAgXCJSdXkgTG9wZXo6IEV4Y2hhbmdlIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInIxYnFrYm5yLzFwcHAxcHBwL3AxQjUvNHAzLzRQMy81TjIvUFBQUDFQUFAvUk5CUUsyUiBiIEtRa3EgLSAwIDRcIixcclxuICAgICAgXCJSdXlfTG9wZXosX0V4Y2hhbmdlX1ZhcmlhdGlvblwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBOYzZcIiwgXCJCYjUgYTZcIiwgXCJCeGM2XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzg5XCIsXHJcbiAgICAgIFwiUnV5IExvcGV6OiBNYXJzaGFsbCBBdHRhY2tcIixcclxuICAgICAgXCJyMWJxMXJrMS8ycDFicHBwL3AxbjJuMi8xcDFwcDMvNFAzLzFCUDJOMi9QUDFQMVBQUC9STkJRUjFLMSB3IC0gLSAwIDlcIixcclxuICAgICAgXCJSdXlfTG9wZXojTWFyc2hhbGxfQXR0YWNrXCIsXHJcbiAgICAgIFtcImU0IGU1XCIsIFwiTmYzIE5jNlwiLCBcIkJiNSBhNlwiLCBcIkJhNCBOZjZcIiwgXCJPLU8gQmU3XCIsIFwiUmUxIGI1XCIsIFwiQmIzIE8tT1wiLCBcImMzIGQ1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzYzXCIsXHJcbiAgICAgIFwiUnV5IExvcGV6OiBTY2hsaWVtYW5uIERlZmVuY2VcIixcclxuICAgICAgXCJyMWJxa2Juci9wcHBwMnBwLzJuNS8xQjJwcDIvNFAzLzVOMi9QUFBQMVBQUC9STkJRSzJSIHcgS1FrcSAtIDAgNFwiLFxyXG4gICAgICBcIlJ1eV9Mb3BleiNTY2hsaWVtYW5uX0RlZmVuY2U6XzMuLi5mNVwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBOYzZcIiwgXCJCYjUgZjVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMDFcIixcclxuICAgICAgXCJTY2FuZGluYXZpYW4gRGVmZW5jZVwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcDFwcHBwLzgvM3A0LzRQMy84L1BQUFAxUFBQL1JOQlFLQk5SIHcgS1FrcSAtIDAgMlwiLFxyXG4gICAgICBcIlNjYW5kaW5hdmlhbl9EZWZlbnNlXCIsXHJcbiAgICAgIFtcImU0IGQ1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQjAxXCIsXHJcbiAgICAgIFwiU2NhbmRpbmF2aWFuIERlZmVuY2U6IE1vZGVybiBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxa2Ixci9wcHAxcHBwcC81bjIvM1A0LzNQNC84L1BQUDJQUFAvUk5CUUtCTlIgYiBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiU2NhbmRpbmF2aWFuX0RlZmVuc2UjMi4uLk5mNlwiLFxyXG4gICAgICBbXCJlNCBkNVwiLCBcImV4ZDUgTmY2XCIsIFwiZDRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMDFcIixcclxuICAgICAgXCJTY2FuZGluYXZpYW4gRGVmZW5jZTogSWNlbGFuZGljLVBhbG1lIEdhbWJpdFwiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwcDJwcHAvNHBuMi8zUDQvMlA1LzgvUFAxUDFQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCA0XCIsXHJcbiAgICAgIFwiU2NhbmRpbmF2aWFuX0RlZmVuc2UjMi4uLk5mNlwiLFxyXG4gICAgICBbXCJlNCBkNVwiLCBcImV4ZDUgTmY2XCIsIFwiYzQgZTZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDNDRcIixcclxuICAgICAgXCJTY290Y2ggR2FtZVwiLFxyXG4gICAgICBcInIxYnFrYm5yL3BwcHAxcHBwLzJuNS80cDMvM1BQMy81TjIvUFBQMlBQUC9STkJRS0IxUiBiIEtRa3EgLSAwIDNcIixcclxuICAgICAgXCJTY290Y2hfR2FtZVwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBOYzZcIiwgXCJkNFwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkM0NVwiLFxyXG4gICAgICBcIlNjb3RjaCBHYW1lOiBDbGFzc2ljYWwgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicjFicWsxbnIvcHBwcDFwcHAvMm41LzJiNS8zTlAzLzgvUFBQMlBQUC9STkJRS0IxUiB3IEtRa3EgLSAxIDVcIixcclxuICAgICAgXCJTY290Y2hfR2FtZSxfQ2xhc3NpY2FsX1ZhcmlhdGlvblwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBOYzZcIiwgXCJkNCBleGQ0XCIsIFwiTnhkNCBCYzVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDNDVcIixcclxuICAgICAgXCJTY290Y2ggR2FtZTogTWllc2VzIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInIxYnFrYjFyL3AxcHAxcHBwLzJwMm4yLzRQMy84LzgvUFBQMlBQUC9STkJRS0IxUiBiIEtRa3EgLSAwIDZcIixcclxuICAgICAgXCJTY290Y2hfR2FtZSNTY2htaWR0X1ZhcmlhdGlvbjpfNC4uLk5mNlwiLFxyXG4gICAgICBbXCJlNCBlNVwiLCBcIk5mMyBOYzZcIiwgXCJkNCBleGQ0XCIsIFwiTnhkNCBOZjZcIiwgXCJOeGM2IGJ4YzZcIiwgXCJlNVwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkM0NVwiLFxyXG4gICAgICBcIlNjb3RjaCBHYW1lOiBTdGVpbml0eiBWYXJpYXRpb25cIixcclxuICAgICAgXCJyMWIxa2Juci9wcHBwMXBwcC8ybjUvOC8zTlAycS84L1BQUDJQUFAvUk5CUUtCMVIgdyBLUWtxIC0gMSA1XCIsXHJcbiAgICAgIFwiU2NvdGNoX0dhbWUjU3RlaW5pdHpfVmFyaWF0aW9uOl80Li4uUWg0LjIxLjNGXCIsXHJcbiAgICAgIFtcImU0IGU1XCIsIFwiTmYzIE5jNlwiLCBcImQ0IGV4ZDRcIiwgXCJOeGQ0IFFoNFwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkIyMFwiLFxyXG4gICAgICBcIlNpY2lsaWFuIERlZmVuY2VcIixcclxuICAgICAgXCJybmJxa2Juci9wcDFwcHBwcC84LzJwNS80UDMvOC9QUFBQMVBQUC9STkJRS0JOUiB3IEtRa3EgLSAwIDJcIixcclxuICAgICAgXCJTaWNpbGlhbl9EZWZlbmNlXCIsXHJcbiAgICAgIFtcImU0IGM1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQjM2XCIsXHJcbiAgICAgIFwiU2ljaWxpYW4gRGVmZW5jZTogQWNjZWxlcmF0ZWQgRHJhZ29uXCIsXHJcbiAgICAgIFwicjFicWtibnIvcHAxcHBwMXAvMm4zcDEvOC8zTlAzLzgvUFBQMlBQUC9STkJRS0IxUiB3IEtRa3EgLSAwIDVcIixcclxuICAgICAgXCJTaWNpbGlhbl9EZWZlbmNlLF9BY2NlbGVyYXRlZF9EcmFnb25cIixcclxuICAgICAgW1wiZTQgYzVcIiwgXCJOZjMgTmM2XCIsIFwiZDQgY3hkNFwiLCBcIk54ZDQgZzZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMjJcIixcclxuICAgICAgXCJTaWNpbGlhbiBEZWZlbmNlOiBBbGFwaW4gVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHAxcHBwcHAvOC8ycDUvNFAzLzJQNS9QUDFQMVBQUC9STkJRS0JOUiBiIEtRa3EgLSAwIDJcIixcclxuICAgICAgXCJTaWNpbGlhbl9EZWZlbmNlLF9BbGFwaW5fVmFyaWF0aW9uXCIsXHJcbiAgICAgIFtcImU0IGM1XCIsIFwiYzNcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMjNcIixcclxuICAgICAgXCJTaWNpbGlhbiBEZWZlbmNlOiBDbG9zZWQgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHAxcHBwcHAvOC8ycDUvNFAzLzJONS9QUFBQMVBQUC9SMUJRS0JOUiBiIEtRa3EgLSAxIDJcIixcclxuICAgICAgXCJTaWNpbGlhbl9EZWZlbmNlI0Nsb3NlZF9TaWNpbGlhblwiLFxyXG4gICAgICBbXCJlNCBjNVwiLCBcIk5jM1wiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkI3MFwiLFxyXG4gICAgICBcIlNpY2lsaWFuIERlZmVuY2U6IERyYWdvbiBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxa2Ixci9wcDJwcDFwLzNwMW5wMS84LzNOUDMvMk41L1BQUDJQUFAvUjFCUUtCMVIgdyBLUWtxIC0gMCA2XCIsXHJcbiAgICAgIFwiU2ljaWxpYW5fRGVmZW5jZSxfRHJhZ29uX1ZhcmlhdGlvblwiLFxyXG4gICAgICBbXCJlNCBjNVwiLCBcIk5mMyBkNlwiLCBcImQ0IGN4ZDRcIiwgXCJOeGQ0IE5mNlwiLCBcIk5jMyBnNlwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkIyM1wiLFxyXG4gICAgICBcIlNpY2lsaWFuIERlZmVuY2U6IEdyYW5kIFByaXggQXR0YWNrXCIsXHJcbiAgICAgIFwibmJxa2Juci9wcDFwcHBwcC84LzJwNS80UFAyLzgvUFBQUDJQUC9STkJRS0JOUiBiIEtRa3EgLSAwIDJcIixcclxuICAgICAgXCJTaWNpbGlhbl9EZWZlbmNlI0dyYW5kX1ByaXhfQXR0YWNrXCIsXHJcbiAgICAgIFtcImU0IGM1XCIsIFwiZjRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCMjdcIixcclxuICAgICAgXCJTaWNpbGlhbiBEZWZlbmNlOiBIeXBlci1BY2NlbGVyYXRlZCBEcmFnb25cIixcclxuICAgICAgXCJybmJxa2Juci9wcDFwcHAxcC82cDEvMnA1LzRQMy81TjIvUFBQUDFQUFAvUk5CUUtCMVIgdyBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiU2ljaWxpYW5fRGVmZW5jZSMyLi4uZzY6X0h1bmdhcmlhbl9WYXJpYXRpb25cIixcclxuICAgICAgW1wiZTQgYzVcIiwgXCJOZjMgZzZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJCNDFcIixcclxuICAgICAgXCJTaWNpbGlhbiBEZWZlbmNlOiBLYW4gVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtibnIvMXAxcDFwcHAvcDNwMy84LzNOUDMvOC9QUFAyUFBQL1JOQlFLQjFSIHcgS1FrcSAtIDAgNVwiLFxyXG4gICAgICBcIlNpY2lsaWFuX0RlZmVuY2UjS2FuXy4yOFBhdWxzZW4uMjlfVmFyaWF0aW9uOl80Li4uYTZcIixcclxuICAgICAgW1wiZTQgYzVcIiwgXCJOZjMgZTZcIiwgXCJkNCBjeGQ0XCIsIFwiTnhkNCBhNlwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkI5MFwiLFxyXG4gICAgICBcIlNpY2lsaWFuIERlZmVuY2U6IE5hamRvcmYgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtiMXIvMXAycHBwcC9wMnAxbjIvOC8zTlAzLzJONS9QUFAyUFBQL1IxQlFLQjFSIHcgS1FrcSAtIDAgNlwiLFxyXG4gICAgICBcIlNpY2lsaWFuX0RlZmVuY2UsX05hamRvcmZfVmFyaWF0aW9uXCIsXHJcbiAgICAgIFtcImU0IGM1XCIsIFwiTmYzIGQ2XCIsIFwiZDQgY3hkNFwiLCBcIk54ZDQgTmY2XCIsIFwiTmMzIGE2XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQjYwXCIsXHJcbiAgICAgIFwiU2ljaWxpYW4gRGVmZW5jZTogUmljaHRlci1SYXV6ZXIgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicjFicWtiMXIvcHAycHBwcC8ybnAxbjIvNkIxLzNOUDMvMk41L1BQUDJQUFAvUjJRS0IxUiBiIEtRa3EgLSA0IDZcIixcclxuICAgICAgXCJTaWNpbGlhbl9EZWZlbmNlI0NsYXNzaWNhbF9WYXJpYXRpb246XzUuLi5OYzZcIixcclxuICAgICAgW1wiZTQgYzVcIiwgXCJOZjMgZDZcIiwgXCJkNCBjeGQ0XCIsIFwiTnhkNCBOZjZcIiwgXCJOYzMgTmM2XCIsIFwiQmc1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQjgwXCIsXHJcbiAgICAgIFwiU2ljaWxpYW4gRGVmZW5jZTogU2NoZXZlbmluZ2VuIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwM3BwcC8zcHBuMi84LzNOUDMvMk41L1BQUDJQUFAvUjFCUUtCMVIgdyBLUWtxIC0gMCA2XCIsXHJcbiAgICAgIFwiU2ljaWxpYW5fRGVmZW5jZSxfU2NoZXZlbmluZ2VuX1ZhcmlhdGlvblwiLFxyXG4gICAgICBbXCJlNCBjNVwiLCBcIk5mMyBkNlwiLCBcImQ0IGN4ZDRcIiwgXCJOeGQ0IE5mNlwiLCBcIk5jMyBlNlwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkIyMVwiLFxyXG4gICAgICBcIlNpY2lsaWFuIERlZmVuY2U6IFNtaXRoLU1vcnJhIEdhbWJpdFwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwMXBwcHBwLzgvOC8zcFAzLzJQNS9QUDNQUFAvUk5CUUtCTlIgYiBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiU2ljaWxpYW5fRGVmZW5jZSxfU21pdGjigJNNb3JyYV9HYW1iaXRcIixcclxuICAgICAgW1wiZTQgYzVcIiwgXCJkNCBjeGQ0XCIsIFwiYzNcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDMjVcIixcclxuICAgICAgXCJWaWVubmEgR2FtZVwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcHAxcHBwLzgvNHAzLzRQMy8yTjUvUFBQUDFQUFAvUjFCUUtCTlIgYiBLUWtxIC0gMSAyXCIsXHJcbiAgICAgIFwiVmllbm5hX0dhbWVcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCIgTmMzXCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQzI3XCIsXHJcbiAgICAgIFwiVmllbm5hIEdhbWU6IEZyYW5rZW5zdGVpbi1EcmFjdWxhIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwcHAxcHBwLzgvNHAzLzJCMW4zLzJONS9QUFBQMVBQUC9SMUJRSzFOUiB3IEtRa3EgLSAwIDRcIixcclxuICAgICAgXCJGcmFua2Vuc3RlaW4tRHJhY3VsYV9WYXJpYXRpb25cIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOYzMgTmY2XCIsIFwiQmM0IE54ZTRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDNDZcIixcclxuICAgICAgXCJGb3VyIEtuaWdodHMgR2FtZTogSGFsbG93ZWVuIEdhbWJpdFwiLFxyXG4gICAgICBcInIxYnFrYjFyL3BwcHAxcHBwLzJuMm4yLzROMy80UDMvMk41L1BQUFAxUFBQL1IxQlFLQjFSIGIgS1FrcSAtIDAgNFwiLFxyXG4gICAgICBcIkhhbGxvd2Vlbl9HYW1iaXRcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJOZjMgTmM2XCIsIFwiTmMzIE5mNlwiLCBcIk54ZTVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDMjBcIixcclxuICAgICAgXCJLaW5nJ3MgUGF3biBHYW1lOiBXYXl3YXJkIFF1ZWVuIEF0dGFja1wiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcHAxcHBwLzgvNHAyUS80UDMvOC9QUFBQMVBQUC9STkIxS0JOUiBiIEtRa3EgLSAxIDJcIixcclxuICAgICAgXCJEYW52ZXJzX09wZW5pbmdcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJRaDVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJDMjBcIixcclxuICAgICAgXCJCb25nY2xvdWQgQXR0YWNrXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcDFwcHAvOC80cDMvNFAzLzgvUFBQUEtQUFAvUk5CUTFCTlIgYiBrcSAtIDEgMlwiLFxyXG4gICAgICBcIkJvbmdcIixcclxuICAgICAgW1wiZTQgZTVcIiwgXCJLZTJcIl1cclxuICAgICksXHJcbiAgXSksXHJcbiAgbmV3IENhdGVnb3J5KFwiZDRcIiwgW1xyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTQwXCIsXHJcbiAgICAgIFwiUXVlZW4ncyBQYXduXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcHBwcHAvOC84LzNQNC84L1BQUDFQUFBQL1JOQlFLQk5SIGIgS1FrcSAtIDAgMVwiLFxyXG4gICAgICBcIlF1ZWVuJ3NfUGF3bl9HYW1lXCIsXHJcbiAgICAgIFtcImQ0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTU3XCIsXHJcbiAgICAgIFwiQmVua28gR2FtYml0XCIsXHJcbiAgICAgIFwicm5icWtiMXIvcDJwcHBwcC81bjIvMXBwUDQvMlA1LzgvUFAyUFBQUC9STkJRS0JOUiB3IEtRa3EgLSAwIDRcIixcclxuICAgICAgXCJCZW5rb19HYW1iaXRcIixcclxuICAgICAgW1wiZDQgTmY2XCIsIFwiYzQgYzVcIiwgXCJkNSBiNVwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkE2MVwiLFxyXG4gICAgICBcIkJlbm9uaSBEZWZlbmNlOiBNb2Rlcm4gQmVub25pXCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHAxcDFwcHAvNHBuMi8ycFA0LzJQNS84L1BQMlBQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCA0XCIsXHJcbiAgICAgIFwiTW9kZXJuX0Jlbm9uaVwiLFxyXG4gICAgICBbXCJkNCBOZjZcIiwgXCJjNCBjNVwiLCBcImQ1IGU2XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTQzXCIsXHJcbiAgICAgIFwiQmVub25pIERlZmVuY2U6IEN6ZWNoIEJlbm9uaVwiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwMXAxcHBwLzVuMi8ycFBwMy8yUDUvOC9QUDJQUFBQL1JOQlFLQk5SIHcgS1FrcSBlNiAwIDRcIixcclxuICAgICAgXCJCZW5vbmlfRGVmZW5zZSNDemVjaF9CZW5vbmk6XzEuZDRfTmY2XzIuYzRfYzVfMy5kNV9lNVwiLFxyXG4gICAgICBbXCJkNCBOZjZcIiwgXCJjNCBjNVwiLCBcImQ1IGU1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRDAwXCIsXHJcbiAgICAgIFwiQmxhY2ttYXIgR2FtYml0XCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwMXBwcHAvOC8zcDQvM1BQMy84L1BQUDJQUFAvUk5CUUtCTlIgYiBLUWtxIC0gMCAyXCIsXHJcbiAgICAgIFwiQmxhY2ttYXLigJNEaWVtZXJfR2FtYml0XCIsXHJcbiAgICAgIFtcImQ0IGQ1XCIsIFwiZTRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJFMTFcIixcclxuICAgICAgXCJCb2dvLUluZGlhbiBEZWZlbmNlXCIsXHJcbiAgICAgIFwicm5icWsyci9wcHBwMXBwcC80cG4yLzgvMWJQUDQvNU4yL1BQMlBQUFAvUk5CUUtCMVIgdyBLUWtxIC0gMiA0XCIsXHJcbiAgICAgIFwiQm9nby1JbmRpYW5fRGVmZW5jZVwiLFxyXG4gICAgICBbXCJkNCBOZjZcIiwgXCJjNCBlNlwiLCBcIk5mMyBCYjQrXCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRTAwXCIsXHJcbiAgICAgIFwiQ2F0YWxhbiBPcGVuaW5nXCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHBwcDFwcHAvNHBuMi84LzJQUDQvNlAxL1BQMlBQMVAvUk5CUUtCTlIgYiBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiQ2F0YWxhbl9PcGVuaW5nXCIsXHJcbiAgICAgIFtcImQ0IE5mNlwiLCBcImM0IGU2XCIsIFwiZzNcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJFMDZcIixcclxuICAgICAgXCJDYXRhbGFuIE9wZW5pbmc6IENsb3NlZCBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxazJyL3BwcDFicHBwLzRwbjIvM3A0LzJQUDQvNU5QMS9QUDJQUEJQL1JOQlFLMlIgYiBLUWtxIC0gMyA1XCIsXHJcbiAgICAgIFwiQ2F0YWxhbl9PcGVuaW5nXCIsXHJcbiAgICAgIFtcImQ0IE5mNlwiLCBcImM0IGU2XCIsIFwiZzMgZDVcIiwgXCJOZjMgQmU3XCIsIFwiQmcyXCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTgwXCIsXHJcbiAgICAgIFwiRHV0Y2ggRGVmZW5jZVwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcHBwMXBwLzgvNXAyLzNQNC84L1BQUDFQUFBQL1JOQlFLQk5SIHcgS1FrcSAtIDAgMlwiLFxyXG4gICAgICBcIkR1dGNoX0RlZmVuY2VcIixcclxuICAgICAgW1wiZDQgZjVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJBOTZcIixcclxuICAgICAgXCJEdXRjaCBEZWZlbmNlOiBDbGFzc2ljYWwgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icTFyazEvcHBwMWIxcHAvM3BwbjIvNXAyLzJQUDQvNU5QMS9QUDJQUEJQL1JOQlExUksxIHcgLSAtIDAgN1wiLFxyXG4gICAgICBcIkR1dGNoX0RlZmVuY2VcIixcclxuICAgICAgW1wiZDQgZjVcIiwgXCJjNCBOZjZcIiwgXCJnMyBlNlwiLCBcIkJnMiBCZTdcIiwgXCJOZjMgTy1PXCIsIFwiTy1PIGQ2XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTg3XCIsXHJcbiAgICAgIFwiRHV0Y2ggRGVmZW5jZTogTGVuaW5ncmFkIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnFrMnIvcHBwcHAxYnAvNW5wMS81cDIvMlBQNC81TlAxL1BQMlBQQlAvUk5CUUsyUiBiIEtRa3EgLSAzIDVcIixcclxuICAgICAgXCJEdXRjaF9EZWZlbmNlXCIsXHJcbiAgICAgIFtcImQ0IGY1XCIsIFwiYzQgTmY2XCIsIFwiZzMgZzZcIiwgXCJCZzIgQmc3XCIsIFwiTmYzXCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTgzXCIsXHJcbiAgICAgIFwiRHV0Y2ggRGVmZW5jZTogU3RhdW50b24gR2FtYml0XCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHBwcHAxcHAvNW4yLzZCMS8zUHAzLzJONS9QUFAyUFBQL1IyUUtCTlIgYiBLUWtxIC0gMyA0XCIsXHJcbiAgICAgIFwiRHV0Y2hfRGVmZW5jZVwiLFxyXG4gICAgICBbXCJkNCBmNVwiLCBcImU0IGZ4ZTRcIiwgXCJOYzMgTmY2XCIsIFwiQmc1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTkyXCIsXHJcbiAgICAgIFwiRHV0Y2ggRGVmZW5jZTogU3RvbmV3YWxsIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnExcmsxL3BwcDFiMXBwLzRwbjIvM3AxcDIvMlBQNC81TlAxL1BQMlBQQlAvUk5CUTFSSzEgdyAtIC0gMCA3XCIsXHJcbiAgICAgIFwiRHV0Y2hfRGVmZW5jZVwiLFxyXG4gICAgICBbXCJkNCBmNVwiLCBcImM0IE5mNlwiLCBcImczIGU2XCIsIFwiQmcyIEJlN1wiLCBcIk5mMyBPLU9cIiwgXCJPLU8gZDVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJEODBcIixcclxuICAgICAgXCJHcsO8bmZlbGQgRGVmZW5jZVwiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwcDFwcDFwLzVucDEvM3A0LzJQUDQvMk41L1BQMlBQUFAvUjFCUUtCTlIgdyBLUWtxIC0gMCA0XCIsXHJcbiAgICAgIFwiR3LDvG5mZWxkX0RlZmVuY2VcIixcclxuICAgICAgW1wiZDQgTmY2XCIsIFwiYzQgZzZcIiwgXCJOYzMgZDVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJEODJcIixcclxuICAgICAgXCJHcsO8bmZlbGQgRGVmZW5jZTogQnJpbmNrbWFubiBBdHRhY2tcIixcclxuICAgICAgXCJybmJxa2Ixci9wcHAxcHAxcC81bnAxLzNwNC8yUFAxQjIvMk41L1BQMlBQUFAvUjJRS0JOUiBiIEtRa3EgLSAxIDRcIixcclxuICAgICAgXCJHcsO8bmZlbGRfRGVmZW5jZSNMaW5lc193aXRoXzQuQmY0X2FuZF90aGVfR3IuQzMuQkNuZmVsZF9HYW1iaXRcIixcclxuICAgICAgW1wiZDQgTmY2XCIsIFwiYzQgZzZcIiwgXCJOYzMgZDVcIiwgXCJCZjRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJEODVcIixcclxuICAgICAgXCJHcsO8bmZlbGQgRGVmZW5jZTogRXhjaGFuZ2UgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHBwMXBwMXAvNnAxLzNuNC8zUDQvMk41L1BQMlBQUFAvUjFCUUtCTlIgdyBLUWtxIC0gMCA1XCIsXHJcbiAgICAgIFwiR3LDvG5mZWxkX0RlZmVuY2UjRXhjaGFuZ2VfVmFyaWF0aW9uOl80LmN4ZDVfTnhkNV81LmU0XCIsXHJcbiAgICAgIFtcImQ0IE5mNlwiLCBcImM0IGc2XCIsIFwiTmMzIGQ1XCIsIFwiY3hkNSBOeGQ1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRDgwXCIsXHJcbiAgICAgIFwiR3LDvG5mZWxkIERlZmVuY2U6IFJ1c3NpYW4gVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHBwMXBwMXAvNW5wMS8zcDQvMlBQNC8xUU41L1BQMlBQUFAvUjFCMUtCTlIgYiBLUWtxIC0gMSA0XCIsXHJcbiAgICAgIFwiR3LDvG5mZWxkX0RlZmVuY2UjUnVzc2lhbl9TeXN0ZW06XzQuTmYzX0JnN181LlFiM1wiLFxyXG4gICAgICBbXCJkNCBOZjZcIiwgXCJjNCBnNlwiLCBcIk5jMyBkNVwiLCBcIlFiM1wiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkQ5MFwiLFxyXG4gICAgICBcIkdyw7xuZmVsZCBEZWZlbmNlOiBUYWltYW5vdiBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxazJyL3BwcDFwcGJwLzVucDEvM3AyQjEvMlBQNC8yTjJOMi9QUDJQUFBQL1IyUUtCMVIgYiBLUWtxIC0gMyA1XCIsXHJcbiAgICAgIFwiR3LDvG5mZWxkX0RlZmVuY2UjVGFpbWFub3YuMjdzX1ZhcmlhdGlvbl93aXRoXzQuTmYzX0JnN181LkJnNVwiLFxyXG4gICAgICBbXCJkNCBOZjZcIiwgXCJjNCBnNlwiLCBcIk5jMyBkNVwiLCBcIk5mMyBCZzdcIiwgXCJCZzVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJFNjFcIixcclxuICAgICAgXCJLaW5nJ3MgSW5kaWFuIERlZmVuY2VcIixcclxuICAgICAgXCJybmJxa2Ixci9wcHBwcHAxcC81bnAxLzgvMlBQNC84L1BQMlBQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiS2luZydzX0luZGlhbl9EZWZlbmNlXCIsXHJcbiAgICAgIFtcImQ0IE5mNlwiLCBcImM0IGc2XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRTc3XCIsXHJcbiAgICAgIFwiS2luZydzIEluZGlhbiBEZWZlbmNlOiA0LmU0XCIsXHJcbiAgICAgIFwicm5icWsyci9wcHAxcHBicC8zcDFucDEvOC8yUFBQMy8yTjUvUFAzUFBQL1IxQlFLQk5SIHcgS1FrcSAtIDAgNVwiLFxyXG4gICAgICBcIktpbmcnc19JbmRpYW5fRGVmZW5jZVwiLFxyXG4gICAgICBbXCJkNCBOZjZcIiwgXCJjNCBnNlwiLCBcIk5jMyBCZzdcIiwgXCJlNCBkNlwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkU3M1wiLFxyXG4gICAgICBcIktpbmcncyBJbmRpYW4gRGVmZW5jZTogQXZlcmJha2ggVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icTFyazEvcHBwMXBwYnAvM3AxbnAxLzZCMS8yUFBQMy8yTjUvUFAyQlBQUC9SMlFLMU5SIGIgS1EgLSAzIDZcIixcclxuICAgICAgXCJLaW5nJ3NfSW5kaWFuX0RlZmVuY2UjQXZlcmJha2hfVmFyaWF0aW9uOl81LkJlMl8wLTBfNi5CZzVcIixcclxuICAgICAgW1wiZDQgTmY2XCIsIFwiYzQgZzZcIiwgXCJOYzMgQmc3XCIsIFwiZTQgZDZcIiwgXCJCZTIgTy1PXCIsIFwiQmc1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRTYyXCIsXHJcbiAgICAgIFwiS2luZydzIEluZGlhbiBEZWZlbmNlOiBGaWFuY2hldHRvIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnFrMnIvcHBwMXBwYnAvM3AxbnAxLzgvMlBQNC8yTjJOUDEvUFAyUFAxUC9SMUJRS0IxUiBiIEtRa3EgLSAwIDVcIixcclxuICAgICAgXCJLaW5nJ3NfSW5kaWFuX0RlZmVuY2UjRmlhbmNoZXR0b19WYXJpYXRpb246XzMuTmYzX0JnN180LmczXCIsXHJcbiAgICAgIFtcImQ0IE5mNlwiLCBcImM0IGc2XCIsIFwiTmMzIEJnN1wiLCBcIk5mMyBkNlwiLCBcImczXCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRTc2XCIsXHJcbiAgICAgIFwiS2luZydzIEluZGlhbiBEZWZlbmNlOiBGb3VyIFBhd25zIEF0dGFja1wiLFxyXG4gICAgICBcInJuYnFrMnIvcHBwMXBwYnAvM3AxbnAxLzgvMlBQUFAyLzJONS9QUDRQUC9SMUJRS0JOUiBiIEtRa3EgLSAwIDVcIixcclxuICAgICAgXCJLaW5nJTI3c19JbmRpYW5fRGVmZW5jZSxfRm91cl9QYXduc19BdHRhY2tcIixcclxuICAgICAgW1wiZDQgTmY2XCIsIFwiYzQgZzZcIiwgXCJOYzMgQmc3XCIsIFwiZTQgZDZcIiwgXCJmNFwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkU5MVwiLFxyXG4gICAgICBcIktpbmcncyBJbmRpYW4gRGVmZW5jZTogQ2xhc3NpY2FsIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnExcmsxL3BwcDFwcGJwLzNwMW5wMS84LzJQUFAzLzJOMk4yL1BQMkJQUFAvUjFCUUsyUiBiIEtRIC0gMyA2XCIsXHJcbiAgICAgIFwiS2luZydzX0luZGlhbl9EZWZlbmNlI0NsYXNzaWNhbF9WYXJpYXRpb246XzUuTmYzXzAtMF82LkJlMl9lNVwiLFxyXG4gICAgICBbXCJkNCBOZjZcIiwgXCJjNCBnNlwiLCBcIk5jMyBCZzdcIiwgXCJlNCBkNlwiLCBcIk5mMyBPLU9cIiwgXCJCZTJcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJFODBcIixcclxuICAgICAgXCJLaW5nJ3MgSW5kaWFuIERlZmVuY2U6IFPDpG1pc2NoIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnFrMnIvcHBwMXBwYnAvM3AxbnAxLzgvMlBQUDMvMk4yUDIvUFA0UFAvUjFCUUtCTlIgYiBLUWtxIC0gMCA1XCIsXHJcbiAgICAgIFwiS2luZydzX0luZGlhbl9EZWZlbmNlI1MuQzMuQTRtaXNjaF9WYXJpYXRpb246XzUuZjNcIixcclxuICAgICAgW1wiZDQgTmY2XCIsIFwiYzQgZzZcIiwgXCJOYzMgQmc3XCIsIFwiZTQgZDZcIiwgXCJmM1wiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkE0MVwiLFxyXG4gICAgICBcIlF1ZWVucydzIFBhd24gR2FtZTogTW9kZXJuIERlZmVuY2VcIixcclxuICAgICAgXCJybmJxazFuci9wcHAxcHBicC8zcDJwMS84LzJQUDQvMk41L1BQMlBQUFAvUjFCUUtCTlIgdyBLUWtxIC0gMiA0XCIsXHJcbiAgICAgIFwiUXVlZW4nc19QYXduX0dhbWUjMS4uLmc2XCIsXHJcbiAgICAgIFtcImQ0IGc2XCIsIFwiYzQgZDZcIiwgXCJOYzMgQmc3XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRTIwXCIsXHJcbiAgICAgIFwiTmltem8tSW5kaWFuIERlZmVuY2VcIixcclxuICAgICAgXCJybmJxazJyL3BwcHAxcHBwLzRwbjIvOC8xYlBQNC8yTjUvUFAyUFBQUC9SMUJRS0JOUiB3IEtRa3EgLSAyIDRcIixcclxuICAgICAgXCJOaW16by1JbmRpYW5fRGVmZW5jZVwiLFxyXG4gICAgICBbXCJkNCBOZjZcIiwgXCJjNCBlNlwiLCBcIk5jMyBCYjRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJFMzJcIixcclxuICAgICAgXCJOaW16by1JbmRpYW4gRGVmZW5jZTogQ2xhc3NpY2FsIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnFrMnIvcHBwcDFwcHAvNHBuMi84LzFiUFA0LzJONS9QUFExUFBQUC9SMUIxS0JOUiBiIEtRa3EgLSAzIDRcIixcclxuICAgICAgXCJOaW16by1JbmRpYW5fRGVmZW5jZSNDbGFzc2ljYWxfVmFyaWF0aW9uOl80LlFjMlwiLFxyXG4gICAgICBbXCJkNCBOZjZcIiwgXCJjNCBlNlwiLCBcIk5jMyBCYjRcIiwgXCJRYzJcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJFNDNcIixcclxuICAgICAgXCJOaW16by1JbmRpYW4gRGVmZW5jZTogRmlzY2hlciBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxazJyL3AxcHAxcHBwLzFwMnBuMi84LzFiUFA0LzJOMVAzL1BQM1BQUC9SMUJRS0JOUiB3IEtRa3EgLSAwIDVcIixcclxuICAgICAgXCJOaW16by1JbmRpYW5fRGVmZW5jZSM0Li4uYjZcIixcclxuICAgICAgW1wiZDQgTmY2XCIsIFwiYzQgZTZcIiwgXCJOYzMgQmI0XCIsIFwiZTMgYjZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJFNDFcIixcclxuICAgICAgXCJOaW16by1JbmRpYW4gRGVmZW5jZTogSMO8Ym5lciBWYXJpYXRpb25cIixcclxuICAgICAgXCJyMWJxazJyL3BwM3BwcC8ybnBwbjIvMnA1LzJQUDQvMlBCUE4yL1A0UFBQL1IxQlFLMlIgdyBLUWtxIC0gMCA4XCIsXHJcbiAgICAgIFwiTmltem8tSW5kaWFuX0RlZmVuY2UjNC4uLmM1XCIsXHJcbiAgICAgIFtcImQ0IE5mNlwiLCBcImM0IGU2XCIsIFwiTmMzIEJiNFwiLCBcImUzIGM1XCIsIFwiQmQzIE5jNlwiLCBcIk5mMyBCeGMzK1wiLCBcImJ4YzMgZDZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJFMjFcIixcclxuICAgICAgXCJOaW16by1JbmRpYW4gRGVmZW5jZTogS2FzcGFyb3YgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWsyci9wcHBwMXBwcC80cG4yLzgvMWJQUDQvMk4yTjIvUFAyUFBQUC9SMUJRS0IxUiBiIEtRa3EgLSAzIDRcIixcclxuICAgICAgXCJOaW16by1JbmRpYW5fRGVmZW5jZSNLYXNwYXJvdl9WYXJpYXRpb246XzQuTmYzXCIsXHJcbiAgICAgIFtcImQ0IE5mNlwiLCBcImM0IGU2XCIsIFwiTmMzIEJiNFwiLCBcIk5mM1wiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkUzMFwiLFxyXG4gICAgICBcIk5pbXpvLUluZGlhbiBEZWZlbmNlOiBMZW5pbmdyYWQgVmFyaWF0aW9uXCIsXHJcbiAgICAgIFwicm5icWsyci9wcHBwMXBwcC80cG4yLzZCMS8xYlBQNC8yTjUvUFAyUFBQUC9SMlFLQk5SIGIgS1FrcSAtIDMgNFwiLFxyXG4gICAgICBcIk5pbXpvLUluZGlhbl9EZWZlbmNlI090aGVyX3ZhcmlhdGlvbnNcIixcclxuICAgICAgW1wiZDQgTmY2XCIsIFwiYzQgZTZcIiwgXCJOYzMgQmI0XCIsIFwiQmc1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRTI2XCIsXHJcbiAgICAgIFwiTmltem8tSW5kaWFuIERlZmVuY2U6IFPDpG1pc2NoIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnFrMnIvcHBwcDFwcHAvNHBuMi84LzJQUDQvUDFQNS80UFBQUC9SMUJRS0JOUiBiIEtRa3EgLSAwIDVcIixcclxuICAgICAgXCJOaW16by1JbmRpYW5fRGVmZW5jZSNPdGhlcl92YXJpYXRpb25zXCIsXHJcbiAgICAgIFtcImQ0IE5mNlwiLCBcImM0IGU2XCIsIFwiTmMzIEJiNFwiLCBcImEzIEJ4YzMrXCIsIFwiYnhjM1wiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkE1M1wiLFxyXG4gICAgICBcIk9sZCBJbmRpYW4gRGVmZW5jZVwiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwcDFwcHBwLzNwMW4yLzgvMlBQNC84L1BQMlBQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiT2xkX0luZGlhbl9EZWZlbnNlXCIsXHJcbiAgICAgIFtcImQ0IE5mNlwiLCBcImM0IGQ2XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRDA2XCIsXHJcbiAgICAgIFwiUXVlZW4ncyBHYW1iaXRcIixcclxuICAgICAgXCJybmJxa2Juci9wcHAxcHBwcC84LzNwNC8yUFA0LzgvUFAyUFBQUC9STkJRS0JOUiBiIEtRa3EgLSAwIDJcIixcclxuICAgICAgXCJRdWVlbidzX0dhbWJpdFwiLFxyXG4gICAgICBbXCJkNCBkNVwiLCBcImM0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRDIwXCIsXHJcbiAgICAgIFwiUXVlZW4ncyBHYW1iaXQgQWNjZXB0ZWRcIixcclxuICAgICAgXCJybmJxa2Juci9wcHAxcHBwcC84LzgvMnBQNC84L1BQMlBQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCAzXCIsXHJcbiAgICAgIFwiUXVlZW4lMjdzX0dhbWJpdF9BY2NlcHRlZFwiLFxyXG4gICAgICBbXCJkNCBkNVwiLCBcImM0IGR4YzRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJENDNcIixcclxuICAgICAgXCJRdWVlbidzIEdhbWJpdCBEZWNsaW5lZDogU2VtaS1TbGF2IERlZmVuY2VcIixcclxuICAgICAgXCJybmJxa2Ixci9wcDNwcHAvMnAxcG4yLzNwNC8yUFA0LzJOMk4yL1BQMlBQUFAvUjFCUUtCMVIgdyBLUWtxIC0gMCA1XCIsXHJcbiAgICAgIFwiU2VtaS1TbGF2X0RlZmVuc2VcIixcclxuICAgICAgW1wiZDQgZDVcIiwgXCJjNCBlNlwiLCBcIk5jMyBOZjZcIiwgXCJOZjMgYzZcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJEMTBcIixcclxuICAgICAgXCJRdWVlbidzIEdhbWJpdCBEZWNsaW5lZDogU2xhdiBEZWZlbmNlXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHAycHBwcC8ycDUvM3A0LzJQUDQvOC9QUDJQUFBQL1JOQlFLQk5SIHcgS1FrcSAtIDAgM1wiLFxyXG4gICAgICBcIlNsYXZfRGVmZW5zZVwiLFxyXG4gICAgICBbXCJkNCBkNVwiLCBcImM0IGM2XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRDQwXCIsXHJcbiAgICAgIFwiUXVlZW4ncyBHYW1iaXQgRGVjbGluZWQ6IFNlbWktVGFycmFzY2ggRGVmZW5jZVwiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwM3BwcC80cG4yLzJwcDQvMlBQNC8yTjJOMi9QUDJQUFBQL1IxQlFLQjFSIHcgS1FrcSAtIDAgNVwiLFxyXG4gICAgICBcIlRhcnJhc2NoX0RlZmVuc2UjU2VtaS1UYXJyYXNjaF9EZWZlbnNlXCIsXHJcbiAgICAgIFtcImQ0IGQ1XCIsIFwiYzQgZTZcIiwgXCJOYzMgTmY2XCIsIFwiTmYzIGM1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRDMyXCIsXHJcbiAgICAgIFwiUXVlZW4ncyBHYW1iaXQgRGVjbGluZWQ6IFRhcnJhc2NoIERlZmVuY2VcIixcclxuICAgICAgXCJybmJxa2Juci9wcDNwcHAvNHAzLzJwcDQvMlBQNC8yTjUvUFAyUFBQUC9SMUJRS0JOUiB3IEtRa3EgLSAwIDRcIixcclxuICAgICAgXCJUYXJyYXNjaF9EZWZlbnNlXCIsXHJcbiAgICAgIFtcImQ0IGQ1XCIsIFwiYzQgZTZcIiwgXCJOYzMgYzVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJEMDhcIixcclxuICAgICAgXCJRdWVlbidzIEdhbWJpdDogQWxiaW4gQ291bnRlcmdhbWJpdFwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcDJwcHAvOC8zcHAzLzJQUDQvOC9QUDJQUFBQL1JOQlFLQk5SIHcgS1FrcSAtIDAgM1wiLFxyXG4gICAgICBcIkFsYmluX0NvdW50ZXJnYW1iaXRcIixcclxuICAgICAgW1wiZDQgZDVcIiwgXCJjNCBlNVwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkQwN1wiLFxyXG4gICAgICBcIlF1ZWVuJ3MgR2FtYml0OiBDaGlnb3JpbiBEZWZlbmNlXCIsXHJcbiAgICAgIFwicjFicWtibnIvcHBwMXBwcHAvMm41LzNwNC8yUFA0LzgvUFAyUFBQUC9STkJRS0JOUiB3IEtRa3EgLSAxIDNcIixcclxuICAgICAgXCJDaGlnb3Jpbl9EZWZlbnNlXCIsXHJcbiAgICAgIFtcImQ0IGQ1XCIsIFwiYzQgTmM2XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRTEyXCIsXHJcbiAgICAgIFwiUXVlZW4ncyBJbmRpYW4gRGVmZW5jZVwiLFxyXG4gICAgICBcInJuYnFrYjFyL3AxcHAxcHBwLzFwMnBuMi84LzJQUDQvNU4yL1BQMlBQUFAvUk5CUUtCMVIgdyBLUWtxIC0gMCA0XCIsXHJcbiAgICAgIFwiUXVlZW4nc19JbmRpYW5fRGVmZW5zZVwiLFxyXG4gICAgICBbXCJkNCBOZjZcIiwgXCJjNCBlNlwiLCBcIk5mMyBiNlwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkQwMlwiLFxyXG4gICAgICBcIkxvbmRvbiBTeXN0ZW1cIixcclxuICAgICAgXCJybmJxa2Ixci9wcHAxcHBwcC81bjIvM3A0LzNQMUIyLzVOMi9QUFAxUFBQUC9STjFRS0IxUiBiIEtRa3EgLSAzIDNcIixcclxuICAgICAgXCJMb25kb25fU3lzdGVtXCIsXHJcbiAgICAgIFtcImQ0IGQ1XCIsIFwiTmYzIE5mNlwiLCBcIkJmNFwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkQwMFwiLFxyXG4gICAgICBcIkxvbmRvbiBTeXN0ZW06IE1hc29uIEF0dGFja1wiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcDFwcHBwLzgvM3A0LzNQMUIyLzgvUFBQMVBQUFAvUk4xUUtCTlIgYiBLUWtxIC0gMSAyXCIsXHJcbiAgICAgIFwiTG9uZG9uX1N5c3RlbVwiLFxyXG4gICAgICBbXCJkNCBkNVwiLCBcIkJmNFwiXVxyXG4gICAgKSxcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkQwMVwiLFxyXG4gICAgICBcIlJhcHBvcnQtSm9iYXZhIFN5c3RlbVwiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwcDFwcHBwLzVuMi8zcDQvM1AxQjIvMk41L1BQUDFQUFBQL1IyUUtCTlIgYiBLUWtxIC0gMyAzXCIsXHJcbiAgICAgIFwiTG9uZG9uX1N5c3RlbVwiLFxyXG4gICAgICBbXCJkNCBkNVwiLCBcIk5jMyBOZjZcIiwgXCJCZjRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJEMDNcIixcclxuICAgICAgXCJUb3JyZSBBdHRhY2tcIixcclxuICAgICAgXCJybmJxa2Ixci9wcHAxcHBwcC81bjIvM3AyQjEvM1A0LzVOMi9QUFAxUFBQUC9STjFRS0IxUiBiIEtRa3EgLSAzIDNcIixcclxuICAgICAgXCJUb3JyZV9BdHRhY2tcIixcclxuICAgICAgW1wiZDQgZDVcIiwgXCJOZjMgTmY2XCIsIFwiQmc1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiRDAxXCIsXHJcbiAgICAgIFwiUmljaHRlci1WZXJlc292IEF0dGFja1wiLFxyXG4gICAgICBcInJuYnFrYjFyL3BwcDFwcHBwLzVuMi8zcDJCMS8zUDQvMk41L1BQUDFQUFBQL1IyUUtCTlIgYiBLUWtxIC0gMyAzXCIsXHJcbiAgICAgIFwiUmljaHRlci1WZXJlc292X0F0dGFja1wiLFxyXG4gICAgICBbXCJkNCBkNVwiLCBcIk5jMyBOZjZcIiwgXCJCZzVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJBNTJcIixcclxuICAgICAgXCJCdWRhcGVzdCBEZWZlbmNlXCIsXHJcbiAgICAgIFwicm5icWtiMXIvcHBwcDFwcHAvNW4yLzRwMy8yUFA0LzgvUFAyUFBQUC9STkJRS0JOUiB3IEtRa3EgLSAwIDNcIixcclxuICAgICAgXCJCdWRhcGVzdF9HYW1iaXRcIixcclxuICAgICAgW1wiZDQgTmY2XCIsIFwiYzQgZTVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJEMDBcIixcclxuICAgICAgXCJDbG9zZWQgR2FtZVwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcDFwcHBwLzgvM3A0LzNQNC84L1BQUDFQUFBQL1JOQlFLQk5SIHcgS1FrcSAtIDAgMlwiLFxyXG4gICAgICBcIkNsb3NlZF9HYW1lXCIsXHJcbiAgICAgIFtcImQ0IGQ1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTQ1XCIsXHJcbiAgICAgIFwiVHJvbXBvd3NreSBBdHRhY2tcIixcclxuICAgICAgXCJybmJxa2Ixci9wcHBwcHBwcC81bjIvNkIxLzNQNC84L1BQUDFQUFBQL1JOMVFLQk5SIGIgS1FrcSAtIDIgMlwiLFxyXG4gICAgICBcIlRyb21wb3dza3lfQXR0YWNrXCIsXHJcbiAgICAgIFtcImQ0IE5mNlwiLCBcIkJnNVwiXVxyXG4gICAgKSxcclxuICBdKSxcclxuICBuZXcgQ2F0ZWdvcnkoXCJOZjNcIiwgW1xyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTA0XCIsXHJcbiAgICAgIFwiWnVrZXJ0b3J0IE9wZW5pbmdcIixcclxuICAgICAgXCJybmJxa2Juci9wcHBwcHBwcC84LzgvOC81TjIvUFBQUFBQUFAvUk5CUUtCMVIgYiBLUWtxIC0gMSAxXCIsXHJcbiAgICAgIFwiWnVrZXJ0b3J0X09wZW5pbmdcIixcclxuICAgICAgW1wiTmYzXCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTA3XCIsXHJcbiAgICAgIFwiS2luZydzIEluZGlhbiBBdHRhY2tcIixcclxuICAgICAgXCJybmJxa2Juci9wcHAxcHBwcC84LzNwNC84LzVOUDEvUFBQUFBQMVAvUk5CUUtCMVIgYiBLUWtxIC0gMCAyXCIsXHJcbiAgICAgIFwiS2luZydzX0luZGlhbl9BdHRhY2tcIixcclxuICAgICAgW1wiTmYzIGQ1XCIsIFwiZzNcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJBMDlcIixcclxuICAgICAgXCJSw6l0aSBPcGVuaW5nXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwMXBwcHAvOC8zcDQvMlA1LzVOMi9QUDFQUFBQUC9STkJRS0IxUiBiIEtRa3EgLSAwIDJcIixcclxuICAgICAgXCJSw6l0aV9PcGVuaW5nXCIsXHJcbiAgICAgIFtcIk5mMyBkNVwiLCBcImM0XCJdXHJcbiAgICApLFxyXG4gIF0pLFxyXG4gIG5ldyBDYXRlZ29yeShcImM0XCIsIFtcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkExMFwiLFxyXG4gICAgICBcIkVuZ2xpc2ggT3BlbmluZ1wiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcHBwcHBwLzgvOC8yUDUvOC9QUDFQUFBQUC9STkJRS0JOUiBiIEtRa3EgLSAwIDFcIixcclxuICAgICAgXCJFbmdsaXNoX09wZW5pbmdcIixcclxuICAgICAgW1wiYzRcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJBMjBcIixcclxuICAgICAgXCJFbmdsaXNoIE9wZW5pbmc6IFJldmVyc2VkIFNpY2lsaWFuXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcDFwcHAvOC80cDMvMlA1LzgvUFAxUFBQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCAyXCIsXHJcbiAgICAgIFwiRW5nbGlzaF9PcGVuaW5nXCIsXHJcbiAgICAgIFtcImM0IGU1XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTMwXCIsXHJcbiAgICAgIFwiRW5nbGlzaCBPcGVuaW5nOiBTeW1tZXRyaWNhbCBWYXJpYXRpb25cIixcclxuICAgICAgXCJybmJxa2Juci9wcDFwcHBwcC84LzJwNS8yUDUvOC9QUDFQUFBQUC9STkJRS0JOUiB3IEtRa3EgLSAwIDJcIixcclxuICAgICAgXCJFbmdsaXNoX09wZW5pbmdcIixcclxuICAgICAgW1wiYzQgYzVcIl1cclxuICAgICksXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJBMjZcIixcclxuICAgICAgXCJFbmdsaXNoIE9wZW5pbmc6IENsb3NlZCBTeXN0ZW1cIixcclxuICAgICAgXCJyMWJxazFuci9wcHAycGJwLzJucDJwMS80cDMvMlA1LzJOUDJQMS9QUDJQUEJQL1IxQlFLMU5SIHcgS1FrcSAtIDAgNlwiLFxyXG4gICAgICBcIkVuZ2xpc2hfT3BlbmluZ1wiLFxyXG4gICAgICBbXCJjNCBlNVwiLCBcIk5jMyBOYzZcIiwgXCJnMyBnNlwiLCBcIkJnMiBCZzdcIiwgXCJkMyBkNlwiXVxyXG4gICAgKSxcclxuICBdKSxcclxuICBuZXcgQ2F0ZWdvcnkoXCJiM1wiLCBbXHJcbiAgICBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuICAgICAgXCJBMDFcIixcclxuICAgICAgXCJOaW16by1MYXJzZW4gQXR0YWNrXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcHBwcHAvOC84LzgvMVA2L1AxUFBQUFBQL1JOQlFLQk5SIGIgS1FrcSAtIDAgMVwiLFxyXG4gICAgICBcIkxhcnNlbidzX09wZW5pbmdcIixcclxuICAgICAgW1wiYjNcIl1cclxuICAgICksXHJcbiAgXSksXHJcbiAgbmV3IENhdGVnb3J5KFwiYjRcIiwgW1xyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTAwXCIsXHJcbiAgICAgIFwiU29rb2xza3kgT3BlbmluZ1wiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcHBwcHBwLzgvOC8xUDYvOC9QMVBQUFBQUC9STkJRS0JOUiBiIEtRa3EgLSAwIDFcIixcclxuICAgICAgXCJTb2tvbHNreV9PcGVuaW5nXCIsXHJcbiAgICAgIFtcImI0XCJdXHJcbiAgICApLFxyXG4gIF0pLFxyXG4gIG5ldyBDYXRlZ29yeShcImY0XCIsIFtcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkEwMlwiLFxyXG4gICAgICBcIkJpcmQncyBPcGVuaW5nXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcHBwcHAvOC84LzVQMi84L1BQUFBQMVBQL1JOQlFLQk5SIGIgS1FrcSAtIDAgMVwiLFxyXG4gICAgICBcIkJpcmQnc19PcGVuaW5nXCIsXHJcbiAgICAgIFtcImY0XCJdXHJcbiAgICApLFxyXG4gICAgbmV3IFN0YXJ0aW5nUG9zaXRpb24oXHJcbiAgICAgIFwiQTAyXCIsXHJcbiAgICAgIFwiQmlyZCdzIE9wZW5pbmc6IER1dGNoIFZhcmlhdGlvblwiLFxyXG4gICAgICBcInJuYnFrYm5yL3BwcDFwcHBwLzgvM3A0LzVQMi84L1BQUFBQMVBQL1JOQlFLQk5SIHcgS1FrcSAtIDAgMlwiLFxyXG4gICAgICBcIkJpcmQnc19PcGVuaW5nXCIsXHJcbiAgICAgIFtcImY0IGQ1XCJdXHJcbiAgICApLFxyXG4gIF0pLFxyXG4gIG5ldyBDYXRlZ29yeShcImczXCIsIFtcclxuICAgIG5ldyBTdGFydGluZ1Bvc2l0aW9uKFxyXG4gICAgICBcIkEwMFwiLFxyXG4gICAgICBcIkh1bmdhcmlhbiBPcGVuaW5nXCIsXHJcbiAgICAgIFwicm5icWtibnIvcHBwcHBwcHAvOC84LzgvNlAxL1BQUFBQUDFQL1JOQlFLQk5SIGIgS1FrcSAtIDAgMVwiLFxyXG4gICAgICBcIktpbmcnc19GaWFuY2hldHRvX09wZW5pbmdcIixcclxuICAgICAgW1wiZzNcIl1cclxuICAgICksXHJcbiAgXSksXHJcbl07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjYXRlZ29yaWVzO1xyXG4iLCJpbXBvcnQgeyBOb3RpY2UsIHNldEljb24sIFNldHRpbmcgfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0IHsgQ2hlc3NlciB9IGZyb20gXCIuL0NoZXNzZXJcIjtcclxuaW1wb3J0IHN0YXJ0aW5nUG9zaXRvbnMgZnJvbSBcIi4vc3RhcnRpbmdQb3NpdGlvbnNcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoZXNzZXJNZW51IHtcclxuICBwcml2YXRlIGNoZXNzZXI6IENoZXNzZXI7XHJcbiAgcHJpdmF0ZSBjb250YWluZXJFbDogSFRNTEVsZW1lbnQ7XHJcblxyXG4gIHByaXZhdGUgbW92ZXNMaXN0RWw6IEhUTUxFbGVtZW50O1xyXG5cclxuICBjb25zdHJ1Y3RvcihwYXJlbnRFbDogSFRNTEVsZW1lbnQsIGNoZXNzZXI6IENoZXNzZXIpIHtcclxuICAgIHRoaXMuY2hlc3NlciA9IGNoZXNzZXI7XHJcblxyXG4gICAgdGhpcy5jb250YWluZXJFbCA9IHBhcmVudEVsLmNyZWF0ZURpdihcImNoZXNzLW1lbnUtY29udGFpbmVyXCIsIChjb250YWluZXJFbCkgPT4ge1xyXG4gICAgICBjb250YWluZXJFbC5jcmVhdGVEaXYoeyBjbHM6IFwiY2hlc3MtbWVudS1zZWN0aW9uXCIgfSwgKHNlY3Rpb25FbCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdEVsID0gc2VjdGlvbkVsLmNyZWF0ZUVsKFxyXG4gICAgICAgICAgXCJzZWxlY3RcIixcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2xzOiBcImRyb3Bkb3duIGNoZXNzLXN0YXJ0aW5nLXBvc2l0aW9uLWRyb3Bkb3duXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgKGVsKSA9PiB7XHJcbiAgICAgICAgICAgIGVsLmNyZWF0ZUVsKFwib3B0aW9uXCIsIHtcclxuICAgICAgICAgICAgICB2YWx1ZTogXCJzdGFydGluZy1wb3NpdGlvblwiLFxyXG4gICAgICAgICAgICAgIHRleHQ6IFwiU3RhcnRpbmcgUG9zaXRpb25cIixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGVsLmNyZWF0ZUVsKFwib3B0aW9uXCIsIHtcclxuICAgICAgICAgICAgICB2YWx1ZTogXCJjdXN0b21cIixcclxuICAgICAgICAgICAgICB0ZXh0OiBcIkN1c3RvbVwiLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZWwuY3JlYXRlRWwoXCJvcHRncm91cFwiLCB7fSwgKG9wdGdyb3VwKSA9PiB7XHJcbiAgICAgICAgICAgICAgb3B0Z3JvdXAubGFiZWwgPSBcIlBvcHVsYXIgT3BlbmluZ3NcIjtcclxuICAgICAgICAgICAgICBzdGFydGluZ1Bvc2l0b25zLmZvckVhY2goKGNhdGVnb3J5KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeS5pdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIG9wdGdyb3VwLmNyZWF0ZUVsKFwib3B0aW9uXCIsIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogaXRlbS5lY28sXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogaXRlbS5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0aW5nUG9zaXRpb24gPSB0aGlzLmdldFN0YXJ0aW5nUG9zaXRpb25Gcm9tRmVuKGNoZXNzZXIuZ2V0RmVuKCkpO1xyXG4gICAgICAgICAgICBjb25zdCBzdGFydGluZ1Bvc2l0aW9uTmFtZSA9IHN0YXJ0aW5nUG9zaXRpb25cclxuICAgICAgICAgICAgICA/IHN0YXJ0aW5nUG9zaXRpb24uZWNvXHJcbiAgICAgICAgICAgICAgOiBcImN1c3RvbVwiO1xyXG4gICAgICAgICAgICBlbC52YWx1ZSA9IHN0YXJ0aW5nUG9zaXRpb25OYW1lO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHNlbGVjdEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGV2KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IChldi50YXJnZXQgYXMgYW55KS52YWx1ZTtcclxuXHJcbiAgICAgICAgICBpZiAodmFsdWUgPT09IFwic3RhcnRpbmctcG9zaXRpb25cIikge1xyXG4gICAgICAgICAgICB0aGlzLmNoZXNzZXIubG9hZEZlbihcclxuICAgICAgICAgICAgICBcInJuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCAxXCIsXHJcbiAgICAgICAgICAgICAgW11cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHN0YXJ0aW5nUG9zaXRpb24gPSBzdGFydGluZ1Bvc2l0b25zXHJcbiAgICAgICAgICAgIC5mbGF0TWFwKChjYXQpID0+IGNhdC5pdGVtcylcclxuICAgICAgICAgICAgLmZpbmQoKGl0ZW0pID0+IGl0ZW0uZWNvID09PSB2YWx1ZSk7XHJcblxyXG4gICAgICAgICAgdGhpcy5jaGVzc2VyLmxvYWRGZW4oc3RhcnRpbmdQb3NpdGlvbi5mZW4sIHN0YXJ0aW5nUG9zaXRpb24ubW92ZXMpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBuZXcgU2V0dGluZyhzZWN0aW9uRWwpLnNldE5hbWUoXCJFbmFibGUgRnJlZSBNb3ZlP1wiKS5hZGRUb2dnbGUoKHRvZ2dsZSkgPT4ge1xyXG4gICAgICAgICAgdG9nZ2xlLnNldFZhbHVlKHRoaXMuY2hlc3Nlci5nZXRCb2FyZFN0YXRlKCkubW92YWJsZS5mcmVlKTtcclxuICAgICAgICAgIHRvZ2dsZS5vbkNoYW5nZSgodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jaGVzc2VyLnNldEZyZWVNb3ZlKHZhbHVlKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pLnNldHRpbmdFbC5jbGFzc0xpc3QuYWRkKFwiY2hlc3Nlci1oaWRlLXNldHRpbmdcIik7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5tb3Zlc0xpc3RFbCA9IHRoaXMuY29udGFpbmVyRWwuY3JlYXRlRGl2KHtcclxuICAgICAgY2xzOiBcImNoZXNzLW1lbnUtc2VjdGlvbiBjaGVzcy1tZW51LXNlY3Rpb24tdGFsbFwiLFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5yZWRyYXdNb3ZlTGlzdCgpO1xyXG4gICAgdGhpcy5jcmVhdGVUb29sYmFyKCk7XHJcbiAgfVxyXG5cclxuICBnZXRTdGFydGluZ1Bvc2l0aW9uRnJvbUZlbihmZW46IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHN0YXJ0aW5nUG9zaXRvbnMuZmxhdE1hcCgoY2F0KSA9PiBjYXQuaXRlbXMpLmZpbmQoKGl0ZW0pID0+IGl0ZW0uZWNvID09PSBmZW4pO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlVG9vbGJhcigpIHtcclxuICAgICAgY29uc3QgYnRuQ29udGFpbmVyID0gdGhpcy5jb250YWluZXJFbC5jcmVhdGVEaXYoXCJjaGVzcy10b29sYmFyLWNvbnRhaW5lclwiKTtcclxuICAgICAgYnRuQ29udGFpbmVyLmNyZWF0ZUVsKFwiYVwiLCBcInZpZXctYWN0aW9uXCIsIChidG4pID0+IHtcclxuICAgICAgICAgIGJ0bi5hcmlhTGFiZWwgPSBcIkZsaXAgYm9hcmRcIjtcclxuICAgICAgICAgIHNldEljb24oYnRuLCBcInN3aXRjaFwiKTtcclxuICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgdGhpcy5jaGVzc2VyLmZsaXBCb2FyZCgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBidG5Db250YWluZXIuY3JlYXRlRWwoXCJhXCIsIFwidmlldy1hY3Rpb25cIiwgKGJ0bikgPT4ge1xyXG4gICAgICAgICAgYnRuLmFyaWFMYWJlbCA9IFwiSG9tZVwiO1xyXG4gICAgICAgICAgc2V0SWNvbihidG4sIFwiaG91c2VcIik7XHJcbiAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgIHdoaWxlICh0aGlzLmNoZXNzZXIuY3VycmVudE1vdmVJZHggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmNoZXNzZXIudW5kb19tb3ZlKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBidG5Db250YWluZXIuY3JlYXRlRWwoXCJhXCIsIFwidmlldy1hY3Rpb25cIiwgKGJ0bikgPT4ge1xyXG4gICAgICAgIGJ0bi5hcmlhTGFiZWwgPSBcIkluaXRcIjtcclxuICAgICAgICBzZXRJY29uKGJ0biwgXCJyb3RhdGUtY2N3XCIpO1xyXG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNoZXNzZXIubG9hZEluaXRpYWxQb3NpdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgYnRuQ29udGFpbmVyLmNyZWF0ZUVsKFwiYVwiLCBcInZpZXctYWN0aW9uXCIsIChidG4pID0+IHtcclxuICAgICAgICAgIGJ0bi5hcmlhTGFiZWwgPSBcIkNvcHkgRkVOXCI7XHJcbiAgICAgICAgICBzZXRJY29uKGJ0biwgXCJ0d28tYmxhbmstcGFnZXNcIik7XHJcbiAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0aGlzLmNoZXNzZXIuZ2V0RmVuKCkpO1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJGRU4gY29wacOpICFcIik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJFcnJldXIgbG9ycyBkZSBsYSBjb3BpZSBkdSBGRU5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgYnRuQ29udGFpbmVyLmNyZWF0ZUVsKFwiYVwiLCBcInZpZXctYWN0aW9uXCIsIChidG4pID0+IHtcclxuICAgICAgICBidG4uYXJpYUxhYmVsID0gXCJDb3B5IFBHTlwiO1xyXG4gICAgICAgIHNldEljb24oYnRuLCBcInNjcm9sbC10ZXh0XCIpO1xyXG4gICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKGUpID0+IHtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmNoZXNzZXIuZ2V0UGduKCk7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb250ZW50KTtcclxuICAgICAgICAgICAgbmV3IE5vdGljZShcIlBHTiBjb3Bpw6kgIVwiKTtcclxuICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICBuZXcgTm90aWNlKFwiRXJyZXVyIGxvcnMgZGUgbGEgY29waWUgZHUgUEdOXCIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgYnRuQ29udGFpbmVyLmNyZWF0ZUVsKFwiYVwiLCBcInZpZXctYWN0aW9uXCIsIChidG4pID0+IHtcclxuICAgICAgICAgIGJ0bi5hcmlhTGFiZWwgPSBcIlVuZG9cIjtcclxuICAgICAgICAgIHNldEljb24oYnRuLCBcImxlZnQtYXJyb3dcIik7XHJcbiAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgIHRoaXMuY2hlc3Nlci51bmRvX21vdmUoKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgYnRuQ29udGFpbmVyLmNyZWF0ZUVsKFwiYVwiLCBcInZpZXctYWN0aW9uXCIsIChidG4pID0+IHtcclxuICAgICAgICAgIGJ0bi5hcmlhTGFiZWwgPSBcIlJlZG9cIjtcclxuICAgICAgICAgIHNldEljb24oYnRuLCBcInJpZ2h0LWFycm93XCIpO1xyXG4gICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICB0aGlzLmNoZXNzZXIucmVkb19tb3ZlKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICByZWRyYXdNb3ZlTGlzdCgpIHtcclxuICAgIHRoaXMubW92ZXNMaXN0RWwuZW1wdHkoKTtcclxuICAgIHRoaXMubW92ZXNMaXN0RWwuY3JlYXRlRGl2KHtcclxuICAgICAgdGV4dDogdGhpcy5jaGVzc2VyLnR1cm4oKSA9PT0gXCJiXCIgPyBcIkJsYWNrJ3MgdHVyblwiIDogXCJXaGl0ZSdzIHR1cm5cIixcclxuICAgICAgY2xzOiBcImNoZXNzLXR1cm4tdGV4dFwiLFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLm1vdmVzTGlzdEVsLmNyZWF0ZURpdihcImNoZXNzLW1vdmUtbGlzdFwiLCAobW92ZUxpc3RFbCkgPT4ge1xyXG4gICAgICB0aGlzLmNoZXNzZXIuaGlzdG9yeSgpLmZvckVhY2goKG1vdmUsIGlkeCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG1vdmVFbCA9IG1vdmVMaXN0RWwuY3JlYXRlRGl2KHtcclxuICAgICAgICAgIGNsczogYGNoZXNzLW1vdmUgJHtcclxuICAgICAgICAgICAgdGhpcy5jaGVzc2VyLmN1cnJlbnRNb3ZlSWR4ID09PSBpZHggPyBcImNoZXNzLW1vdmUtYWN0aXZlXCIgOiBcIlwiXHJcbiAgICAgICAgICB9YCxcclxuICAgICAgICAgIHRleHQ6IG1vdmUuc2FuLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG1vdmVFbC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2KSA9PiB7XHJcbiAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgdGhpcy5jaGVzc2VyLnVwZGF0ZV90dXJuX2lkeChpZHgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWJ1ZyhkZWJ1Z0ZuOiAoKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgaWYgKHByb2Nlc3MuZW52LkRFQlVHKSB7XHJcbiAgICBkZWJ1Z0ZuKCk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IG5hbm9pZCB9IGZyb20gXCJuYW5vaWRcIjtcclxuaW1wb3J0IHtcclxuICBBcHAsXHJcbiAgRWRpdG9yUG9zaXRpb24sXHJcbiAgTWFya2Rvd25Qb3N0UHJvY2Vzc29yQ29udGV4dCxcclxuICBNYXJrZG93blJlbmRlckNoaWxkLFxyXG4gIE1hcmtkb3duVmlldyxcclxuICBOb3RpY2UsXHJcbiAgcGFyc2VZYW1sLFxyXG4gIHN0cmluZ2lmeVlhbWwsXHJcbn0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCB7IENoZXNzLCBDaGVzc0luc3RhbmNlLCBNb3ZlLCBTcXVhcmUgfSBmcm9tIFwiY2hlc3MuanNcIjtcclxuaW1wb3J0IHsgQ2hlc3Nncm91bmQgfSBmcm9tIFwiY2hlc3Nncm91bmRcIjtcclxuaW1wb3J0IHsgQXBpIH0gZnJvbSBcImNoZXNzZ3JvdW5kL2FwaVwiO1xyXG5pbXBvcnQgeyBDb2xvciwgS2V5IH0gZnJvbSBcImNoZXNzZ3JvdW5kL3R5cGVzXCI7XHJcbmltcG9ydCB7IERyYXdTaGFwZSB9IGZyb20gXCJjaGVzc2dyb3VuZC9kcmF3XCI7XHJcblxyXG5pbXBvcnQgeyBDaGVzc2VyQ29uZmlnLCBwYXJzZV91c2VyX2NvbmZpZyB9IGZyb20gXCIuL0NoZXNzZXJDb25maWdcIjtcclxuaW1wb3J0IHsgQ2hlc3NlclNldHRpbmdzIH0gZnJvbSBcIi4vQ2hlc3NlclNldHRpbmdzXCI7XHJcbmltcG9ydCBDaGVzc2VyTWVudSBmcm9tIFwiLi9tZW51XCI7XHJcbmltcG9ydCB7IFN0YXJ0aW5nUG9zaXRpb24gfSBmcm9tICcuL3N0YXJ0aW5nUG9zaXRpb25zJztcclxuXHJcbi8vIFRvIGJ1bmRsZSBhbGwgY3NzIGZpbGVzIGluIHN0eWxlcy5jc3Mgd2l0aCByb2xsdXBcclxuaW1wb3J0IFwiLi4vYXNzZXRzL2N1c3RvbS5jc3NcIjtcclxuaW1wb3J0IFwiY2hlc3Nncm91bmQvYXNzZXRzL2NoZXNzZ3JvdW5kLmJhc2UuY3NzXCI7XHJcbmltcG9ydCBcImNoZXNzZ3JvdW5kL2Fzc2V0cy9jaGVzc2dyb3VuZC5icm93bi5jc3NcIjtcclxuLy8gUGllY2Ugc3R5bGVzXHJcbmltcG9ydCBcIi4uL2Fzc2V0cy9waWVjZS1jc3MvYWxwaGEuY3NzXCI7XHJcbmltcG9ydCBcIi4uL2Fzc2V0cy9waWVjZS1jc3MvY2FsaWZvcm5pYS5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL3BpZWNlLWNzcy9jYXJkaW5hbC5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL3BpZWNlLWNzcy9jYnVybmV0dC5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL3BpZWNlLWNzcy9jaGVzczcuY3NzXCI7XHJcbmltcG9ydCBcIi4uL2Fzc2V0cy9waWVjZS1jc3MvY2hlc3NudXQuY3NzXCI7XHJcbmltcG9ydCBcIi4uL2Fzc2V0cy9waWVjZS1jc3MvY29tcGFuaW9uLmNzc1wiO1xyXG5pbXBvcnQgXCIuLi9hc3NldHMvcGllY2UtY3NzL2R1YnJvdm55LmNzc1wiO1xyXG5pbXBvcnQgXCIuLi9hc3NldHMvcGllY2UtY3NzL2ZhbnRhc3kuY3NzXCI7XHJcbmltcG9ydCBcIi4uL2Fzc2V0cy9waWVjZS1jc3MvZnJlc2NhLmNzc1wiO1xyXG5pbXBvcnQgXCIuLi9hc3NldHMvcGllY2UtY3NzL2dpb2NvLmNzc1wiO1xyXG5pbXBvcnQgXCIuLi9hc3NldHMvcGllY2UtY3NzL2dvdmVybm9yLmNzc1wiO1xyXG5pbXBvcnQgXCIuLi9hc3NldHMvcGllY2UtY3NzL2hvcnNleS5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL3BpZWNlLWNzcy9pY3BpZWNlcy5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL3BpZWNlLWNzcy9rb3NhbC5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL3BpZWNlLWNzcy9sZWlwemlnLmNzc1wiO1xyXG5pbXBvcnQgXCIuLi9hc3NldHMvcGllY2UtY3NzL2xldHRlci5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL3BpZWNlLWNzcy9saWJyYS5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL3BpZWNlLWNzcy9tYWVzdHJvLmNzc1wiO1xyXG5pbXBvcnQgXCIuLi9hc3NldHMvcGllY2UtY3NzL21lcmlkYS5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL3BpZWNlLWNzcy9waXJvdWV0dGkuY3NzXCI7XHJcbmltcG9ydCBcIi4uL2Fzc2V0cy9waWVjZS1jc3MvcGl4ZWwuY3NzXCI7XHJcbmltcG9ydCBcIi4uL2Fzc2V0cy9waWVjZS1jc3MvcmVpbGx5Y3JhaWcuY3NzXCI7XHJcbmltcG9ydCBcIi4uL2Fzc2V0cy9waWVjZS1jc3MvcmlvaGFjaGEuY3NzXCI7XHJcbmltcG9ydCBcIi4uL2Fzc2V0cy9waWVjZS1jc3Mvc2hhcGVzLmNzc1wiO1xyXG5pbXBvcnQgXCIuLi9hc3NldHMvcGllY2UtY3NzL3NwYXRpYWwuY3NzXCI7XHJcbmltcG9ydCBcIi4uL2Fzc2V0cy9waWVjZS1jc3Mvc3RhdW50eS5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL3BpZWNlLWNzcy90YXRpYW5hLmNzc1wiO1xyXG4vLyBCb2FyZCBzdHlsZXNcclxuaW1wb3J0IFwiLi4vYXNzZXRzL2JvYXJkLWNzcy9icm93bi5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL2JvYXJkLWNzcy9ibHVlLmNzc1wiO1xyXG5pbXBvcnQgXCIuLi9hc3NldHMvYm9hcmQtY3NzL2dyZWVuLmNzc1wiO1xyXG5pbXBvcnQgXCIuLi9hc3NldHMvYm9hcmQtY3NzL3B1cnBsZS5jc3NcIjtcclxuaW1wb3J0IFwiLi4vYXNzZXRzL2JvYXJkLWNzcy9pYy5jc3NcIjtcclxuaW1wb3J0IGRlYnVnIGZyb20gXCIuL2RlYnVnXCI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZHJhd19jaGVzc2JvYXJkKGFwcDogQXBwLCBzZXR0aW5nczogQ2hlc3NlclNldHRpbmdzKSB7XHJcbiAgcmV0dXJuIChzb3VyY2U6IHN0cmluZywgZWw6IEhUTUxFbGVtZW50LCBjdHg6IE1hcmtkb3duUG9zdFByb2Nlc3NvckNvbnRleHQpID0+IHtcclxuICAgIGxldCB1c2VyX2NvbmZpZyA9IHBhcnNlX3VzZXJfY29uZmlnKHNldHRpbmdzLCBzb3VyY2UpO1xyXG4gICAgY3R4LmFkZENoaWxkKG5ldyBDaGVzc2VyKGVsLCBjdHgsIHVzZXJfY29uZmlnLCBhcHApKTtcclxuICB9O1xyXG59XHJcblxyXG4vLyBQQVRDSCA6IFJlcGxhY2VzIGBsb2NhbFN0b3JhZ2VgIHdpdGggcGVyc2lzdGVudCBzdG9yYWdlIGluIHRoZSB2YXVsdFxyXG5kZWNsYXJlIGNvbnN0IGFwcDogQXBwO1xyXG5hc3luYyBmdW5jdGlvbiB3cml0ZV9zdGF0ZShpZDogc3RyaW5nLCBzdGF0ZTogYW55KSB7XHJcbiAgY29uc3QgZmlsZU5hbWUgPSBgLkNoZXNzZXJTdG9yYWdlLyR7aWR9Lmpzb25gO1xyXG4gIGNvbnN0IGNvbnRlbnQgPSBKU09OLnN0cmluZ2lmeShzdGF0ZSwgbnVsbCwgMik7XHJcblxyXG4gIGNvbnN0IGFkYXB0ZXIgPSBhcHAudmF1bHQuYWRhcHRlcjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGFkYXB0ZXIuZXhpc3RzKGZpbGVOYW1lKTtcclxuICAgIGlmIChleGlzdHMpIHtcclxuICAgICAgYXdhaXQgYWRhcHRlci53cml0ZShmaWxlTmFtZSwgY29udGVudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBDaGVjayB0aGF0IHRoZSBmb2xkZXIgZXhpc3RzXHJcbiAgICAgIGNvbnN0IGZvbGRlclBhdGggPSBgLkNoZXNzZXJTdG9yYWdlYDtcclxuICAgICAgY29uc3QgZm9sZGVyRXhpc3RzID0gYXdhaXQgYWRhcHRlci5leGlzdHMoZm9sZGVyUGF0aCk7XHJcbiAgICAgIGlmICghZm9sZGVyRXhpc3RzKSB7XHJcbiAgICAgICAgYXdhaXQgYWRhcHRlci5ta2Rpcihmb2xkZXJQYXRoKTtcclxuICAgICAgfVxyXG4gICAgICBhd2FpdCBhZGFwdGVyLndyaXRlKGZpbGVOYW1lLCBjb250ZW50KTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnIpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciB3cml0aW5nIGZpbGUgLmpzb24gOlwiLCBlcnIpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVhZF9zdGF0ZShpZDogc3RyaW5nKSB7XHJcbiAgY29uc3QgZmlsZU5hbWUgPSBgLkNoZXNzZXJTdG9yYWdlLyR7aWR9Lmpzb25gO1xyXG4gIGNvbnN0IGFkYXB0ZXIgPSBhcHAudmF1bHQuYWRhcHRlcjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGV4aXN0cyA9IGF3YWl0IGFkYXB0ZXIuZXhpc3RzKGZpbGVOYW1lKTtcclxuICAgIGlmICghZXhpc3RzKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgYWRhcHRlci5yZWFkKGZpbGVOYW1lKTtcclxuICAgIHJldHVybiBKU09OLnBhcnNlKGNvbnRlbnQpO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIHJlYWRpbmcgb3IgcGFyc2luZyBKU09OIDpcIiwgZXJyKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENoZXNzZXIgZXh0ZW5kcyBNYXJrZG93blJlbmRlckNoaWxkIHtcclxuICBwcml2YXRlIGN0eDogTWFya2Rvd25Qb3N0UHJvY2Vzc29yQ29udGV4dDtcclxuICBwcml2YXRlIGFwcDogQXBwO1xyXG5cclxuICBwcml2YXRlIGlkOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBjZzogQXBpO1xyXG4gIHByaXZhdGUgY2hlc3M6IENoZXNzSW5zdGFuY2U7XHJcblxyXG4gIHByaXZhdGUgbWVudTogQ2hlc3Nlck1lbnU7XHJcbiAgcHJpdmF0ZSBtb3ZlczogTW92ZVtdO1xyXG5cclxuICBwcml2YXRlIHVzZXJfY29uZmlnOiBhbnk7XHJcbiAgcHJpdmF0ZSBzdGFydGluZ1Bvc2l0aW9uOiBTdGFydGluZ1Bvc2l0aW9uO1xyXG5cclxuICBwdWJsaWMgY3VycmVudE1vdmVJZHg6IG51bWJlcjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBjb250YWluZXJFbDogSFRNTEVsZW1lbnQsXHJcbiAgICBjdHg6IE1hcmtkb3duUG9zdFByb2Nlc3NvckNvbnRleHQsXHJcbiAgICB1c2VyX2NvbmZpZzogQ2hlc3NlckNvbmZpZyxcclxuICAgIGFwcDogQXBwXHJcbiAgKSB7XHJcbiAgICBzdXBlcihjb250YWluZXJFbCk7XHJcblxyXG4gICAgdGhpcy5hcHAgPSBhcHA7XHJcbiAgICB0aGlzLmN0eCA9IGN0eDtcclxuICAgIHRoaXMuaWQgPSB1c2VyX2NvbmZpZy5pZCA/PyBuYW5vaWQoOCk7XHJcbiAgICB0aGlzLmNoZXNzID0gbmV3IENoZXNzKCk7XHJcblxyXG4gICAgY29uc3Qgc2F2ZWRfY29uZmlnID0gcmVhZF9zdGF0ZSh0aGlzLmlkKTtcclxuICAgIGNvbnN0IGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIHVzZXJfY29uZmlnLCBzYXZlZF9jb25maWcpO1xyXG4gICAgdGhpcy51c2VyX2NvbmZpZyA9IHVzZXJfY29uZmlnOyAgLy8gcmVxdWlyZWQgZm9yIHRoZSBmdW5jdGlvbiBsb2FkSW5pdGlhbFBvc2l0aW9uKClcclxuXHJcbiAgICB0aGlzLnN5bmNfYm9hcmRfd2l0aF9nYW1lc3RhdGUgPSB0aGlzLnN5bmNfYm9hcmRfd2l0aF9nYW1lc3RhdGUuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuc2F2ZV9tb3ZlID0gdGhpcy5zYXZlX21vdmUuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuc2F2ZV9zaGFwZXMgPSB0aGlzLnNhdmVfc2hhcGVzLmJpbmQodGhpcyk7XHJcblxyXG4gICAgLy8gU2F2ZSBgaWRgIGludG8gdGhlIGNvZGVibG9jayB5YW1sXHJcbiAgICBpZiAodXNlcl9jb25maWcuaWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICB0aGlzLmFwcC53b3Jrc3BhY2Uub25MYXlvdXRSZWFkeSgoKSA9PiB7XHJcbiAgICAgICAgd2luZG93LnNldEltbWVkaWF0ZSgoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLndyaXRlX2NvbmZpZyh7IGlkOiB0aGlzLmlkIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiBBbGxvd3MgdXNlciB0byBkZWZpbmUgYSBQR04gZGlyZWN0bHkgaW4gdGhlIGNvZGUgYmxvY2sgKi9cclxuXHRcdGlmIChjb25maWcucGduPy50cmltKCkpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRjb25zdCByYXdQZ24gPSBjb25maWcucGduLnRyaW0oKTtcclxuXHRcdFx0XHRjb25zdCBub3JtYWxpemVkUGduID0gcmF3UGduLnJlcGxhY2UoLyhcXGQrKVxccypcXC4vZywgJyQxLicpO1xyXG5cclxuXHRcdFx0XHRpZiAoIXRoaXMuY2hlc3MubG9hZF9wZ24obm9ybWFsaXplZFBnbikpIHtcclxuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgb3IgaW5jb21wYXRpYmxlIFBHTi5cIik7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRjb25zdCBtb3ZlcyA9IG5vcm1hbGl6ZWRQZ24ucmVwbGFjZSgvXFxkK1xcLi9nLCAnJykudHJpbSgpLnNwbGl0KC9cXHMrLyk7XHJcblx0XHRcdFx0Y29uc3QgbW92ZVBhaXJzID0gW107XHJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBtb3Zlcy5sZW5ndGg7IGkgKz0gMikge1xyXG5cdFx0XHRcdFx0bW92ZVBhaXJzLnB1c2gobW92ZXNbaSArIDFdID8gYCR7bW92ZXNbaV19ICR7bW92ZXNbaSArIDFdfWAgOiBtb3Zlc1tpXSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR0aGlzLnN0YXJ0aW5nUG9zaXRpb24gPSBuZXcgU3RhcnRpbmdQb3NpdGlvbihcclxuXHRcdFx0XHRcdFwiWHh4XCIsIFwiQ3VzdG9tXCIsIHRoaXMuY2hlc3MuZmVuKCksIFwiQ3VzdG9tXCIsIG1vdmVQYWlyc1xyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcihcIlBHTiBsb2FkaW5nIGVycm9yOlwiLCBlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChjb25maWcuZmVuKSB7XHJcbiAgICAgICAgICAgIGRlYnVnKCgpID0+IGNvbnNvbGUuZGVidWcoXCJsb2FkaW5nIGZyb20gZmVuXCIsIGNvbmZpZy5mZW4pKTtcclxuICAgICAgICAgICAgdGhpcy5jaGVzcy5sb2FkKGNvbmZpZy5mZW4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB0aGlzLm1vdmVzID0gY29uZmlnLm1vdmVzID8/IHRoaXMuY2hlc3MuaGlzdG9yeSh7IHZlcmJvc2U6IHRydWUgfSk7XHJcbiAgICB0aGlzLmN1cnJlbnRNb3ZlSWR4ID0gY29uZmlnLmN1cnJlbnRNb3ZlSWR4ID8/IHRoaXMubW92ZXMubGVuZ3RoIC0gMTtcclxuXHJcbiAgICBsZXQgbGFzdE1vdmU6IFtLZXksIEtleV0gPSB1bmRlZmluZWQ7XHJcbiAgICBpZiAodGhpcy5jdXJyZW50TW92ZUlkeCA+PSAwKSB7XHJcbiAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLm1vdmVzW3RoaXMuY3VycmVudE1vdmVJZHhdO1xyXG4gICAgICBsYXN0TW92ZSA9IFttb3ZlLmZyb20sIG1vdmUudG9dO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldHVwIFVJXHJcbiAgICB0aGlzLnNldF9zdHlsZShjb250YWluZXJFbCwgY29uZmlnLnBpZWNlU3R5bGUsIGNvbmZpZy5ib2FyZFN0eWxlKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIHRoaXMuY2cgPSBDaGVzc2dyb3VuZChjb250YWluZXJFbC5jcmVhdGVEaXYoKSwge1xyXG4gICAgICAgIGZlbjogdGhpcy5jaGVzcy5mZW4oKSxcclxuICAgICAgICBhZGREaW1lbnNpb25zQ3NzVmFyczogdHJ1ZSxcclxuICAgICAgICBsYXN0TW92ZSxcclxuICAgICAgICBvcmllbnRhdGlvbjogY29uZmlnLm9yaWVudGF0aW9uIGFzIENvbG9yLFxyXG4gICAgICAgIHZpZXdPbmx5OiBjb25maWcudmlld09ubHksXHJcbiAgICAgICAgZHJhd2FibGU6IHtcclxuICAgICAgICAgIGVuYWJsZWQ6IGNvbmZpZy5kcmF3YWJsZSxcclxuICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLnNhdmVfc2hhcGVzLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBuZXcgTm90aWNlKFwiQ2hlc3NlciBlcnJvcjogSW52YWxpZCBjb25maWdcIik7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBY3RpdmF0ZXMgdGhlIGNoZXNzIGxvZ2ljXHJcbiAgICB0aGlzLnNldEZyZWVNb3ZlKGNvbmZpZy5mcmVlKTtcclxuXHJcbiAgICAvLyBEcmF3IHNhdmVkIHNoYXBlc1xyXG4gICAgaWYgKGNvbmZpZy5zaGFwZXMpIHtcclxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uTGF5b3V0UmVhZHkoKCkgPT4ge1xyXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc3luY19ib2FyZF93aXRoX2dhbWVzdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICB0aGlzLmNnLnNldFNoYXBlcyhjb25maWcuc2hhcGVzKTtcclxuICAgICAgICB9LCAxMDApO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1lbnUgPSBuZXcgQ2hlc3Nlck1lbnUoY29udGFpbmVyRWwsIHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRfc3R5bGUoZWw6IEhUTUxFbGVtZW50LCBwaWVjZVN0eWxlOiBzdHJpbmcsIGJvYXJkU3R5bGU6IHN0cmluZykge1xyXG4gICAgZWwuYWRkQ2xhc3NlcyhbcGllY2VTdHlsZSwgYCR7Ym9hcmRTdHlsZX0tYm9hcmRgLCBcImNoZXNzZXItY29udGFpbmVyXCJdKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0X3NlY3Rpb25fcmFuZ2UoKTogW0VkaXRvclBvc2l0aW9uLCBFZGl0b3JQb3NpdGlvbl0ge1xyXG4gICAgY29uc3Qgc2VjdGlvbkluZm8gPSB0aGlzLmN0eC5nZXRTZWN0aW9uSW5mbyh0aGlzLmNvbnRhaW5lckVsKTtcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICB7XHJcbiAgICAgICAgbGluZTogc2VjdGlvbkluZm8ubGluZVN0YXJ0ICsgMSxcclxuICAgICAgICBjaDogMCxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGxpbmU6IHNlY3Rpb25JbmZvLmxpbmVFbmQsXHJcbiAgICAgICAgY2g6IDAsXHJcbiAgICAgIH0sXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRfY29uZmlnKHZpZXc6IE1hcmtkb3duVmlldyk6IENoZXNzZXJDb25maWcgfCB1bmRlZmluZWQge1xyXG4gICAgY29uc3QgW2Zyb20sIHRvXSA9IHRoaXMuZ2V0X3NlY3Rpb25fcmFuZ2UoKTtcclxuICAgIGNvbnN0IGNvZGVibG9ja1RleHQgPSB2aWV3LmVkaXRvci5nZXRSYW5nZShmcm9tLCB0byk7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gcGFyc2VZYW1sKGNvZGVibG9ja1RleHQpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBkZWJ1ZygoKSA9PlxyXG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJmYWlsZWQgdG8gcGFyc2UgY29kZWJsb2NrJ3MgeWFtbCBjb25maWdcIiwgY29kZWJsb2NrVGV4dClcclxuICAgICAgKTtcclxuICAgICAgLy8gZmFpbGVkIHRvIHBhcnNlLiBzaG93IGVycm9yLi4uXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgd3JpdGVfY29uZmlnKGNvbmZpZzogUGFydGlhbDxDaGVzc2VyQ29uZmlnPikge1xyXG4gICAgZGVidWcoKCkgPT4gY29uc29sZS5kZWJ1ZyhcIndyaXRpbmcgY29uZmlnIHRvIGxvY2FsU3RvcmFnZVwiLCBjb25maWcpKTtcclxuICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xyXG4gICAgaWYgKCF2aWV3KSB7XHJcbiAgICAgIG5ldyBOb3RpY2UoXCJDaGVzc2VyOiBGYWlsZWQgdG8gcmV0cmlldmUgYWN0aXZlIHZpZXdcIik7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDaGVzc2VyOiBGYWlsZWQgdG8gcmV0cmlldmUgdmlldyB3aGVuIHdyaXRpbmcgY29uZmlnXCIpO1xyXG4gICAgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgdXBkYXRlZCA9IHN0cmluZ2lmeVlhbWwoe1xyXG4gICAgICAgIC4uLnRoaXMuZ2V0X2NvbmZpZyh2aWV3KSxcclxuICAgICAgICAuLi5jb25maWcsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgW2Zyb20sIHRvXSA9IHRoaXMuZ2V0X3NlY3Rpb25fcmFuZ2UoKTtcclxuICAgICAgdmlldy5lZGl0b3IucmVwbGFjZVJhbmdlKHVwZGF0ZWQsIGZyb20sIHRvKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgLy8gZmFpbGVkIHRvIHBhcnNlLiBzaG93IGVycm9yLi4uXHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJmYWlsZWQgdG8gd3JpdGUgY29uZmlnXCIsIGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzYXZlX21vdmUoKSB7XHJcbiAgICBjb25zdCBjb25maWcgPSByZWFkX3N0YXRlKHRoaXMuaWQpO1xyXG4gICAgd3JpdGVfc3RhdGUodGhpcy5pZCwge1xyXG4gICAgICAuLi5jb25maWcsXHJcbiAgICAgIGN1cnJlbnRNb3ZlSWR4OiB0aGlzLmN1cnJlbnRNb3ZlSWR4LFxyXG4gICAgICBtb3ZlczogdGhpcy5tb3ZlcyxcclxuICAgICAgcGduOiB0aGlzLmNoZXNzLnBnbigpLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNhdmVfc2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pIHtcclxuICAgIGNvbnN0IGNvbmZpZyA9IHJlYWRfc3RhdGUodGhpcy5pZCk7XHJcbiAgICB3cml0ZV9zdGF0ZSh0aGlzLmlkLCB7XHJcbiAgICAgIC4uLmNvbmZpZyxcclxuICAgICAgc2hhcGVzLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHN5bmNfYm9hcmRfd2l0aF9nYW1lc3RhdGUoc2hvdWxkU2F2ZTogYm9vbGVhbiA9IHRydWUpIHtcclxuICAgIHRoaXMuY2cuc2V0KHtcclxuICAgICAgY2hlY2s6IHRoaXMuY2hlY2soKSxcclxuICAgICAgdHVybkNvbG9yOiB0aGlzLmNvbG9yX3R1cm4oKSxcclxuICAgICAgbW92YWJsZToge1xyXG4gICAgICAgIGZyZWU6IGZhbHNlLFxyXG4gICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yX3R1cm4oKSxcclxuICAgICAgICBkZXN0czogdGhpcy5kZXN0cygpLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5tZW51Py5yZWRyYXdNb3ZlTGlzdCgpO1xyXG4gICAgaWYgKHNob3VsZFNhdmUpIHtcclxuICAgICAgdGhpcy5zYXZlX21vdmUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBjb2xvcl90dXJuKCk6IENvbG9yIHtcclxuICAgIHJldHVybiB0aGlzLmNoZXNzLnR1cm4oKSA9PT0gXCJ3XCIgPyBcIndoaXRlXCIgOiBcImJsYWNrXCI7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGVzdHMoKTogTWFwPEtleSwgS2V5W10+IHtcclxuICAgIGNvbnN0IGRlc3RzID0gbmV3IE1hcCgpO1xyXG4gICAgdGhpcy5jaGVzcy5TUVVBUkVTLmZvckVhY2goKHMpID0+IHtcclxuICAgICAgY29uc3QgbXMgPSB0aGlzLmNoZXNzLm1vdmVzKHsgc3F1YXJlOiBzLCB2ZXJib3NlOiB0cnVlIH0pO1xyXG4gICAgICBpZiAobXMubGVuZ3RoKVxyXG4gICAgICAgIGRlc3RzLnNldChcclxuICAgICAgICAgIHMsXHJcbiAgICAgICAgICBtcy5tYXAoKG0pID0+IG0udG8pXHJcbiAgICAgICAgKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGRlc3RzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGNoZWNrKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hlc3MuaW5fY2hlY2soKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1bmRvX21vdmUoKSB7XHJcbiAgICB0aGlzLnVwZGF0ZV90dXJuX2lkeCh0aGlzLmN1cnJlbnRNb3ZlSWR4IC0gMSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVkb19tb3ZlKCkge1xyXG4gICAgdGhpcy51cGRhdGVfdHVybl9pZHgodGhpcy5jdXJyZW50TW92ZUlkeCArIDEpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVwZGF0ZV90dXJuX2lkeChtb3ZlSWR4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmIChtb3ZlSWR4IDwgLTEgfHwgbW92ZUlkeCA+PSB0aGlzLm1vdmVzLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaXNVbmRvaW5nID0gbW92ZUlkeCA8IHRoaXMuY3VycmVudE1vdmVJZHg7XHJcbiAgICBpZiAoaXNVbmRvaW5nKSB7XHJcbiAgICAgIHdoaWxlICh0aGlzLmN1cnJlbnRNb3ZlSWR4ID4gbW92ZUlkeCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1vdmVJZHgtLTtcclxuICAgICAgICB0aGlzLmNoZXNzLnVuZG8oKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd2hpbGUgKHRoaXMuY3VycmVudE1vdmVJZHggPCBtb3ZlSWR4KSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TW92ZUlkeCsrO1xyXG4gICAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLm1vdmVzW3RoaXMuY3VycmVudE1vdmVJZHhdO1xyXG4gICAgICAgIHRoaXMuY2hlc3MubW92ZShtb3ZlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBsYXN0TW92ZTogW0tleSwgS2V5XSA9IHVuZGVmaW5lZDtcclxuICAgIGlmICh0aGlzLmN1cnJlbnRNb3ZlSWR4ID49IDApIHtcclxuICAgICAgY29uc3QgbW92ZSA9IHRoaXMubW92ZXNbdGhpcy5jdXJyZW50TW92ZUlkeF07XHJcbiAgICAgIGxhc3RNb3ZlID0gW21vdmUuZnJvbSwgbW92ZS50b107XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jZy5zZXQoe1xyXG4gICAgICBmZW46IHRoaXMuY2hlc3MuZmVuKCksXHJcbiAgICAgIGxhc3RNb3ZlLFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnN5bmNfYm9hcmRfd2l0aF9nYW1lc3RhdGUoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXRGcmVlTW92ZShlbmFibGVkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICBpZiAoZW5hYmxlZCkge1xyXG4gICAgICB0aGlzLmNnLnNldCh7XHJcbiAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICBtb3ZlOiB0aGlzLnNhdmVfbW92ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1vdmFibGU6IHtcclxuICAgICAgICAgIGZyZWU6IHRydWUsXHJcbiAgICAgICAgICBjb2xvcjogXCJib3RoXCIsXHJcbiAgICAgICAgICBkZXN0czogdW5kZWZpbmVkLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5jZy5zZXQoe1xyXG4gICAgICAgIGV2ZW50czoge1xyXG4gICAgICAgICAgbW92ZTogKG9yaWc6IGFueSwgZGVzdDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLm1vdmUoeyBmcm9tOiBvcmlnLCB0bzogZGVzdCB9KTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TW92ZUlkeCsrO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVzID0gWy4uLnRoaXMubW92ZXMuc2xpY2UoMCwgdGhpcy5jdXJyZW50TW92ZUlkeCksIG1vdmVdO1xyXG4gICAgICAgICAgICB0aGlzLnN5bmNfYm9hcmRfd2l0aF9nYW1lc3RhdGUoKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuc3luY19ib2FyZF93aXRoX2dhbWVzdGF0ZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIHR1cm4oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jaGVzcy50dXJuKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGlzdG9yeSgpIHtcclxuICAgIHJldHVybiB0aGlzLm1vdmVzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZsaXBCb2FyZCgpIHtcclxuICAgIHJldHVybiB0aGlzLmNnLnRvZ2dsZU9yaWVudGF0aW9uKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Qm9hcmRTdGF0ZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmNnLnN0YXRlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldEZlbigpIHtcclxuICAgIHJldHVybiB0aGlzLmNoZXNzLmZlbigpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFBnbigpIHtcclxuICAgIGNvbnN0IHBnbiA9IHRoaXMuY2hlc3MucGduKCk7XHJcbiAgICByZXR1cm4gcGduICYmIHBnbi50cmltKCkgIT09ICcnID8gcGduIDogJzEuLi4nO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGxvYWRGZW4oZmVuOiBzdHJpbmcsIG1vdmVzPzogc3RyaW5nW10pOiB2b2lkIHtcclxuICAgIGxldCBsYXN0TW92ZTogW0tleSwgS2V5XSA9IHVuZGVmaW5lZDtcclxuICAgIGlmIChtb3Zlcykge1xyXG4gICAgICB0aGlzLmN1cnJlbnRNb3ZlSWR4ID0gLTE7XHJcbiAgICAgIHRoaXMubW92ZXMgPSBbXTtcclxuICAgICAgdGhpcy5jaGVzcy5yZXNldCgpO1xyXG5cclxuICAgICAgbW92ZXMuZm9yRWFjaCgoZnVsbE1vdmUpID0+IHtcclxuICAgICAgICBmdWxsTW92ZS5zcGxpdChcIiBcIikuZm9yRWFjaCgoaGFsZk1vdmUpID0+IHtcclxuICAgICAgICAgIGNvbnN0IG1vdmUgPSB0aGlzLmNoZXNzLm1vdmUoaGFsZk1vdmUpO1xyXG4gICAgICAgICAgdGhpcy5tb3Zlcy5wdXNoKG1vdmUpO1xyXG4gICAgICAgICAgdGhpcy5jdXJyZW50TW92ZUlkeCsrO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRNb3ZlSWR4ID49IDApIHtcclxuICAgICAgICBjb25zdCBtb3ZlID0gdGhpcy5tb3Zlc1t0aGlzLmN1cnJlbnRNb3ZlSWR4XTtcclxuICAgICAgICBsYXN0TW92ZSA9IFttb3ZlLmZyb20sIG1vdmUudG9dO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmNoZXNzLmxvYWQoZmVuKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNnLnNldCh7IGZlbjogdGhpcy5jaGVzcy5mZW4oKSwgbGFzdE1vdmUgfSk7XHJcbiAgICB0aGlzLnN5bmNfYm9hcmRfd2l0aF9nYW1lc3RhdGUoKTtcclxuICB9XHJcblxyXG5cdC8qIEFkZHMgYW4gXCJJbml0XCIgYnV0dG9uIHRvIHJlc2V0IHRoZSBib2FyZCB0byB0aGUgUEdOL0ZFTi1kZWZpbmVkIHN0YXJ0aW5nIHBvc2l0aW9uICovXHJcblx0YXN5bmMgbG9hZEluaXRpYWxQb3NpdGlvbigpIHtcclxuXHRcdGNvbnNvbGUubG9nKFwiSW5pdCB2aWEgdXNlcl9jb25maWdcIik7XHJcblxyXG5cdFx0aWYgKHRoaXMudXNlcl9jb25maWc/LnBnbiAmJiB0aGlzLnVzZXJfY29uZmlnLnBnbi50cmltKCkgIT09IFwiXCIpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJQR04gdG8gbG9hZCA6XCIsIHRoaXMudXNlcl9jb25maWcucGduKTtcclxuXHRcdFx0Y29uc3QgbG9hZGVkID0gdGhpcy5jaGVzcy5sb2FkX3Bnbih0aGlzLnVzZXJfY29uZmlnLnBnbik7XHJcblxyXG5cdFx0XHRpZiAoIWxvYWRlZCkge1xyXG5cdFx0XHRcdGNvbnNvbGUud2FybihcIkludmFsaWQgUEdOICFcIik7XHJcblx0XHRcdFx0bmV3IE5vdGljZShcIkludmFsaWQgUEdOICFcIik7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLm1vdmVzID0gdGhpcy5jaGVzcy5oaXN0b3J5KHsgdmVyYm9zZTogdHJ1ZSB9KTtcclxuXHRcdFx0dGhpcy5jdXJyZW50TW92ZUlkeCA9IC0xO1xyXG5cclxuXHRcdFx0Y29uc29sZS5sb2coXCJSZXBsYXkgbW92ZXMgdmlhIHVwZGF0ZV90dXJuX2lkeCgpXCIpO1xyXG5cdFx0XHR0aGlzLnVwZGF0ZV90dXJuX2lkeCh0aGlzLm1vdmVzLmxlbmd0aCAtIDEpOyAvLyDihpAgdGhhdCdzIHdoYXQgdXBkYXRlcyB0aGUgdmlzdWFsXHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcIk5vIFBHTiBkZWZpbmVkIOKGkiBjb21wbGV0ZSByZXNldFwiKTtcclxuXHRcdFx0dGhpcy5jaGVzcy5yZXNldCgpO1xyXG5cdFx0XHR0aGlzLm1vdmVzID0gW107XHJcblx0XHRcdHRoaXMuY3VycmVudE1vdmVJZHggPSAtMTtcclxuXHRcdFx0dGhpcy5zeW5jX2JvYXJkX3dpdGhfZ2FtZXN0YXRlKCk7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IEJPQVJEX1NUWUxFUywgUElFQ0VfU1RZTEVTIH0gZnJvbSBcIi4vQ2hlc3NlckNvbmZpZ1wiO1xyXG5pbXBvcnQgQ2hlc3NlclBsdWdpbiBmcm9tIFwiLi9tYWluXCI7XHJcblxyXG5pbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2hlc3NlclNldHRpbmdzIHtcclxuICBvcmllbnRhdGlvbjogc3RyaW5nO1xyXG4gIHZpZXdPbmx5OiBib29sZWFuO1xyXG4gIGRyYXdhYmxlOiBib29sZWFuO1xyXG4gIGZyZWU6IGJvb2xlYW47XHJcbiAgcGllY2VTdHlsZTogc3RyaW5nO1xyXG4gIGJvYXJkU3R5bGU6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IENoZXNzZXJTZXR0aW5ncyA9IHtcclxuICBvcmllbnRhdGlvbjogXCJ3aGl0ZVwiLFxyXG4gIHZpZXdPbmx5OiBmYWxzZSxcclxuICBkcmF3YWJsZTogdHJ1ZSxcclxuICBmcmVlOiBmYWxzZSxcclxuICBwaWVjZVN0eWxlOiBcImNidXJuZXR0XCIsXHJcbiAgYm9hcmRTdHlsZTogXCJicm93blwiLFxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIENoZXNzZXJTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgcGx1Z2luOiBDaGVzc2VyUGx1Z2luO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBDaGVzc2VyUGx1Z2luKSB7XHJcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XHJcbiAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcclxuICB9XHJcblxyXG4gIGRpc3BsYXkoKTogdm9pZCB7XHJcbiAgICBsZXQgeyBjb250YWluZXJFbCB9ID0gdGhpcztcclxuXHJcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIk9ic2lkaWFuIENoZXNzIFNldHRpbmdzXCIgfSk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiUGllY2UgU3R5bGVcIilcclxuICAgICAgLnNldERlc2MoXCJTZXRzIHRoZSBwaWVjZSBzdHlsZS5cIilcclxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT4ge1xyXG4gICAgICAgIGxldCBzdHlsZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcclxuICAgICAgICBQSUVDRV9TVFlMRVMubWFwKChzdHlsZSkgPT4gKHN0eWxlc1tzdHlsZV0gPSBzdHlsZSkpO1xyXG4gICAgICAgIGRyb3Bkb3duLmFkZE9wdGlvbnMoc3R5bGVzKTtcclxuXHJcbiAgICAgICAgZHJvcGRvd24uc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MucGllY2VTdHlsZSkub25DaGFuZ2UoKHBpZWNlU3R5bGUpID0+IHtcclxuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnBpZWNlU3R5bGUgPSBwaWVjZVN0eWxlO1xyXG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkJvYXJkIFN0eWxlXCIpXHJcbiAgICAgIC5zZXREZXNjKFwiU2V0cyB0aGUgYm9hcmQgc3R5bGUuXCIpXHJcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+IHtcclxuICAgICAgICBsZXQgc3R5bGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XHJcbiAgICAgICAgQk9BUkRfU1RZTEVTLm1hcCgoc3R5bGUpID0+IChzdHlsZXNbc3R5bGVdID0gc3R5bGUpKTtcclxuICAgICAgICBkcm9wZG93bi5hZGRPcHRpb25zKHN0eWxlcyk7XHJcblxyXG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmJvYXJkU3R5bGUpLm9uQ2hhbmdlKChib2FyZFN0eWxlKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5ib2FyZFN0eWxlID0gYm9hcmRTdHlsZTtcclxuICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJPcmllbnRhdGlvblwiKVxyXG4gICAgICAuc2V0RGVzYyhcIlNldHMgdGhlIGRlZmF1bHQgYm9hcmQgb3JpZW50YXRpb24uXCIpXHJcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+IHtcclxuICAgICAgICBkcm9wZG93bi5hZGRPcHRpb24oXCJ3aGl0ZVwiLCBcIldoaXRlXCIpO1xyXG4gICAgICAgIGRyb3Bkb3duLmFkZE9wdGlvbihcImJsYWNrXCIsIFwiQmxhY2tcIik7XHJcblxyXG4gICAgICAgIGRyb3Bkb3duLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLm9yaWVudGF0aW9uKS5vbkNoYW5nZSgob3JpZW50YXRpb24pID0+IHtcclxuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XHJcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiRHJhd2FibGVcIilcclxuICAgICAgLnNldERlc2MoXCJDb250cm9scyB0aGUgYWJpbGl0eSB0byBkcmF3IGFubm90YXRpb25zIChhcnJvd3MsIGNpcmNsZXMpIG9uIHRoZSBib2FyZC5cIilcclxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PiB7XHJcbiAgICAgICAgdG9nZ2xlLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmRyYXdhYmxlKS5vbkNoYW5nZSgoZHJhd2FibGUpID0+IHtcclxuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmRyYXdhYmxlID0gZHJhd2FibGU7XHJcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiVmlldy1vbmx5XCIpXHJcbiAgICAgIC5zZXREZXNjKFwiSWYgZW5hYmxlZCwgZGlzcGxheXMgYSBzdGF0aWMgY2hlc3MgYm9hcmQgKG5vIG1vdmVzLCBhbm5vdGF0aW9ucywgLi4uKS5cIilcclxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PiB7XHJcbiAgICAgICAgdG9nZ2xlLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnZpZXdPbmx5KS5vbkNoYW5nZSgodmlld09ubHkpID0+IHtcclxuICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnZpZXdPbmx5ID0gdmlld09ubHk7XHJcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgIC5zZXROYW1lKFwiRnJlZVwiKVxyXG4gICAgICAuc2V0RGVzYyhcIklmIGVuYWJsZWQsIGRpc2FibGVzIHRoZSBjaGVzcyBsb2dpYywgYWxsIG1vdmVzIGFyZSB2YWxpZC5cIilcclxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PiB7XHJcbiAgICAgICAgdG9nZ2xlLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmZyZWUpLm9uQ2hhbmdlKChmcmVlKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5mcmVlID0gZnJlZTtcclxuICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTWFya2Rvd25WaWV3LCBQbHVnaW4gfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0IHsgZHJhd19jaGVzc2JvYXJkIH0gZnJvbSBcIi4vQ2hlc3NlclwiO1xyXG5pbXBvcnQgeyBDaGVzc2VyU2V0dGluZ3MsIENoZXNzZXJTZXR0aW5nVGFiLCBERUZBVUxUX1NFVFRJTkdTIH0gZnJvbSBcIi4vQ2hlc3NlclNldHRpbmdzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGVzc2VyUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcclxuICBzZXR0aW5nczogQ2hlc3NlclNldHRpbmdzO1xyXG5cclxuICBhc3luYyBvbmxvYWQoKSB7XHJcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xyXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBDaGVzc2VyU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG4gICAgdGhpcy5yZWdpc3Rlck1hcmtkb3duQ29kZUJsb2NrUHJvY2Vzc29yKFxyXG4gICAgICBcImNoZXNzZXJcIiwgLy8ga2VlcCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkvYnJhbmRpbmdcclxuICAgICAgZHJhd19jaGVzc2JvYXJkKHRoaXMuYXBwLCB0aGlzLnNldHRpbmdzKVxyXG4gICAgKTtcclxuICAgIHRoaXMucmVnaXN0ZXJNYXJrZG93bkNvZGVCbG9ja1Byb2Nlc3NvcihcclxuICAgICAgXCJjaGVzc1wiLFxyXG4gICAgICBkcmF3X2NoZXNzYm9hcmQodGhpcy5hcHAsIHRoaXMuc2V0dGluZ3MpXHJcbiAgICApO1xyXG4gICAgXHJcbiAgICAvLyBSZXBsYWNlcyBgbG9jYWxTdG9yYWdlYCB3aXRoIHBlcnNpc3RlbnQgc3RvcmFnZSBpbiB0aGUgdmF1bHQgKGAuQ2hlc3NlclN0b3JhZ2UvYClcclxuICAgIGNvbnN0IGhpZGRlbkZvbGRlciA9ICcuQ2hlc3NlclN0b3JhZ2UnO1xyXG4gICAgY29uc3QgZm9sZGVyRXhpc3RzID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuYWRhcHRlci5leGlzdHMoaGlkZGVuRm9sZGVyKTtcclxuICAgIGlmICghZm9sZGVyRXhpc3RzKSB7XHJcbiAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIubWtkaXIoaGlkZGVuRm9sZGVyKTtcclxuICAgICAgY29uc29sZS5sb2coYEhpZGRlbiBmb2xkZXIgY3JlYXRlZCA6ICR7aGlkZGVuRm9sZGVyfWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgbG9hZFNldHRpbmdzKCkge1xyXG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XHJcbiAgICBhd2FpdCB0aGlzLnNhdmVEYXRhKHRoaXMuc2V0dGluZ3MpO1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiY2cucmFua3MiLCJjZy5maWxlcyIsInV0aWwua2V5MnBvcyIsInV0aWwuYWxsUG9zIiwidXRpbC5wb3Mya2V5IiwiZmVuUmVhZCIsInJlbmRlciIsInV0aWwuZGlzdGFuY2VTcSIsInV0aWwuYWxsS2V5cyIsInV0aWwuc2FtZVBpZWNlIiwic3RhcnQiLCJtb3ZlIiwiZW5kIiwiY2FuY2VsIiwidXRpbC5ldmVudFBvc2l0aW9uIiwiYm9hcmQuZ2V0S2V5QXREb21Qb3MiLCJib2FyZC53aGl0ZVBvdiIsImRyYXdDbGVhciIsImJvYXJkLmNhbk1vdmUiLCJib2FyZC5zZWxlY3RTcXVhcmUiLCJib2FyZC5pc0RyYWdnYWJsZSIsInV0aWwudHJhbnNsYXRlIiwidXRpbC5wb3NUb1RyYW5zbGF0ZSIsInV0aWwuc2V0VmlzaWJsZSIsImJvYXJkLnVuc2V0UHJlbW92ZSIsImJvYXJkLnVuc2V0UHJlZHJvcCIsInV0aWwuY29tcHV0ZVNxdWFyZUNlbnRlciIsImJvYXJkLmRyb3BOZXdQaWVjZSIsImJvYXJkLnVzZXJNb3ZlIiwiYm9hcmQuY2FsbFVzZXJGdW5jdGlvbiIsImJvYXJkLnVuc2VsZWN0IiwidG9nZ2xlT3JpZW50YXRpb24iLCJib2FyZC50b2dnbGVPcmllbnRhdGlvbiIsImZlbldyaXRlIiwiYm9hcmQuc2V0UGllY2VzIiwiYm9hcmQuYmFzZU1vdmUiLCJib2FyZC5iYXNlTmV3UGllY2UiLCJib2FyZC5wbGF5UHJlbW92ZSIsImJvYXJkLnBsYXlQcmVkcm9wIiwiYm9hcmQuY2FuY2VsTW92ZSIsImRyYWdDYW5jZWwiLCJib2FyZC5zdG9wIiwiZmVuLnJlYWQiLCJmZW4uaW5pdGlhbCIsInJlbmRlclNoYXBlIiwiY3JlYXRlU1ZHIiwiZHJhZy5tb3ZlIiwiZHJhdy5tb3ZlIiwiZHJhZy5lbmQiLCJkcmF3LmVuZCIsImRyYWcuY2FuY2VsIiwiZHJhdy5jYW5jZWwiLCJkcmF3LnN0YXJ0IiwiZHJhZy5zdGFydCIsInBvc1RvVHJhbnNsYXRlIiwicG9zVG9UcmFuc2xhdGVGcm9tQm91bmRzIiwicmVuZGVyUmVzaXplZCIsInV0aWwubWVtbyIsImF1dG9QaWVjZXMucmVuZGVyIiwic3ZnLnJlbmRlclN2ZyIsImF1dG9QaWVjZXMucmVuZGVyUmVzaXplZCIsImV2ZW50cy5iaW5kQm9hcmQiLCJldmVudHMuYmluZERvY3VtZW50IiwicGFyc2VZYW1sIiwic3RhcnRpbmdQb3NpdG9ucyIsIlNldHRpbmciLCJzZXRJY29uIiwiTm90aWNlIiwiTWFya2Rvd25SZW5kZXJDaGlsZCIsIkNoZXNzIiwiTWFya2Rvd25WaWV3Iiwic3RyaW5naWZ5WWFtbCIsIlBsdWdpblNldHRpbmdUYWIiLCJQbHVnaW4iXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBdURBO0FBQ08sU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0FBQzdELElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0FBQ2hILElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQy9ELFFBQVEsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUNuRyxRQUFRLFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUN0RyxRQUFRLFNBQVMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtBQUN0SCxRQUFRLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RSxLQUFLLENBQUMsQ0FBQztBQUNQOztBQzFEQSxJQUFJLE1BQU0sR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFO0FBQ3ZCLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEtBQUs7QUFDcEUsSUFBSSxJQUFJLElBQUksR0FBRTtBQUNkLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFFO0FBQ25CLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFDO0FBQzdCLEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxFQUFFLEVBQUU7QUFDMUIsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEdBQUU7QUFDbEQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRTtBQUMxQixNQUFNLEVBQUUsSUFBSSxJQUFHO0FBQ2YsS0FBSyxNQUFNO0FBQ1gsTUFBTSxFQUFFLElBQUksSUFBRztBQUNmLEtBQUs7QUFDTCxJQUFJLE9BQU8sRUFBRTtBQUNiLEdBQUcsRUFBRSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0xQLElBQUksS0FBSyxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQzNCLEVBQUUsSUFBSSxLQUFLLEdBQUcsSUFBRztBQUNqQixFQUFFLElBQUksS0FBSyxHQUFHLElBQUc7QUFDakI7QUFDQSxFQUFFLElBQUksS0FBSyxHQUFHLENBQUMsRUFBQztBQUNoQjtBQUNBLEVBQUUsSUFBSSxJQUFJLEdBQUcsSUFBRztBQUNoQixFQUFFLElBQUksTUFBTSxHQUFHLElBQUc7QUFDbEIsRUFBRSxJQUFJLE1BQU0sR0FBRyxJQUFHO0FBQ2xCLEVBQUUsSUFBSSxJQUFJLEdBQUcsSUFBRztBQUNoQixFQUFFLElBQUksS0FBSyxHQUFHLElBQUc7QUFDakIsRUFBRSxJQUFJLElBQUksR0FBRyxJQUFHO0FBQ2hCO0FBQ0EsRUFBRSxJQUFJLE9BQU8sR0FBRyxlQUFjO0FBQzlCO0FBQ0EsRUFBRSxJQUFJLGdCQUFnQjtBQUN0QixJQUFJLDJEQUEwRDtBQUM5RDtBQUNBLEVBQUUsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBQztBQUMxRDtBQUNBLEVBQUUsSUFBSSxZQUFZLEdBQUc7QUFDckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDdkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMzQixJQUFHO0FBQ0g7QUFDQSxFQUFFLElBQUksYUFBYSxHQUFHO0FBQ3RCLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQzNDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUN6QixJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDekMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDekMsSUFBRztBQUNIO0FBQ0E7QUFDQSxFQUFFLElBQUksT0FBTyxHQUFHO0FBQ2hCLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNyRCxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDckQsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JELEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNyRCxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDckQsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JELEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNyRCxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDckQsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JELEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNyRCxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDckQsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JELEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNyRCxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDckQsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDbEQsR0FBRyxDQUFDO0FBQ0o7QUFDQTtBQUNBLEVBQUUsSUFBSSxJQUFJLEdBQUc7QUFDYixLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDbEUsTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ2xFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNsRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDbEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ2xFLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNsRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDbEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDbEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ2xFLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNsRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDbEUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ2xFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNsRSxNQUFNLENB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RUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFO0FBQzFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRTtBQUMxRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUc7QUFDMUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHO0FBQzFFLEdBQUcsQ0FBQztBQUNKO0FBQ0EsRUFBRSxJQUFJLEtBQUssR0FBRztBQUNkLElBQUksQ0FBQyxFQUFFO0FBQ1AsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3JELE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRTtBQUNyRCxLQUFLO0FBQ0wsSUFBSSxDQUFDLEVBQUU7QUFDUCxNQUFN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TSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUMxRCxNQUFNLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNoRSxLQUFLO0FBQ0w7QUFDQTtBQUNBLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDekQsTUFBTSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDaEUsS0FBSztBQUNMO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDakQsTUFBTSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDaEUsS0FBSztBQUNMO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDdEQsTUFBTSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDaEUsS0FBSztBQUNMO0FBQ0E7QUFDQSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3BDLE1BQU0sT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUMs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USxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUM1QyxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTtBQUNuQyxVQUFVLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQztBQUN4RDtBQUNBO0FBQ0EsVUFBVSxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUM5QyxVQUFVLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFO0FBQ3BFLFlBQVksUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFDO0FBQzVELFdBQVc7QUFDWCxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFFBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDaEMsVUFBVSxJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUM5QyxVQUFVLElBQUksTUFBTSxHQUFHLElBQUksRUFBRSxRQUFRO0FBQ3JDO0FBQ0EsVUFBVSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDckUsWUFBWSxRQUFRLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUM7QUFDM0QsV0FBVyxNQUFNLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUMzQyxZ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Q0FBQyxFQUFFO0FBQ3RCLE1BQU0sS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM1RCxRQUFRO0FBQ1IsVUFBVSxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQzNDLFVBQVUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQzFDLFVBQVU7QUFDVixVQUFVLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSTtBQUMzQyxVQUFVLEtBQUs7QUFDZixTQUFTO0FBQ1QsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0EsSUFBSSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN4QixNQUFNLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDOUQsUUFBUTtBQUNSLFVBQVUsSUFBSSxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUMzQyxVQUFVLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUM5QyxVQUFVO0FBQ1YsVUFBVSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUk7QUFDL0MsVUFBVSxLQUFLO0FBQ2YsU0FBUztBQUNULE9BQU87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RSxLQUFLLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDM0UsTUFBTSxjQUFjLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbkssTUFBTSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxLQUFLO0FBQ3RDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUQsQ0FBQyxDQUFDO0FBQ0ssTUFBTSxpQkFBaUIsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxHQUFHLENBQUMsS0FBSztBQUN6RCxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUUsQ0FBQyxDQUFDO0FBQ0ssTUFBTSxVQUFVLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLO0FBQ3JDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxHQUFH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
