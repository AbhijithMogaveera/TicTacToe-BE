import http from "http";
import WebSocket from "ws";
import { AuthIssueKeys } from "../../config/ClientIssue";
import { ClientError } from "../../error/error";
import { AppJwtPayload, TokenManager } from "../../util/jwt";
import { JsonWebTokenError } from "jsonwebtoken";
import { Request } from "express";

export let wsIncommingMessageInterceptors: IncommingMessageInterceptor[] = [];
export let wsOutGoingMessageInterceptors: OutGoingMessageInterceptor[] = [];
export let wsConnectionStateChangeInterceptors: ConnectionStateInterceptor[] =
  [];

import { emitData } from "./wrapper/WebSocket";
import {
  ConnectionStateInterceptor,
  IncommingMessageInterceptor,
  OutGoingMessageInterceptor,
} from "./types";
import { ONE_SECOND } from "./tictactoe/events_handlers/util";

//scripts
import "./logger/index";
import "./connection_handler/index";
import "./tictactoe/index";

export async function startSocket(
  app: Express.Application,
  onStart: (port: number) => void
) {
  const server = http.createServer(app);

  const wss = new WebSocket.Server({ server });

  wss.on("connection", async (ws, req: Request) => {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      let issue = new ClientError(
        AuthIssueKeys.MissingToken,
        "Please provide token"
      ).toString();
      emitData(issue).to(ws);
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
        emitData(issue).to(ws);
        setTimeout(() => {
          ws.close();
        }, ONE_SECOND * 3);
        return;
      }
      throw e;
    }

    for (let i = 0; i < wsConnectionStateChangeInterceptors.length; i++) {
      await wsConnectionStateChangeInterceptors[i](ws, payLoad, true);
    }

    ws.on("message", async(message) => {
      try {
        for (let i = 0; i < wsIncommingMessageInterceptors.length; i++) {
          await wsIncommingMessageInterceptors[i](ws, payLoad, message);
        }
      } catch (e) {
        console.log(e);
        emitData(
          "Recived invalid josn format message"
        ).to(ws, );
      }
    });

    ws.on("close", async () => {
      for (let i = 0; i < wsConnectionStateChangeInterceptors.length; i++) {
        await wsConnectionStateChangeInterceptors[i](ws, payLoad, false);
      }
    });
  });

  server.listen(5036, () => {
    onStart(5036);
  });
}
