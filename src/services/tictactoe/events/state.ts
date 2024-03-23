import TicTacToe from "../game_logic";
export let activePlayRequest: {
  [requId: string]: {
    p1_user_name: string;
    p2_user_name: string;
  }|undefined;
} = {};

export let activeGame: {
  [gameKey: string]: {
    player: {
      symbol: number;
      user_name: string;
    }[];
    game: TicTacToe;
  }|undefined;
} = {};

interface PlayReqRes {
  isAccepted: boolean;
  reqid: string;
}

