import { getConnectionByUserName } from "../../connection_handler/connection_handler";
import { send } from "../../wrapper/WebSocket";
import { GameEvents } from "./event_names";
import { activePlayRequest } from "./state";

export function generateKey(username1: string, username2: string): string {
  const sortedUsernames = [username1, username2].sort();
  const key = sortedUsernames.join("-");
  return key;
}

export function suspendInvitation(
  playReqId: string,
  notifySuspension: boolean
) {
  const activeRequest = activePlayRequest[playReqId];
  if (!activeRequest) {
    return;
  }
  if (notifySuspension) {
    let { p1_user_name, p2_user_name } = activeRequest;
    [p1_user_name, p2_user_name].forEach((it) => {
      send(
        it,
        JSON.stringify({
          event: GameEvents.PLAY_REQ_REVOKE,
          playReqId,
        })
      );
    });
  }
  delete activePlayRequest[playReqId];
}
