import { connectionHandler } from "../../socket/ConnectionHandler";
import { wsMessageInterceptors } from "../../SocketServer";
import { GameEvents } from "./event_names";
import { activePlayRequest } from "./state";
import { suspendInvitation } from "./util";

wsMessageInterceptors.push((ws, payload, message) => {
  try {
    let messagePayload: SocketMessagePlayLoad = JSON.parse(message.toString());
    if (messagePayload.event !== GameEvents.PLAY_REQ_REVOKE) {
      return;
    }
    let playReqId: string = messagePayload.data;
    if (activePlayRequest[playReqId]) {
      suspendInvitation(playReqId, true);
    }
  } catch (e) {
    console.log(e);
  }
});
