import http from "http";
import WebSocket from "ws";
import { AuthIssueKeys } from "../../config/ClientIssue";
import { ClientError } from "../../error/error";
import { AppJwtPayload, TokenManager } from "../../util/jwt";
import { JsonWebTokenError } from "jsonwebtoken";
import { connectionHandler } from "./ConnectionHandler";
import { SocketKeys } from "../../models/socket/SocketKeys";
import { Request } from "express";

export let wsEventsInterceptors: ((
  ws: WebSocket,
  payload: AppJwtPayload,
  message: WebSocket.RawData
) => void)[] = [];

import "../tictactoe/events/index";

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

    connectionHandler.addConnection({
      ws,
      user_name: payLoad.user_name,
    });

    ws.on("message", (message) => {
      try {
        let incomingMessage: SocketMessagePlayLoad = JSON.parse(
          message.toString()
        );
        if (incomingMessage.event === SocketKeys.activePlayer) {
          console.log(`${payLoad.user_name} started observing players`);
          connectionHandler.observeConnecitonList(payLoad.user_name);
        }
        wsEventsInterceptors.forEach((it) => it(ws, payLoad, message));
        console.log(incomingMessage);
      } catch (e) {
        console.log(e);
        ws.send("Recived invalid josn format message");
      }
    });

    ws.on("close", () => {
      connectionHandler.removeConnection(payLoad.user_name);
    });
  });

  server.listen(5036, () => {
    onStart(5036);
  });
}
