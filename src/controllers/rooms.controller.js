const Room = require("../models/room");

const getAllRoom = async () =>
{
  try
  {
    const result = await Room.find({ isDeleted: false });
    return { status: true, rooms: result };
  } catch (err)
  {
    return err;
  }
};
const findRoomById = async (roomId) =>
{
  try
  {
    const result = await Room.findOne({ _id: roomId });
    return { status: true, room: result };
  } catch (err)
  {
    return { status: false, err: err };
  }
};

const getRoomDetail = async (id) =>
{
  try
  {
    const result = await Room.findOne({ _id: id });
    return { status: true, data: result };
  } catch (err)
  {
    return { status: false, data: err };
  }
};
const createNewRoom = async (room) =>
{
  try
  {
    const result = await room.save();
    return { status: true, room: result };
  } catch (err)
  {
    return { status: false, err: err };
  }
};
const addNewMessageToRoom = async (room, message) =>
{
  try
  {
    let updatedRoom = room;
    updatedRoom.messages.push(message);
    const result = await Room.findOneAndUpdate(
      { _id: room._id },
      updatedRoom,
      (err) =>
      {
        if (err)
        {
          console.log(err);
          return { status: false, err: err };
        }
      }
    );
    return { status: true, updatedRoom: result };
  } catch (err)
  {
    return { status: false, err: err };
  }
};

const addNewMemberToRoom = async (room, user) =>
{
  try
  {
    let updatedRoom = room;
    updatedRoom.members.push(user._id);
    const result = await Room.findOneAndUpdate(
      { _id: room._id },
      updatedRoom,
      (err) =>
      {
        if (err)
        {
          console.log(err);
          return { status: false, err: err };
        }
      }
    );
    return { status: true, updatedRoom: result };
  } catch (err)
  {
    return { status: false, err: err };
  }
};

const getHitoryRoom = async (accountId) =>
{
  try
  {
    //insert list is playerB
    const result = await Room.find({ "createdBy._id": accountId });
    return { status: true, data: result };
  } catch (err)
  {
    return { status: false, data: err };
  }
};

module.exports = {
  createNewRoom,
  findRoomById,
  addNewMessageToRoom,
  addNewMemberToRoom,
  getAllRoom,
  getRoomDetail,
  getHitoryRoom,
};
