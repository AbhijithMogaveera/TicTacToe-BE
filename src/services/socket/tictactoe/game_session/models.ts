import { UserMeta } from "../../../../models/socket/UserMeta";

export enum TileState {
  X = "X",
  O = "O",
  NONE = "NONE",
}

export const defalutTileState = [
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

export enum GameState {
  NotStarted = "NotStarted",
  OnGoing = "OnGoing",
  PlayerLostAboutToEndInOneMinute = "PlayerLostAboutToEndInOneMinute",
  End = "End",
}

export interface BoardState {
  board: TileState[];
  winTileStart: number | undefined;
  winTileMiddle: number | undefined;
  winTileEnd: number | undefined;
  winPlayerUsername: string | undefined;
  activePlayerUserName: string | undefined;
  activePlayerTile: string | undefined;
  invitation_id: string;
}

export interface PlayerSessionMeta extends PlayerMeta {
  tile: TileState;
}

export interface ActiveGameSession {
  board: BoardState;
  player_1: PlayerSessionMeta;
  player_2: PlayerSessionMeta;
  current_turn: string;
  startedAt: number;
  gameState: GameState;
  gameWillEndIn: number | undefined;
  prematureGameTerminationBy: string | undefined;
}

export interface PlayerMeta extends UserMeta {
  isActive: boolean;
}

export let activeGameSession: {
  [key: string]: ActiveGameSession;
} = {};
