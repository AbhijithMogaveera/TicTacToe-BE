import { SocketKeys } from "../../models/socket/SocketKeys";
import { UserMeta } from "../../models/socket/UserMeta";
import { findUserByUsername } from "../profile";
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

class ConnectionHandler {
  async addConnection({
    ws,
    user_name,
  }: {
    user_name: string;
    ws: WebSocket;
  }): Promise<boolean> {
    this.removeConnection(user_name);
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

    this.broadCastUpdatedConnectionsList();
    return true;
  }

  broadCastUpdatedConnectionsList() {
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
  }

  broadCastUpdatedConnectionsListTo(user_name: string) {
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

  removeConnection(userName: string) {
    this.stopObserverConnectinList(userName);
    this.broadCastUpdatedConnectionsList();
    delete connections[userName];
  }

  observeConnecitonList(user_name: string) {
    activeConnetcionsObserver.push(user_name);
    this.broadCastUpdatedConnectionsListTo(user_name);
  }

  stopObserverConnectinList(user_name: string) {
    let index = activeConnetcionsObserver.indexOf(user_name);
    activeConnetcionsObserver.splice(index, 1);
  }

  getConnectionByUserName(user_name: string) {
    if (!connections[user_name]) {
      return undefined;
    }
    return connections[user_name];
  }
}

export let connectionHandler = new ConnectionHandler();
