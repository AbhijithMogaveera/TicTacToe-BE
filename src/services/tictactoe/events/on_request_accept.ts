import { GameEvents } from "./event_names";
import { connectionHandler } from "../../socket/ConnectionHandler";
import { wsEventsInterceptors } from "../../socket/SocketServer";
import { activeGame, activePlayRequest } from "./state";
import TicTacToe from "../game_logic";
import { generateKey, suspendInvitation } from "./util";

wsEventsInterceptors.push(async (_ws, _payload, message) => {
  try {
    let messagePayload: SocketMessagePlayLoad = JSON.parse(message.toString());

    if (messagePayload.event !== GameEvents.PLAY_REQ_ACCEPT) {
      return;
    }
    let invitationId: string = messagePayload.data;
    let req = activePlayRequest[invitationId];
    if (!req) {
      console.log(
        "active play reqest not found " + req + " of " + invitationId
      );
      return;
    }
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
      event: GameEvents.GAME,
      data: activeGame[activeGameKey],
      isAccepted: true,
      invitation_id: invitationId,
    });
    connectionHandler
      .getConnectionByUserName(req.p1_user_name)
      ?.ws.send(eventPayload) ??
      console.log("connection not found for " + req.p1_user_name);
    connectionHandler
      .getConnectionByUserName(req.p2_user_name)
      ?.ws.send(eventPayload) ??
      console.log("connection not found for " + req.p1_user_name);
    suspendInvitation(invitationId, false);
  } catch (e) {
    console.log(e);
  }
});
