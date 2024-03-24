import {
  wsConnectionStateChangeInterceptors,
  wsMessageInterceptors,
} from "../SocketServer";

import { SocketKeys } from "../../../models/socket/SocketKeys";
import { UserMeta } from "../../../models/socket/UserMeta";
import { findUserByUsername } from "../../rest/profile";
import { WebSocket } from "ws";

let connections: {
  [user_name: string]:
    | {
        ws: WebSocket;
        meta: UserMeta;
      }
    | undefined;
} = {};

let activeConnetcionsObserver: string[] = [];

async function addConnection({
  ws,
  user_name,
}: {
  user_name: string;
  ws: WebSocket;
}): Promise<boolean> {
  removeConnection(user_name);
  let document = await findUserByUsername(user_name);

  if (!document) {
    return false;
  }

  connections[user_name] = {
    ws,
    meta: {
      bio: document.bio ?? "",
      profile_image: document.profile_picture,
      user_name,
    },
  };

  broadCastUpdatedConnectionsList();
  return true;
}

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

function removeConnection(userName: string) {
  stopObserverConnectinList(userName);
  broadCastUpdatedConnectionsList();
  delete connections[userName];
}

function observeConnecitonList(user_name: string) {
  activeConnetcionsObserver.push(user_name);
  broadCastUpdatedConnectionsListTo(user_name);
}

function stopObserverConnectinList(user_name: string) {
  let index = activeConnetcionsObserver.indexOf(user_name);
  activeConnetcionsObserver.splice(index, 1);
}

export function getConnectionByUserName(user_name: string) {
  if (!connections[user_name]) {
    return undefined;
  }
  return connections[user_name];
}

wsConnectionStateChangeInterceptors.push((ws, payload, isConnected) => {
  if (isConnected) {
    addConnection({
      ws,
      user_name: payload.user_name,
    });
  } else {
    removeConnection(payload.user_name);
  }
});

wsMessageInterceptors.push((ws, payload, message) => {
  let incomingMessage: SocketMessagePlayLoad = JSON.parse(message.toString());
  if (incomingMessage.event === SocketKeys.activePlayer) {
    console.log(`${payload.user_name} started observing players`);
    observeConnecitonList(payload.user_name);
  }
});
