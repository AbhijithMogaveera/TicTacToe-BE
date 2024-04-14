import { GameEvents, PLAY_REQ_TIME_OUT } from "./event_names";
import { findUserByUsername } from "../../../rest/profile";
import {
  wsConnectionStateChangeInterceptors,
  wsIncommingMessageInterceptors,
} from "../..";
import { v4 as uuidv4 } from "uuid";
import { activePlayRequest } from "./state";
import { UserMeta } from "../../../../models/socket/UserMeta";
import { suspendInvitation } from "./util";
import { send } from "../../wrapper/WebSocket";
import { ConnectionStateInterceptor } from "../../types";

wsIncommingMessageInterceptors.push(async (_ws, payload, message) => {
  try {
    let participant: SocketMessagePlayLoad = JSON.parse(message.toString());
    if (participant.event !== GameEvents.ASK_TO_PLAY) {
      return;
    }
    let otherUserName: string = participant.data;
    let user = (await findUserByUsername(otherUserName))!;
    if (!user) {
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
    send(
      otherUserName,
      JSON.stringify({
        event: GameEvents.PLAY_REQ,
        participant: meta,
        invitationID: id,
      })
    );
    send(
      payload.user_name,
      JSON.stringify({
        event: GameEvents.ASK_TO_PLAY,
        playRequestId: id,
      })
    );
    let connectionStateInterceptor: ConnectionStateInterceptor 
    function suspendInvitation2() {
      suspendInvitation(id, true);
      let index = wsConnectionStateChangeInterceptors.indexOf(connectionStateInterceptor);
      wsConnectionStateChangeInterceptors.slice(index);
    }
    setTimeout(() => {
      suspendInvitation2();
    }, PLAY_REQ_TIME_OUT);

    connectionStateInterceptor  = async (
      ws,
      paylod2,
      isConnected
    ) => {
      if (
        payload.user_name === paylod2.user_name ||
        otherUserName === paylod2.user_name
      ) {
        if (!isConnected) {
          suspendInvitation2();
        }
      }
    };
    wsConnectionStateChangeInterceptors.push(connectionStateInterceptor);
  } catch (e) {
    console.log(e);
  }
});
