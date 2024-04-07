import { WebSocket } from "ws";
import { wsOutGoingMessageInterceptors } from "..";
import { connections } from "../connection_handler/connection_handler";

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

export async function send(
  to: string | (WebSocket | undefined),
  data: BufferLike,
  cb?: (err?: Error) => void
): Promise<void> {
  return new Promise((accept, reject) => {
    if (typeof to === "string") {
      const ws = connections[to]?.ws;
      if (ws) {
        wsOutGoingMessageInterceptors.forEach((it) => {
          it(ws, data, to);
        });
        ws?.send(data, (error) => {
          if (error) reject(error);
          else accept();
        });
      } else {
        console.log("connection not found for ", to);
      }
    }
    if (to instanceof WebSocket) {
      if (to) {
        wsOutGoingMessageInterceptors.forEach((it) => {
          it(to, data, undefined);
        });
        to?.send(data, (error) => {
          if (error) reject(error);
          else accept();
        });
      }
    }
  });
}
