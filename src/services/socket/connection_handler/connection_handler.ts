import { wsConnectionStateChangeInterceptors } from "..";

import { UserMeta } from "../../../models/socket/UserMeta";
import { findUserByUsername } from "../../rest/profile";
import { WebSocket } from "ws";

export let connections: {
  [user_name: string]:
    | {
        ws: WebSocket;
        meta: UserMeta;
      }
    | undefined;
} = {};

async function addConnection({
  ws,
  user_name,
}: {
  user_name: string;
  ws: WebSocket;
}): Promise<boolean> {
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
  return true;
}

function removeConnection(userName: string) {
  delete connections[userName];
}

export function getConnectionByUserName(user_name: string) {
  if (!connections[user_name]) {
    return undefined;
  }
  return connections[user_name];
}

wsConnectionStateChangeInterceptors.push(async (ws, payload, isConnected) => {
  if (isConnected) {
    await addConnection({
      ws,
      user_name: payload.user_name,
    });
  } else {
    removeConnection(payload.user_name);
  }
});
