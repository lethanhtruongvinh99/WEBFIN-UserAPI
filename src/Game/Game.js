class Game {
  constructor(size) {
    var matrix = [];
    for (var i = 0; i < size; i++) {
      matrix[i] = [];
      for (var j = 0; j < size; j++) {
        matrix[i][j] = null;
      }
    }
    this.squares = matrix;
    this.size = size;
    this.turn = "X";
    this.winner = null;
    this.cntMove = 0;
  }
  isValidPosition(x, y) {
    if (!this.isValidCord(x, y)) return false;
    if (this.squares[x][y]) return false;
    if (this.winner) return false;
    return true;
  }
  setPosition(x, y) {
    if (!this.isValidPosition(x, y)) return null;
    this.squares[x][y] = this.turn;
    this.turn = this.turn === "X" ? "O" : "X";
    console.log("IN CLASS GAME: setpos");
    this.winner = this.calculateWinner(x, y);
    console.log("IN CLASS GAME: winner: ", this.winner);
    return this.turn;
  }
  calculateWinner(i, j) {
    var prevTurn = this.squares[i][j];
    if (this.checkWin(i, j)) return prevTurn;
    return null;
  }
  isValidCord(x, y) {
    return !(x < 0 || x >= this.size || y < 0 || y >= this.size);
  }

  // i,j là nước mới đánh
  // return true khi nước cờ (i,j) dành chiến thắng
  // false khi chưa ai thắng
  checkWin(i, j) {
    var prevTurn = this.squares[i][j];
    var count = 1;
    var x = i;
    var y = j;

    // Thứ tự hướng duyệt:
    // 1. dọc : xuống, lên
    // 2. ngang: xuống, lên
    // 3. chéo chính: xuống, lên
    // 4. chéo phụ: xuống , lên
    var dX = [0, 0, 1, -1, 1, -1, -1, 1];
    var dY = [1, -1, 0, 0, 1, -1, 1, -1];

    // k= 0,1  --> duyệt dọc
    // k= 2,3  --> duyệt ngang
    // k= 4,5  --> duyệt chéo chính
    // k= 6,7  --> duyệt chéo phụ
    for (var k = 0; k < dX.length; ++k) {
      // k chẵn thì reset biến count
      // ví dụ k= 0; k= 1 thì vẫn là duyệt trên 1 cột nên count giữ nguyên để phía dưới cộng dồn
      if (k % 2 === 0) {
        count = 1;
      }

      while (this.isValidCord(this.squares[0].length, x + dX[k], y + dY[k]) && this.squares[(x += dX[k])][(y += dY[k])] === prevTurn) {
        ++count;
        if (count === 5) {
          return true;
        }
      }
      // đặt lại giá trị ban đầu để duyệt theo hướng khác
      x = i;
      y = j;
    }
    return false;
  }
  isFull() {
    return this.cntMove === this.size ** 2 ? true : false;
  }
}

module.exports = Game;
