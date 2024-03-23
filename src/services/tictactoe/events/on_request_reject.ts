import { GameEvents } from "./event_names";
import { connectionHandler } from "../../socket/ConnectionHandler";
import { wsEventsInterceptors } from "../../socket/SocketServer";
import { activePlayRequest } from "./state";

wsEventsInterceptors.push(async (_ws, _payload, message) => {
  try {
    let messagePayload: SocketMessagePlayLoad = JSON.parse(message.toString());
    if (messagePayload.event !== GameEvents.PLAY_REQ_REJECT) {
      return;
    }
    let reqID: string = messagePayload.data;
    let req = activePlayRequest[reqID];
    if (!req) {
      console.log("active play request not found for "+reqID)
      return;
    }
    let data = JSON.stringify({
      reqId: reqID,
      isAccepted: false,
      event: GameEvents.PLAY_REQ_REJECT,
    });
    connectionHandler.getConnectionByUserName(req.p1_user_name)?.ws.send(data)??console.log("connection not found for "+req.p1_user_name);
    connectionHandler.getConnectionByUserName(req.p2_user_name)?.ws.send(data)??console.log("connection not found for "+req.p1_user_name);
    delete activePlayRequest[reqID];
  } catch (e) {
    console.log(e);
  }
});
