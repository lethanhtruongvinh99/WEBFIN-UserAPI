const Account = require("../models/account");
const Room = require("../models/room");

const getAllRoom = async () =>
{
  try
  {
    const awaiting = await Room.find({ isAvailable: true });
    const ongoing = await Room.find({ isAvailable: false, winner: { username: '' } });
    return { status: true, rooms: { awaiting, ongoing } };
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
    const result = await Room.findOneAndUpdate({ _id: room._id }, updatedRoom, (err) =>
    {
      if (err)
      {
        console.log(err);
        return { status: false, err: err };
      }
    });
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
    const result = await Room.findOneAndUpdate({ _id: room._id }, updatedRoom, (err) =>
    {
      if (err)
      {
        console.log(err);
        return { status: false, err: err };
      }
    });
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
    const result = await Room.find({ $or: [{ "createdBy._id": accountId }, { "playerB._id": accountId }] });
    return { status: true, data: result };
  } catch (err)
  {
    return { status: false, data: err };
  }
};
const addMoveToRoom = async (room, move) =>
{
  //console.log("==============ADD MOVE TO ROOM: =======================");
  try
  {
    //console.log("==============ADD MOVE TO ROOM22222222: =======================");
    let updatedRoom = room;
    //console.log("==============ADD MOVE TO ROOM222222.5: =======================", room.moveList);
    //console.log("==============ADD MOVE TO ROOM222222.5: =======================", room.name);
    updatedRoom.moveList.push({ ...move });
    //console.log("==============ADD MOVE TO ROOM33333333333: =======================");
    //console.log("==============ADD MOVE TO ROOM: ", updatedRoom.moveList);

    const result = await Room.findOneAndUpdate({ _id: room._id }, updatedRoom, (err) =>
    {
      if (err)
      {
        console.log(err);
        return { status: false, err: err };
      }
    });
    return { status: true, updatedRoom: result };
  } catch (err)
  {
    return { status: false, data: err };
  }
};
const addRoomPlayerB = async (room, playerB) =>
{
  try
  {
    let updatedRoom = room;
    updatedRoom.playerB = { ...playerB };
    updatedRoom.isAvailable = false;
    const result = await Room.findOneAndUpdate({ _id: room._id }, updatedRoom, (err) =>
    {
      if (err)
      {
        console.log(err);
        return { status: false, err: err };
      }
    });
    return { status: true, data: result };
  } catch (err)
  {
    return { status: false, data: err };
  }
};

const startRoom = async (room) =>
{
  try
  {
    const updatedRoom = room;
    updatedRoom.isAvailable = false;
    const result = await Room.findOneAndUpdate({ _id: room._id }, updatedRoom, (err) =>
    {
      if (err)
      {
        console.log(err);
        return { status: false, err: err };
      }
    });
    return { status: true, data: result };
  } catch (err)
  {
    return { status: false, err: err };
  }
};
const createQuickPlayRoom = async (host, player) =>
{
  const hostP = await Account.findOne({ username: host });
  const playerB = await Account.findOne({ username: player });
  if (!host || !player)
  {
    return { status: false, err: "cannot find" };
  }
  const newRoom = new Room();
  newRoom.createdBy = hostP;
  newRoom.playerB = playerB;
  const result = await newRoom.save();
  if (!result)
  {
    return { status: false, err: "Lỗi khi tạo phòng" };
  }
  return { status: true, data: result };
};
module.exports = {
  createNewRoom,
  findRoomById,
  addNewMessageToRoom,
  addNewMemberToRoom,
  getAllRoom,
  getRoomDetail,
  getHitoryRoom,
  addMoveToRoom,
  addRoomPlayerB,
  startRoom,
  createQuickPlayRoom,
};
