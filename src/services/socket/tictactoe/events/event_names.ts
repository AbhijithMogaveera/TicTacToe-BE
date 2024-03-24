export const PLAY_REQ_TIME_OUT = 1000 * 60;

export const GameEvents = {
  PLAY_REQ: "play_request",
  PLAY_REQ_ACCEPT: "play_request_accept",
  PLAY_REQ_REJECT:"play_request_reject",
  PLAY_REQ_REVOKE:"play_request_revoke",
  ASK_TO_PLAY: "ask_to_play",
  GAME:"game",
  GAME_STOP:"game_stop"
};

export const GameIssues = {
    userNotFoung(userName:string | undefined){
        if(userName){
            return "Client not found with user name "+userName
        }
        return "Client not found"
    }
}