import http from "http";
import WebSocket from "ws";
import { AuthIssueKeys } from "../../config/ClientIssue";
import { ClientError } from "../../error/error";
import { AppJwtPayload, TokenManager } from "../../util/jwt";
import { JsonWebTokenError } from "jsonwebtoken";
import { Request } from "express";

export let wsIncommingMessageInterceptors: ((
  ws: WebSocket,
  payload: AppJwtPayload,
  message: WebSocket.RawData
) => void)[] = [];

export let wsOutGoingMessageInterceptors:((
  ws:WebSocket,
  message:BufferLike,
  user_name:string | undefined
)=>void)[] = []

export let wsConnectionStateChangeInterceptors: ((
  ws: WebSocket,
  payload: AppJwtPayload,
  isConnected: boolean
) => Promise<void>)[] = [];
import "./logger/index";
import "./tictactoe/index";
import "./connection_handler/index";
import { BufferLike, send } from "./wrapper/WebSocket";

export async function startSocket(
  app: Express.Application,
  onStart: (port: number) => void
) {
  console.log("hee here herere")
  const server = http.createServer(app);

  const wss = new WebSocket.Server({ server });

  wss.on("connection", async (ws, req: Request) => {
    console.log("connection created")
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      let issue = new ClientError(
        AuthIssueKeys.MissingToken,
        "Please provide token"
      ).toString();
      send(ws, issue);
      setTimeout(() => {
        ws.close();
      }, 3000);
      return;
    }

    let payLoad: AppJwtPayload;

    try {
      payLoad = TokenManager.verifyToken(token);
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        let issue = new ClientError(
          e.message + token,
          AuthIssueKeys.InvalidToken
        ).toString();
        send(ws, issue);
        setTimeout(() => {
          ws.close();
        }, 3000);
        return;
      }
      throw e;
    }

    for(let i = 0; i<wsConnectionStateChangeInterceptors.length; i++){
      await wsConnectionStateChangeInterceptors[i](ws, payLoad, true)
    }

    ws.on("message", (message) => {
      try {
        wsIncommingMessageInterceptors.forEach((it) =>
          it(ws, payLoad, message)
        );
      } catch (e) {
        console.log(e);
        send(ws, "Recived invalid josn format message");
      }
    });

    ws.on("close", async () => {
      for(let i = 0; i<wsConnectionStateChangeInterceptors.length; i++){
        await wsConnectionStateChangeInterceptors[i](ws, payLoad, false)
      }
    });
  });

  server.listen(5036, () => {
    onStart(5036);
  });
}
