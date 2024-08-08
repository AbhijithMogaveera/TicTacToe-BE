import { GameSessionSessionHandler } from "./GameSession";
import { ActiveGameSession, TileState } from "./models";

export async function startGame(p1_user_uame: string, p2_user_name: string) {
  try {
    new GameSessionSessionHandler(p1_user_uame, p2_user_name);
  } catch (error) {
    console.log(error);
  }
}

export function checkForWinner(
  data: ActiveGameSession
): ActiveGameSession | undefined {
  const board = data.board.board;

  // Check for winner
  for (let i = 0; i < 3; i++) {
    // Check rows
    if (
      board[i * 3] !== TileState.NONE &&
      board[i * 3] === board[i * 3 + 1] &&
      board[i * 3] === board[i * 3 + 2]
    ) {
      return {
        ...data,
        board: {
          ...data.board,
          winTileStart: i * 3,
          winTileMiddle: i * 3 + 1,
          winTileEnd: i * 3 + 2,
          winPlayerUsername:
            data.current_turn === data.player_1.user_name
              ? data.player_2.user_name
              : data.player_1.user_name,
        },
      };
    }

    // Check columns
    if (
      board[i] !== TileState.NONE &&
      board[i] === board[i + 3] &&
      board[i] === board[i + 6]
    ) {
      return {
        ...data,
        board: {
          ...data.board,
          winTileStart: i,
          winTileMiddle: i + 3,
          winTileEnd: i + 6,
          winPlayerUsername:
            data.current_turn === data.player_1.user_name
              ? data.player_1.user_name
              : data.player_2.user_name,
        },
      };
    }
  }

  // Check diagonals
  if (
    board[0] !== TileState.NONE &&
    board[0] === board[4] &&
    board[0] === board[8]
  ) {
    return {
      ...data,
      board: {
        ...data.board,
        winTileStart: 0,
        winTileMiddle: 4,
        winTileEnd: 8,
        winPlayerUsername:
          data.current_turn === data.player_1.user_name
            ? data.player_2.user_name
            : data.player_1.user_name,
      },
    };
  }

  if (
    board[2] !== TileState.NONE &&
    board[2] === board[4] &&
    board[2] === board[6]
  ) {
    return {
      ...data,
      board: {
        ...data.board,
        winTileStart: 2,
        winTileMiddle: 4,
        winTileEnd: 6,
        winPlayerUsername:
          data.current_turn === data.player_1.user_name
            ? data.player_1.user_name
            : data.player_2.user_name,
      },
    };
  }

  // Check for draw
  if (!board.includes(TileState.NONE)) {
    return {
      ...data,
      board: {
        ...data.board,
        winTileStart: undefined,
        winTileMiddle: undefined,
        winTileEnd: undefined,
        winPlayerUsername: undefined,
      },
    };
  }

  // If no winner and no draw, return undefined
  return undefined;
}
