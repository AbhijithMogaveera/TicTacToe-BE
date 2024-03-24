import { GameEvents } from "./event_names";
import { wsMessageInterceptors } from "../../SocketServer";
import { activePlayRequest } from "./state";
import { getConnectionByUserName } from "../../connection_handler/connection_handler";

wsMessageInterceptors.push(async (_ws, _payload, message) => {
  try {
    let messagePayload: SocketMessagePlayLoad = JSON.parse(message.toString());
    if (messagePayload.event !== GameEvents.PLAY_REQ_REJECT) {
      return;
    }
    let reqID: string = messagePayload.data;
    let req = activePlayRequest[reqID];
    if (!req) {
      console.log("active play request not found for " + reqID);
      return;
    }
    let data = JSON.stringify({
      reqId: reqID,
      isAccepted: false,
      event: GameEvents.PLAY_REQ_REJECT,
    });
    getConnectionByUserName(req.p1_user_name)?.ws.send(data);
    getConnectionByUserName(req.p2_user_name)?.ws.send(data);
    delete activePlayRequest[reqID];
  } catch (e) {
    console.log(e);
  }
});
