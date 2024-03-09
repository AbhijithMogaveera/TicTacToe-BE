import http from "http";
import WebSocket from "ws";
import { AuthIssueKeys } from "../../config/ClientIssue";
import { ClientError } from "../../error/error";
import { AppJwtPayload, TokenManager } from "../../util/jwt";
import { JsonWebTokenError } from "jsonwebtoken";
import { connectionHandler } from "./ConnectionHandler";
import { SocketKeys } from "../../models/socket/SocketKeys";

export async function startSocket(
  app: Express.Application,
  onStart: (port: number) => void
) {
  const server = http.createServer(app);

  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      let issue = new ClientError(
        AuthIssueKeys.MissingToken,
        "Please provide token"
      ).toString();
      ws.send(issue);
      ws.close();
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
        ws.close();
        return;
      }
      throw e;
    }

    connectionHandler.addConnection({
     ws, user_name:payLoad.user_name
    })

    ws.on("message", (message) => {
      try {
        console.log(`${payLoad.user_name} started observing other player status`)
        let incomingMessage:SocketMessagePlayLoad = JSON.parse(message.toString());
        console.log(incomingMessage)
        if(incomingMessage.event === SocketKeys.activePlayer){
          console.log(`${payLoad.user_name} started observing players`)
          connectionHandler.observeConnecitonList(payLoad.user_name)
        }
        console.log(incomingMessage);
      
      } catch (e) {
      
        console.log(e);
        ws.send("Recived invalid josn format message");
      
      }
    });

    ws.on("close", () => {
      console.log("connection closed",payLoad.user_name)
      connectionHandler.removeConnection(payLoad.user_name)
    });
  });

  server.listen(5036, () => {
    onStart(5036);
  });
}
