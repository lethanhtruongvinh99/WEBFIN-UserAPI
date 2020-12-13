const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const msgSchema = new Schema({
  content: { type: String, require: true, trim: true },
  username: { type: String, require: true, trim: true },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  },
  belongTo: {
    type: Schema.Types.ObjectId,
    ref: "Room",
  },
  isDeleted: Boolean,
  isCreatedAt: Date,
  isUpdatedAt: Date,
});

module.exports = mongoose.model("Message", msgSchema);
