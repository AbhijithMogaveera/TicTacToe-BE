import { SocketKeys } from "../../../models/socket/SocketKeys";
import { UserMeta } from "../../../models/socket/UserMeta";
import {
  wsConnectionStateChangeInterceptors,
  wsIncommingMessageInterceptors,
} from "..";
import { connections } from "./connection_handler";
import { emitData } from "../../../util/WebSocket";

let activeConnetcionsObserver: string[] = [];

function broadCastUpdatedConnectionsList() {
  let activeusersMeta: UserMeta[] = [];
  for (const user_name in connections) {
    const connection = connections[user_name];
    if (connection) {
      activeusersMeta.push(connection.meta);
    }
  }
  activeConnetcionsObserver.forEach((user_name) => {
    try {
      const connection = connections[user_name];
      if (connection) {
        emitData(
          JSON.stringify({
            event: SocketKeys.activePlayer,
            data: activeusersMeta,
          })
        ).to(user_name);
      }
    } catch (error) {
      console.log(error);
    }
  });
}

function broadCastUpdatedConnectionsListTo(user_name: string) {
  const connection = connections[user_name];
  if (!connection) {
    return;
  }
  let arr: UserMeta[] = [];
  for (const user_name in connections) {
    const connection = connections[user_name];
    if (connection) {
      arr.push(connection.meta);
    }
  }
  emitData(
    JSON.stringify({
      event: SocketKeys.activePlayer,
      data: arr,
    })
  ).to(user_name);
}

function observeConnecitonList(user_name: string) {
  activeConnetcionsObserver.push(user_name);
  broadCastUpdatedConnectionsListTo(user_name);
}

function stopObserverConnectinList(user_name: string) {
  let index = activeConnetcionsObserver.indexOf(user_name);
  activeConnetcionsObserver.splice(index, 1);
}

wsIncommingMessageInterceptors.push(async (ws, payload, message) => {
  let incomingMessage: SocketMessagePlayLoad = JSON.parse(message.toString());
  if (incomingMessage.event === SocketKeys.activePlayer) {
    observeConnecitonList(payload.user_name);
  }
});

wsConnectionStateChangeInterceptors.push(async (ws, payload, isConnected) => {
  if (!isConnected) {
    stopObserverConnectinList(payload.user_name);
  }
  broadCastUpdatedConnectionsList();
});
