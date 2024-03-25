import { WebSocket } from "ws";
import { wsOutGoingMessageInterceptors } from "..";
import { connections } from "../connection_handler/connection_handler";
import { string } from "joi";

export type BufferLike =
  | string
  | Buffer
  | DataView
  | number
  | ArrayBufferView
  | Uint8Array
  | ArrayBuffer
  | SharedArrayBuffer
  | readonly any[]
  | readonly number[]
  | { valueOf(): ArrayBuffer }
  | { valueOf(): SharedArrayBuffer }
  | { valueOf(): Uint8Array }
  | { valueOf(): readonly number[] }
  | { valueOf(): string }
  | { [Symbol.toPrimitive](hint: string): string };

export function send(
  to: string | (WebSocket | undefined),
  data: BufferLike,
  cb?: (err?: Error) => void
): void {
  if (typeof to === "string") {
    const ws = connections[to]?.ws;
    if (ws) {
      ws?.send(data);
      wsOutGoingMessageInterceptors.forEach((it) => {
        it(ws, data, to);
      });
    }
  }
  if (to instanceof WebSocket) {
    if (to) {
      to?.send(data);
      wsOutGoingMessageInterceptors.forEach((it) => {
        it(to, data, undefined);
      });
    }
  }
}
