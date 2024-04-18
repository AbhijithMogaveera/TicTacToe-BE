import e from "express";
import { emitData } from "../../../../util/WebSocket";
import { GameEvents } from "./event_names";
import { activePlayRequest } from "./state";

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const TEN_MINUTE = ONE_MINUTE * 10;

export function generateKey(username1: string, username2: string): string {
  const sortedUsernames = [username1, username2].sort();
  const key = sortedUsernames.join("-");
  return key;
}

export async function suspendInvitation(
  playReqId: string,
  notifySuspension: boolean
) {
  const activeRequest = activePlayRequest[playReqId];
  if (!activeRequest) {
    return;
  }
  if (notifySuspension) {
    let { p1_user_name, p2_user_name } = activeRequest;
    await emitData(
      JSON.stringify({
        event: GameEvents.PLAY_REQ_REVOKE,
        playReqId,
      })
    ).to(p1_user_name, p2_user_name);
  }
  delete activePlayRequest[playReqId];
}
