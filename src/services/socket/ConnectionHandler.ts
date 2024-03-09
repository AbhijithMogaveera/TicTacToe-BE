import { SocketKeys } from "../../models/socket/SocketKeys";
import { findUserByUsername } from "../profile";
import { WebSocket } from "ws";

interface UserMeta {
  bio: string;
  profile_image?: string;
  user_name: string;
}

let connections: {
  [user_name: string]: {
    ws: WebSocket;
    meta: UserMeta;
  };
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
      activeusersMeta.push(connections[user_name].meta);
    }
    activeusersMeta.forEach((meta)=>{
      connections[meta.user_name].ws.send(JSON.stringify({
        event:SocketKeys.activePlayer,
        data:activeusersMeta
      }));
    })
    console.log(activeusersMeta.map(it=>it.user_name), activeConnetcionsObserver)
  }

  broadCastUpdatedConnectionsListTo(user_name:string){
    if(!connections[user_name]){
      return
    }
    let arr: UserMeta[] = [];
    for (const user_name in connections) {
      arr.push(connections[user_name].meta);
    }
    connections[user_name].ws.send(JSON.stringify({
      event:SocketKeys.activePlayer,
      data:arr
    }));
  }

  removeConnection(userName: string) {
    if (connections[userName]) {
      connections[userName].ws.close();
    }
    this.stopObserverConnectinList(userName);
    delete connections[userName];
    this.broadCastUpdatedConnectionsList();
  }

  observeConnecitonList(user_name: string) {
    activeConnetcionsObserver.push(user_name);
    this.broadCastUpdatedConnectionsListTo(user_name)
  }

  stopObserverConnectinList(user_name: string) {
    let index = activeConnetcionsObserver.indexOf(user_name);
    activeConnetcionsObserver.splice(index, 1);
  }

}

export let connectionHandler = new ConnectionHandler();

let x = {
  name:"abhijith",
  number:"+918217629625"
}

let y = {...x}

y.name = "Divya"