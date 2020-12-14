const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const roomSchema = new Schema({
  name: { type: String, require: true, trim: true },
  gameSize: { type: Number, require: true },
  //Room is only have 2 state is true or false, and only set 1 times.
  isAvailable: { type: Boolean, require: true },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    require: true,
  },
  members: [
    //all member joined that room. after that set Player A and B for games
    {
      type: Schema.Types.ObjectId,
      ref: "Account",
    },
  ],
  games: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Game",
      },
      isCreatedAt: Date,
    },
  ],
  messages: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
      username: String,
      content: String,
      isCreatedAt: Date,
    },
  ],
  isDeleted: Boolean,
  isCreatedAt: Date,
  isUpdatedAt: Date,
});

module.exports = mongoose.model("Room", roomSchema);
