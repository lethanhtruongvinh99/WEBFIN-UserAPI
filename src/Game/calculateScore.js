function calculateScore(x, y) {
  let diff = Math.abs(x - y);

  if (diff === 0) {
    return [10, -10];
  }

  if (x > y) {
    let min = 10 - diff * 0.1 < 1 ? 1 : 10 - diff * 0.1;
    let max = -10 + diff * 0.12 > 1 ? -1 : -10 + diff * 0.12;
    return [Math.ceil(min), Math.ceil(max)];
  } else {
    let min = -10 - diff * 0.2 < -25 ? -25 : -10 - diff * 0.2;
    let max = 10 + diff * 0.1 > 20 ? 20 : 10 + diff * 0.1;
    return [max, min];
  }
}

module.exports = calculateScore;
