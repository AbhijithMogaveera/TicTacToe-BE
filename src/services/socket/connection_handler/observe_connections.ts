import { SocketKeys } from "../../../models/socket/SocketKeys";
import { UserMeta } from "../../../models/socket/UserMeta";
import {
  wsConnectionStateChangeInterceptors,
  wsMessageInterceptors,
} from "../SocketServer";
import { connections } from "./connection_handler";

let activeConnetcionsObserver: string[] = [];

function broadCastUpdatedConnectionsList() {
  let activeusersMeta: UserMeta[] = [];
  for (const user_name in connections) {
    const connection = connections[user_name];
    if (connection) {
      activeusersMeta.push(connection.meta);
    } else {
      console.log("connection not for " + user_name);
    }
  }
  activeConnetcionsObserver.forEach((user_name) => {
    try {
      const connection = connections[user_name];
      if (connection) {
        connection.ws.send(
          JSON.stringify({
            event: SocketKeys.activePlayer,
            data: activeusersMeta,
          })
        );
      } else {
        console.log("connection not found for " + user_name);
      }
    } catch (error) {
      console.log(error);
    }
  });
  console.log("Update broadcast to ", activeConnetcionsObserver);
}

function broadCastUpdatedConnectionsListTo(user_name: string) {
  const connection = connections[user_name];
  if (!connection) {
    console.log("connection not found for " + user_name);
    return;
  }
  let arr: UserMeta[] = [];
  for (const user_name in connections) {
    const connection = connections[user_name];
    if (connection) {
      arr.push(connection.meta);
    }
  }
  connection.ws.send(
    JSON.stringify({
      event: SocketKeys.activePlayer,
      data: arr,
    })
  );
}

function observeConnecitonList(user_name: string) {
  activeConnetcionsObserver.push(user_name);
  broadCastUpdatedConnectionsListTo(user_name);
}

function stopObserverConnectinList(user_name: string) {
  let index = activeConnetcionsObserver.indexOf(user_name);
  activeConnetcionsObserver.splice(index, 1);
}

wsMessageInterceptors.push((ws, payload, message) => {
  let incomingMessage: SocketMessagePlayLoad = JSON.parse(message.toString());
  if (incomingMessage.event === SocketKeys.activePlayer) {
    console.log(`${payload.user_name} started observing players`);
    observeConnecitonList(payload.user_name);
  }
});

wsConnectionStateChangeInterceptors.push((ws, payload, isConnected) => {
  if (!isConnected) {
    broadCastUpdatedConnectionsList();
  } else {
    stopObserverConnectinList(payload.user_name);
    broadCastUpdatedConnectionsList();
  }
});
