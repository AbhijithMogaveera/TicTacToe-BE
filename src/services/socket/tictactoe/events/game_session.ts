import {
  wsConnectionStateChangeInterceptors,
  wsIncommingMessageInterceptors,
} from "../..";
import { send } from "../../wrapper/WebSocket";
import { GameEvents } from "./event_names";
import { ONE_MINUTE, ONE_SECOND, generateKey } from "./util";
import { v4 } from "uuid";
import { UserMeta } from "../../../../models/socket/UserMeta";
import { getConnectionByUserName } from "../../connection_handler/connection_handler";
import { AppJwtPayload } from "../../../../util/jwt";
import WebSocket from "ws";

import {
  ConnectionStateInterceptor,
  IncommingMessageInterceptor,
} from "../../types";
import { date, number } from "joi";
import { delay } from "../../../../util/timeout";
import { join } from "path";

enum TileState {
  X = "X",
  O = "O",
  NONE = "NONE",
}

const defalutTileState = [
  TileState.NONE,
  TileState.NONE,
  TileState.NONE,
  TileState.NONE,
  TileState.NONE,
  TileState.NONE,
  TileState.NONE,
  TileState.NONE,
  TileState.NONE,
];

enum GameState {
  NotStarted = "NotStarted",
  OnGoing = "OnGoing",
  PlayerLostAboutToEndInOneMinute = "PlayerLostAboutToEndInOneMinute",
  End = "End",
}

interface BoardState {
  board: TileState[];
  winTileDiagonalStart: number | undefined;
  winTileDiagonalMiddle: number | undefined;
  winTileDiagonalEnd: number | undefined;
  winPlayerUsername: string | undefined;
  activePlayerUserName: string | undefined;
  activePlayerTile: string | undefined;
  invitation_id: string;
}

interface PlayerSessionMeta extends PlayerMeta {
  tile: TileState;
}

interface ActiveGameSession {
  board: BoardState;
  player_1: PlayerSessionMeta;
  player_2: PlayerSessionMeta;
  current_turn: string;
  startedAt: number;
  gameState: GameState;
}

interface PlayerMeta extends UserMeta {
  isActive: boolean;
}

let activeGameSession: {
  [key: string]: ActiveGameSession;
} = {};

wsIncommingMessageInterceptors.push(async (ws, payload, message) => {
  try {
    let event = JSON.parse(message.toString());
    if (event == GameEvents.GAME_REMATCH) {
    }
  } catch (e) {
    console.log(e);
  }
});

