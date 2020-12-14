const Game = require('../models/game');

const createNewGame = () => {
    const newGame = new Game();
    return newGame;
}

module.exports = {createNewGame};