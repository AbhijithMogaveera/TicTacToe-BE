import { WebSocket } from "ws";
import { wsOutGoingMessageInterceptors } from "../services/socket";
import { connections } from "../services/socket/connection_handler/connection_handler";

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

async function send(
  to: string | (WebSocket | undefined),
  data: BufferLike
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
        reject();
        console.log("connection not found for ", to);
      }
    }
    if (to instanceof WebSocket) {
      if (to) {
        wsOutGoingMessageInterceptors.forEach((it) => {
          it(to, data, undefined);
        });
        to.send(data, (error) => {
          if (error) reject(error);
          else accept();
        });
      }
    }
  });
}
export function emitData(data: BufferLike) {
  return {
    to: (...to: (string | WebSocket | undefined)[]) => {
      return Promise.allSettled(to.map((it) => send(it, data)));
    },
  };
}
