import { wsIncommingMessageInterceptors } from "../..";
import { GameEvents } from "./event_names";

wsIncommingMessageInterceptors.push(async(ws, payload, message) => {
  let messagePayload: SocketMessagePlayLoad = JSON.parse(message.toString());
  if (messagePayload.event !== GameEvents.GAME_STOP) {
    return;
  }
  const gameKey: string = messagePayload.data;
});
