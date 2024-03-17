import { UserMeta } from "../../models/socket/UserMeta";
import { findUserByUsername } from "../profile";
import { connectionHandler } from "../socket/ConnectionHandler";
import { sockeetInterceptor as wsInterceptors } from "../socket/SocketServer";
import { v4 as uuidv4 } from "uuid";
import TicTacToe from "./game_logic";

let activePlayRequest: {
  [requId: string]: {
    p1_user_name: string;
    p2_user_name: string;
  };
} = {};

let activeGame: {
  [gameKey: string]: {
    player: {
      symbol: number;
      user_name: string;
    }[];
    game: TicTacToe;
  };
} = {};

interface PlayReqRes {
  isAccepted: boolean;
  reqid: string;
}

//OnRequesting
wsInterceptors.push(async (_ws, payload, message) => {
  try {
    console.log("-----------------------");
    console.log(message.toString());
    let participant: SocketMessagePlayLoad = JSON.parse(message.toString());
    if (participant.event !== "ask_to_play") {
      return;
    }
    let otherUserName: string = participant.data;
    let connection = connectionHandler.getConnectionByUserName(otherUserName);
    let user = (await findUserByUsername(otherUserName))!;
    if (!user) {
      console.log("Client not found with user name " + otherUserName);
      return;
    }
    let id = uuidv4();
    activePlayRequest[id] = {
      p1_user_name: payload.user_name,
      p2_user_name: otherUserName,
    };
    let meta: UserMeta = {
      bio: user.bio ?? "",
      profile_image: user.profile_picture,
      user_name: user.user_name,
    };
    let res = JSON.stringify({
      event: "play_request",
      participant: meta,
      invitationID: id,
    });
    connection.ws.send(res);
    setTimeout(() => {
      delete activePlayRequest[id];
    }, 1000 * 60);
  } catch (e) {
    console.log(e);
  }
});

//OnAccept
wsInterceptors.push(async (_ws, _payload, message) => {
  try {
    let messagePayload: SocketMessagePlayLoad = JSON.parse(message.toString());

    if (messagePayload.event !== "play_request_accept") {
      return;
    }
    let invitationId: string = messagePayload.data;
    let req = activePlayRequest[invitationId];
    let activeGameKey = generateKey(req.p1_user_name, req.p2_user_name);
    activeGame[activeGameKey] = {
      game: new TicTacToe(),
      player: [
        {
          user_name: req.p1_user_name,
          symbol: 1,
        },
        {
          user_name: req.p2_user_name,
          symbol: 0,
        },
      ],
    };
    let eventPayload = JSON.stringify({
      event: "game",
      data: activeGame[activeGameKey],
      isAccepted: true,
      invitation_id:invitationId
    });
    connectionHandler
      .getConnectionByUserName(req.p1_user_name)
      .ws.send(eventPayload);
    connectionHandler
      .getConnectionByUserName(req.p2_user_name)
      .ws.send(eventPayload);
  } catch (e) {}
});

//OnReject
wsInterceptors.push(async (_ws, _payload, message) => {
  try {
    let messagePayload: SocketMessagePlayLoad = JSON.parse(message.toString());
    if (messagePayload.event !== "play_request_reject") {
      return;
    }
    let reqID: string = messagePayload.data;
    let req = activePlayRequest[reqID];
    let activeGameKey = generateKey(req.p1_user_name, req.p2_user_name);
    let data = JSON.stringify({
      reqId: reqID,
      isAccepted: false,
      event: "play_request_reject",
    });
    connectionHandler.getConnectionByUserName(req.p1_user_name).ws.send(data);
    connectionHandler.getConnectionByUserName(req.p2_user_name).ws.send(data);
  } catch (e) {}
});

function generateKey(username1: string, username2: string): string {
  const sortedUsernames = [username1, username2].sort();
  const key = sortedUsernames.join("-");
  return key;
}
