import {
  wsConnectionStateChangeInterceptors,
  wsIncommingMessageInterceptors,
} from "../..";
import { emitData } from "../../../../util/WebSocket";
import { GameEvents } from "../events_handlers/event_names";
import { ONE_SECOND, generateKey } from "../events_handlers/util";
import { getConnectionByUserName } from "../../connection_handler/connection_handler";
import { AppJwtPayload } from "../../../../util/jwt";
import WebSocket from "ws";
import {
  ActiveGameSession,
  GameState,
  PlayerSessionMeta,
  TileState,
  activeGameSession,
  defalutTileState,
} from "./models";
import {
  ConnectionStateInterceptor,
  IncommingMessageInterceptor,
} from "../../types";
import { v4 } from "uuid";
import { checkForWinner } from "./util";

export class GameSessionSessionHandler {
  key: string;
  connectionStateInterceptor!: ConnectionStateInterceptor;
  incommingMessageInterceptor!: IncommingMessageInterceptor;
  p1TimeOut: NodeJS.Timeout | undefined = undefined;
  p2TimeOut: NodeJS.Timeout | undefined = undefined;

  constructor(readonly p1_user_uame: string, readonly p2_user_name: string) {
    this.key = generateKey(p1_user_uame, p2_user_name);
    const p1Meta = getConnectionByUserName(p1_user_uame)?.meta;
    const p2Meta = getConnectionByUserName(p2_user_name)?.meta;

    if (!p1Meta || !p2Meta) {
      throw "player not fond :)";
    }
    delete activeGameSession[this.key];
    if (!activeGameSession[this.key]) {
      activeGameSession[this.key] = {
        board: {
          board: defalutTileState,
          winTileStart: undefined,
          winTileMiddle: undefined,
          winTileEnd: undefined,
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
        gameWillEndIn: undefined,
        prematureGameTerminationBy: undefined,
      };
    } else throw "game already active";
    this.setUpMessageInterceptor(p1_user_uame, p2_user_name);
    this.setUpConnectionInterceptor(p1_user_uame, p2_user_name);
    this.updateGameState(activeGameSession[this.key]);
    this.notifyGameStateChanged();
  }
  getAllPlayer(): PlayerSessionMeta[] {
    return [this.getGameState().player_1, this.getGameState().player_2];
  }
  private setUpConnectionInterceptor(
    p1_user_uame: string,
    p2_user_name: string
  ) {
    this.connectionStateInterceptor = async (
      _ws: WebSocket,
      payload: AppJwtPayload,
      isConnected: boolean
    ) => {
      const endsIn = ONE_SECOND * 20;
      let gameState = this.getGameState();
      if (payload.user_name == p1_user_uame) {
        if (isConnected) {
          clearTimeout(this.p1TimeOut);
          this.updateGameState({
            ...gameState,
            player_1: {
              ...gameState.player_1,
              isActive: true,
            },
            gameState: GameState.OnGoing,
            gameWillEndIn: undefined,
          });
        } else {
          this.updateGameState({
            ...gameState,
            player_1: {
              ...gameState.player_1,
              isActive: false,
            },
            gameState: GameState.PlayerLostAboutToEndInOneMinute,
            gameWillEndIn: endsIn,
          });
          this.p1TimeOut = setTimeout(() => {
            this.stopGame();
          }, endsIn);
        }
      }
      if (payload.user_name == p2_user_name) {
        if (isConnected) {
          clearTimeout(this.p2TimeOut);
          this.updateGameState({
            ...gameState,
            player_2: {
              ...gameState.player_2,
              isActive: true,
            },
            gameState: GameState.OnGoing,
            gameWillEndIn: undefined,
          });
        } else {
          this.updateGameState({
            ...gameState,
            player_2: {
              ...gameState.player_2,
              isActive: false,
            },
            gameState: GameState.PlayerLostAboutToEndInOneMinute,
            gameWillEndIn: endsIn,
          });
          this.p2TimeOut = setTimeout(() => {
            this.stopGame();
          }, endsIn);
        }
      }
      await this.notifyGameStateChanged();
    };
    wsConnectionStateChangeInterceptors.push(this.connectionStateInterceptor);
  }

  private setUpMessageInterceptor(p1_user_uame: string, p2_user_name: string) {
    this.incommingMessageInterceptor = async (
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
          if (event == GameEvents.GAME) {
            this.notifyGameStateChanged().then();
          }
          if (event == GameEvents.GAME_TAP_TILE) {
            this.onTileTap(payload.user_name, data.data);
          }
          if (event == GameEvents.GAME_STOP) {
            this.stopGame(payload.user_name);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    wsIncommingMessageInterceptors.push(this.incommingMessageInterceptor);
  }

  async notifyStopGameTimerIsRunning() {
    let p1_user_name = activeGameSession[this.key].player_1.user_name;
    let p2_user_name = activeGameSession[this.key].player_2.user_name;
    if (
      !getConnectionByUserName(p1_user_name) &&
      !getConnectionByUserName(p2_user_name)
    ) {
      await this.stopGame();
      return;
    }
    this.updateGameState({
      ...activeGameSession[this.key],
      gameState: GameState.PlayerLostAboutToEndInOneMinute,
    });
    await this.notifyGameStateChanged();
  }

  getGameState = () => activeGameSession[this.key];

  updateGameState(data: ActiveGameSession) {
    activeGameSession[this.key] = data;
    return activeGameSession[this.key];
  }

  async notifyGameStateChanged() {
    const messagePayload = JSON.stringify({
      ...this.getGameState(),
      event: GameEvents.GAME,
    });
    await emitData(messagePayload).to(this.p1_user_uame, this.p2_user_name);
  }
  getPlayerDetails(playerName: string) {
    if (playerName == this.getGameState().player_1.user_name) {
      return this.getGameState().player_1;
    }
    if (playerName == this.getGameState().player_2.user_name) {
      return this.getGameState().player_2;
    }
  }
  async onTileTap(player: string, postion: number) {
    let gameState = this.getGameState();
    if (gameState.current_turn == player) {
      let postionState = this.getGameState().board.board[postion];
      if (postionState == TileState.NONE) {
        gameState = this.updateGameState({
          ...gameState,
          board: {
            ...gameState.board,
            board: gameState.board.board.map((value, index) => {
              if (postion == index) {
                let tile = this.getPlayerDetails(player)?.tile;
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
        let result = checkForWinner(activeGameSession[this.key]);
        if (result) {
          const endsAt = ONE_SECOND * 5;
          gameState = this.updateGameState({
            ...result,
            gameWillEndIn: endsAt,
          });
          await this.notifyGameStateChanged();
          setTimeout(() => this.stopGame(), endsAt + ONE_SECOND);
          return;
        }
        this.updateGameState({
          ...gameState,
          current_turn:
            gameState.current_turn == gameState.player_1.user_name
              ? this.getGameState().player_2.user_name
              : gameState.player_1.user_name,
        });
        await this.notifyGameStateChanged();
      }
    }
  }
  async stopGame(prematureGameTerminationBy: string | undefined = undefined) {
    if (activeGameSession[this.key]) {
      let connectionStateInterceptorIndex =
        wsConnectionStateChangeInterceptors.indexOf(
          this.connectionStateInterceptor
        );
      let incommingMessageInterceptorIndex =
        wsIncommingMessageInterceptors.indexOf(
          this.incommingMessageInterceptor
        );
      wsConnectionStateChangeInterceptors.splice(
        connectionStateInterceptorIndex,
        1
      );
      wsIncommingMessageInterceptors.splice(
        incommingMessageInterceptorIndex,
        1
      );
      this.updateGameState({
        ...activeGameSession[this.key],
        gameState: GameState.End,
        prematureGameTerminationBy:prematureGameTerminationBy
      });
      clearTimeout(this.p1TimeOut);
      clearTimeout(this.p2TimeOut);
      await this.notifyGameStateChanged();
      delete activeGameSession[this.key];
    }
  }
}
