const Message = require("../models/message");

const createNewMessage = async (msg) => {
  try {
    const result = await msg.save();
    return { status: true, message: msg };
  } catch (err) {
    return { status: false, err: err };
  }
};

module.exports = { createNewMessage };
