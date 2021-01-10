const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountChema = new Schema({
  username: { type: String, unique: true, trim: true, minlength: 10 },
  fullName: String,
  dob: Date,
  email: { type: String, unique: false, trim: true },
  password: { type: String, trim: true, minlength: 8 },

  isActivate: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  invitations: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Account",
      },
      username: String,
      roomId: String,
    },
  ],
  //rooms are created by that Account
  rooms: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Room",
      },
      name: String,
      isCreatedAt: Date,
    },
  ],
  messages: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
      content: String,
      isCreatedAt: Date,
    },
  ],
  role: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  isCreatedAt: { type: Date, default: new Date() },
  isUpdatedAt: { type: Date, default: null },
});
module.exports = mongoose.model("Account", accountChema);
