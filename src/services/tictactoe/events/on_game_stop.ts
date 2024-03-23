import { wsEventsInterceptors } from "../../socket/SocketServer";
import { GameEvents } from "./event_names";

wsEventsInterceptors.push((ws, payload, message)=>{
    let messagePayload: SocketMessagePlayLoad = JSON.parse(message.toString());
    if (messagePayload.event !== GameEvents.GAME_STOP) {
      return;
    }
    const gameKey:string = messagePayload.data;
    
})