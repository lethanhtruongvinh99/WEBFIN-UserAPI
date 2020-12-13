const { update } = require("../models/room");
const Room = require("../models/room");

const findRoomById = async (roomId) => {
  try {
    const result = await Room.findOne({ _id: roomId });
    return { status: true, room: result };
  } catch (err) {
    return { status: false, err: err };
  }
};
const createNewRoom = async (room) => {
  try {
    const result = await room.save();
    return { status: true, room: result };
  } catch (err) {
    return { status: false, err: err };
  }
};
const addNewMessageToRoom = async (room, message) => {
  try {
    let updatedRoom = room;
    updatedRoom.messages.push(message);
    const result = await Room.findOneAndUpdate(
      { _id: room._id },
      updatedRoom,
      (err) => {
        if (err) {
          console.log(err);
          return { status: false, err: err };
        }
      }
    );
    return { status: true, updatedRoom: result };
  } catch (err) {
    return { status: false, err: err };
  }
};

const addNewMemberToRoom = async (room, user) => {
  try {
    let updatedRoom = room;
    updatedRoom.members.push(user._id);
    const result = await Room.findOneAndUpdate(
      { _id: room.id },
      updatedRoom,
      (err) => {
        if (err) {
          console.log(err);
          return { status: false, err: err };
        }
      }
    );
    return { status: true, updatedRoom: result };
  } catch (err) {
    return { status: false, err: err };
  }
};

module.exports = { createNewRoom, findRoomById, addNewMessageToRoom, addNewMemberToRoom };
