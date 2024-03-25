import { GameEvents } from "./event_names";
import { wsIncommingMessageInterceptors } from "../..";
import { activePlayRequest } from "./state";
import { getConnectionByUserName } from "../../connection_handler/connection_handler";
import { send } from "../../wrapper/WebSocket";

wsIncommingMessageInterceptors.push(async (_ws, _payload, message) => {
  try {
    let messagePayload: SocketMessagePlayLoad = JSON.parse(message.toString());
    if (messagePayload.event !== GameEvents.PLAY_REQ_REJECT) {
      return;
    }
    let reqID: string = messagePayload.data;
    let req = activePlayRequest[reqID];
    if (!req) {
      return;
    }
    let data = JSON.stringify({
      reqId: reqID,
      isAccepted: false,
      event: GameEvents.PLAY_REQ_REJECT,
    });
    send(req.p1_user_name, data);
    send(req.p2_user_name, data);
    delete activePlayRequest[reqID];
  } catch (e) {
    console.log(e);
  }
});
