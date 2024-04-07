import WebSocket from "ws";
import { AppJwtPayload } from "../../util/jwt";
import { BufferLike } from "./wrapper/WebSocket";

export type IncommingMessageInterceptor = (
  ws: WebSocket,
  payload: AppJwtPayload,
  message: WebSocket.RawData
) => Promise<void>;

export type OutGoingMessageInterceptor = (
    ws: WebSocket,
    message: BufferLike,
    user_name: string | undefined
) => Promise<void>;

export type ConnectionStateInterceptor = (
    ws: WebSocket,
    payload: AppJwtPayload,
    isConnected: boolean
) => Promise<void>;
