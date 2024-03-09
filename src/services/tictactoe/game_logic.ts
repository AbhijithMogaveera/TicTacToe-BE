type Player = 1 | 0 | -1;

type Board = Player[][];

class TicTacToe {
  board: Board;

  currentPlayer: Player;

  constructor() {
    this.board = [
      [-1, -1, -1],
      [-1, -1, -1],
      [-1, -1, -1],
    ];
    this.currentPlayer = 1;
  }

  move(row: number, col: number): boolean {
    if (this.board[row][col] === -1) {
      this.board[row][col] = this.currentPlayer;
      return true;
    }
    return false;
  }

  checkWin(): Player | undefined {
    const lines = [
      // Rows
      [
        [0, 0],
        [0, 1],
        [0, 2],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
      ],
      // Columns
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
      ],
      // Diagonals
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
      [
        [0, 2],
        [1, 1],
        [2, 0],
      ],
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (
        this.board[a[0]][a[1]] !== -1 &&
        this.board[a[0]][a[1]] === this.board[b[0]][b[1]] &&
        this.board[a[0]][a[1]] === this.board[c[0]][c[1]]
      ) {
        return this.board[a[0]][a[1]];
      }
    }

    if (this.board.every((row) => row.every((cell) => cell !== -1))) {
      return -1;
    }

    return undefined;
  }

  getCurrentPlayer(): Player {
    return this.currentPlayer;
  }

  getBoard(): Board {
    return this.board;
  }

  switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === 1 ? 0 : 1;
  }
}

export default TicTacToe;