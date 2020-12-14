const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const gameSchema = new Schema({
  winner: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  },
  belongTo: {
    type: Schema.Types.ObjectId,
    ref: "Room",
  },
  playerA: { type: Schema.Types.ObjectId, ref: "Account" },
  playerB: { type: Schema.Types.ObjectId, ref: "Account" },
  isDeleted: Boolean,
  isCreatedAt: Date,
  isUpdatedAt: Date,
});

module.exports = mongoose.Schema("Game", gameSchema);
