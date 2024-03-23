import { connectionHandler } from "../../socket/ConnectionHandler";
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
    console.log("active play request not found for " + playReqId);
    return;
  }
  if (notifySuspension) {
    let { p1_user_name, p2_user_name } = activeRequest;
    [
      connectionHandler.getConnectionByUserName(p1_user_name),
      connectionHandler.getConnectionByUserName(p2_user_name),
    ].forEach((it) => {
      it?.ws.send(
        JSON.stringify({
          event: GameEvents.PLAY_REQ_REVOKE,
          playReqId,
        })
      );
    });
  }
  delete activePlayRequest[playReqId];
  console.log("delete active play request", activeRequest);
}