export async function startGame(p1_user_uame: string, p2_user_name: string) {
  let key = generateKey(p1_user_uame, p2_user_name);

  const p1Meta = getConnectionByUserName(p1_user_uame)?.meta;
  const p2Meta = getConnectionByUserName(p2_user_name)?.meta;

  if (!p1Meta || !p2Meta) {
    return;
  }

  function updateGameState(data: ActiveGameSession) {
    activeGameSession[key] = data;
    return activeGameSession[key];
  }

  async function notifyGameStateChanged() {
    const messagePayload = JSON.stringify({
      ...getGameState(),
      event: GameEvents.GAME,
    });
    await send(p1_user_uame, messagePayload);
    await send(p2_user_name, messagePayload);
  }

  if (!activeGameSession[key]) {
    activeGameSession[key] = {
      board: {
        board: defalutTileState,
        winTileDiagonalStart: undefined,
        winTileDiagonalMiddle: undefined,
        winTileDiagonalEnd: undefined,
        winPlayerUsername: undefined,
        activePlayerTile: undefined,
        invitation_id: v4().toString(),
        activePlayerUserName: undefined,
      },
      player_1: { ...p1Meta, isActive: true, tile: TileState.O },
      player_2: { ...p2Meta, isActive: true, tile: TileState.X },
      current_turn: p1Meta.user_name,
      startedAt: new Date().getMilliseconds(),
      gameState: GameState.NotStarted,
    };
  } else throw "game already active";

  let getGameState = () => activeGameSession[key];

  let connectionStateInterceptor: ConnectionStateInterceptor;
  let incommingMessageInterceptor: IncommingMessageInterceptor = async (
    ws: WebSocket,
    payload: AppJwtPayload,
    message: WebSocket.RawData
  ) => {
    try {
      if (
        payload.user_name == p1_user_uame ||
        payload.user_name == p2_user_name
      ) {
        let data: { event: string; data: number } = JSON.parse(
          message.toString()
        );
        let event = data.event;
        if (event == GameEvents.GAME_TAP_TILE) {
          onTileTap(payload.user_name, data.data);
        }
        if (event == GameEvents.GAME_STOP) {
          stopGame();
        }
      }
    } catch (error) {}
  };

  let p1TimeOut: NodeJS.Timeout;
  let p2TimeOut: NodeJS.Timeout;

  async function stopGame() {
    if (activeGameSession[key]) {
      let connectionStateInterceptorIndex =
        wsConnectionStateChangeInterceptors.indexOf(connectionStateInterceptor);
      let incommingMessageInterceptorIndex =
        wsIncommingMessageInterceptors.indexOf(incommingMessageInterceptor);
      wsConnectionStateChangeInterceptors.splice(
        connectionStateInterceptorIndex,
        1
      );
      wsIncommingMessageInterceptors.splice(
        incommingMessageInterceptorIndex,
        1
      );
      updateGameState({
        ...activeGameSession[key],
        gameState: GameState.End,
      });
      await notifyGameStateChanged();
      delete activeGameSession[key];
    }
  }

  function getPlayerDetails(playerName: string) {
    if (playerName == getGameState().player_1.user_name) {
      return getGameState().player_1;
    }
    if (playerName == getGameState().player_2.user_name) {
      return getGameState().player_2;
    }
  }

  async function onTileTap(player: string, postion: number) {
    let gameState = getGameState();
    if (gameState.current_turn == player) {
      let postionState = getGameState().board.board[postion];
      if (postionState == TileState.NONE) {
        gameState = updateGameState({
          ...gameState,
          board: {
            ...gameState.board,
            board: gameState.board.board.map((value, index) => {
              if (postion == index) {
                let tile = getPlayerDetails(player)?.tile;
                if (!tile) {
                  throw "player not found";
                }
                return tile;
              } else {
                return value;
              }
            }),
          },
        });
        let result = checkForWinner(activeGameSession[key]);
        if (result) {
          gameState = updateGameState(result);
          await notifyGameStateChanged();
          await delay(ONE_SECOND * 10);
          await stopGame();
          return
        }
        updateGameState({
          ...gameState,
          current_turn:
            gameState.current_turn == gameState.player_1.user_name
              ? getGameState().player_2.user_name
              : gameState.player_1.user_name,
        });
        await notifyGameStateChanged();
      }else{
        console.log("alred filled")
      }
    }else{
      console.log("Tap is from non player turn")
    }
  }

  async function notifyStopGameTimerIsRunning() {
    let p1_user_name = activeGameSession[key].player_1.user_name;
    let p2_user_name = activeGameSession[key].player_2.user_name;
    if (
      !getConnectionByUserName(p1_user_name) &&
      !getConnectionByUserName(p2_user_name)
    ) {
      await stopGame();
      return;
    }
    updateGameState({
      ...activeGameSession[key],
      gameState: GameState.PlayerLostAboutToEndInOneMinute,
    });
    await notifyGameStateChanged();
  }

  connectionStateInterceptor = async (
    _ws: WebSocket,
    payload: AppJwtPayload,
    isConnected: boolean
  ) => {
    if (payload.user_name == p1_user_uame) {
      if (isConnected) {
        clearTimeout(p1TimeOut);
      } else {
        await notifyStopGameTimerIsRunning();
        p1TimeOut = setTimeout(() => {
          stopGame();
        }, ONE_MINUTE);
      }
    }
    if (payload.user_name == p2_user_name) {
      if (isConnected) {
        clearTimeout(p2TimeOut);
      } else {
        await notifyStopGameTimerIsRunning();
        p2TimeOut = setTimeout(() => {
          stopGame();
        }, ONE_MINUTE);
      }
    }
  };

  wsConnectionStateChangeInterceptors.push(connectionStateInterceptor);
  wsIncommingMessageInterceptors.push(incommingMessageInterceptor);
  updateGameState(activeGameSession[key]);
  await notifyGameStateChanged();
}

function checkForWinner(
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
          winTileDiagonalStart: i * 3,
          winTileDiagonalMiddle: i * 3 + 1,
          winTileDiagonalEnd: i * 3 + 2,
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
          winTileDiagonalStart: i,
          winTileDiagonalMiddle: i + 3,
          winTileDiagonalEnd: i + 6,
          winPlayerUsername:
            data.current_turn === data.player_1.user_name
              ? data.player_2.user_name
              : data.player_1.user_name,
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
        winTileDiagonalStart: 0,
        winTileDiagonalMiddle: 4,
        winTileDiagonalEnd: 8,
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
        winTileDiagonalStart: 2,
        winTileDiagonalMiddle: 4,
        winTileDiagonalEnd: 6,
        winPlayerUsername:
          data.current_turn === data.player_1.user_name
            ? data.player_2.user_name
            : data.player_1.user_name,
      },
    };
  }

  // Check for draw
  if (!board.includes(TileState.NONE)) {
    return {
      ...data,
      board: {
        ...data.board,
        winTileDiagonalStart: undefined,
        winTileDiagonalMiddle: undefined,
        winTileDiagonalEnd: undefined,
        winPlayerUsername: undefined,
      },
    };
  }

  // If no winner and no draw, return undefined
  return undefined;
}
