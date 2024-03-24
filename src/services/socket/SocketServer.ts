import http from "http";
import WebSocket from "ws";
import { AuthIssueKeys } from "../../config/ClientIssue";
import { ClientError } from "../../error/error";
import { AppJwtPayload, TokenManager } from "../../util/jwt";
import { JsonWebTokenError } from "jsonwebtoken";
import { Request } from "express";

export let wsMessageInterceptors: ((
  ws: WebSocket,
  payload: AppJwtPayload,
  message: WebSocket.RawData
) => void)[] = [];

export let wsConnectionStateChangeInterceptors: ((
  ws: WebSocket,
  payload: AppJwtPayload,
  isConnected: boolean
) => void)[] = [];

import "./tictactoe/index";
import "./connection_handler/index";

export async function startSocket(
  app: Express.Application,
  onStart: (port: number) => void
) {
  const server = http.createServer(app);

  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req: Request) => {
    console.log("Connection request recived");

    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      let issue = new ClientError(
        AuthIssueKeys.MissingToken,
        "Please provide token"
      ).toString();
      ws.send(issue);
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
        ws.send(issue);
        setTimeout(() => {
          ws.close();
        }, 3000);
        return;
      }
      throw e;
    }

    wsConnectionStateChangeInterceptors.forEach((it) => it(ws, payLoad, true));

    ws.on("message", (message) => {
      try {
        wsMessageInterceptors.forEach((it) => it(ws, payLoad, message));
      } catch (e) {
        console.log(e);
        ws.send("Recived invalid josn format message");
      }
    });

    ws.on("close", () => {
      wsConnectionStateChangeInterceptors.forEach((it) =>
        it(ws, payLoad, true)
      );
    });
  });

  server.listen(5036, () => {
    onStart(5036);
  });
}
