import { GameEvents } from "./event_names";
import { wsIncommingMessageInterceptors } from "../..";
import { activeGame, activePlayRequest } from "./state";
import TicTacToe from "../game_logic";
import { generateKey, suspendInvitation } from "./util";
import { startGame } from "../game_session/util";

wsIncommingMessageInterceptors.push(async (_ws, _payload, message) => {
  try {
    let messagePayload: SocketMessagePlayLoad = JSON.parse(message.toString());

    if (messagePayload.event !== GameEvents.PLAY_REQ_ACCEPT) {
      return;
    }
    let invitationId: string = messagePayload.data;
    let req = activePlayRequest[invitationId];
    if (!req) {
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
    await suspendInvitation(invitationId, true);
    await startGame(req.p1_user_name, req.p2_user_name);
  } catch (e) {
    console.log(e);
  }
});
