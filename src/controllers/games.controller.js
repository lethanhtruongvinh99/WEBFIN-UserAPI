const Game = require('../models/game');

const createNewGame = () => {
    const newGame = new Game();
    return newGame;
}
const findGamesByUserId = async (UserId) => {
    try {
        const isPlayerA = await Game.find({playerA: UserId});
        const isPlayerB = await Game.find({playerB: UserId});
        const result = [...isPlayerA, ...isPlayerB];
        return {status: true, games: result};
    } catch (err) {
        return err;
    }
}

module.exports = {createNewGame, findGamesByUserId};