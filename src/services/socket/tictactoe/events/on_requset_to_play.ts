import { GameEvents, GameIssues, PLAY_REQ_TIME_OUT } from "./event_names";
import { findUserByUsername } from "../../../rest/profile";
import { wsMessageInterceptors } from "../../SocketServer";
import { v4 as uuidv4 } from "uuid";
import { activePlayRequest } from "./state";
import { UserMeta } from "../../../../models/socket/UserMeta";
import { suspendInvitation } from "./util";
import { getConnectionByUserName } from "../../connection_handler/connection_handler";

wsMessageInterceptors.push(async (_ws, payload, message) => {
  try {
    let participant: SocketMessagePlayLoad = JSON.parse(message.toString());
    if (participant.event !== GameEvents.ASK_TO_PLAY) {
      return;
    }
    let otherUserName: string = participant.data;
    let user = (await findUserByUsername(otherUserName))!;
    if (!user) {
      console.log(GameIssues.userNotFoung(otherUserName));
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
    getConnectionByUserName(otherUserName)?.ws.send(
      JSON.stringify({
        event: GameEvents.PLAY_REQ,
        participant: meta,
        invitationID: id,
      })
    );
    getConnectionByUserName(payload.user_name)?.ws.send(
      JSON.stringify({
        event: GameEvents.ASK_TO_PLAY,
        playRequestId: id,
      })
    );
    setTimeout(() => {
      suspendInvitation(id, true);
    }, PLAY_REQ_TIME_OUT);
  } catch (e) {
    console.log(e);
  }
});
