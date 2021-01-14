const Account = require("../models/account");
const Room = require("../models/room");
let Game = require("../Game/Game");
let calculateScore = require("../Game/calculateScore");
let listGame = [];
const getAllRoom = async () => {
  try {
    const awaiting = await Room.find({ isAvailable: true });
    const ongoing = await Room.find({ isAvailable: false, isEnd: false });
    return { status: true, rooms: { awaiting, ongoing } };
  } catch (err) {
    return err;
  }
};
const findRoomById = async (roomId) => {
  try {
    const result = await Room.findOne({ _id: roomId });
    return { status: true, room: result };
  } catch (err) {
    return { status: false, err: err };
  }
};

const getRoomDetail = async (id) => {
  try {
    const result = await Room.findOne({ _id: id });
    return { status: true, data: result };
  } catch (err) {
    return { status: false, data: err };
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
    const result = await Room.findOneAndUpdate({ _id: room._id }, updatedRoom, (err) => {
      if (err) {
        console.log(err);
        return { status: false, err: err };
      }
    });
    return { status: true, updatedRoom: result };
  } catch (err) {
    return { status: false, err: err };
  }
};

const addNewMemberToRoom = async (room, user) => {
  try {
    let updatedRoom = room;
    updatedRoom.members.push(user._id);
    const result = await Room.findOneAndUpdate({ _id: room._id }, updatedRoom, (err) => {
      if (err) {
        console.log(err);
        return { status: false, err: err };
      }
    });
    return { status: true, updatedRoom: result };
  } catch (err) {
    return { status: false, err: err };
  }
};

const getHitoryRoom = async (accountId) => {
  try {
    //insert list is playerB
    const created = await Room.find({ "createdBy._id": accountId });
    const player = await Room.find({ "playerB._id": accountId });
    const result = await [...created, ...player];
    return {
      status: true,
      data: result,
    };
  } catch (err) {
    return { status: false, data: err };
  }
};
const getGameStats = async (id) => {
  const created = await Room.find({ "createdBy._id": id, isEnd: true });
  const player = await Room.find({ "playerB._id": id, isEnd: true });
  const winner = await Room.find({ "winner._id": id, isEnd: true });
  return {
    status: true,
    totalGames: created.length + player.length,
    winGame: winner.length,
  };
};
const addMoveToRoom = async (room, move) => {
  //console.log("==============ADD MOVE TO ROOM: =======================");
  try {
    //console.log("==============ADD MOVE TO ROOM22222222: =======================");
    let updatedRoom = room;
    //console.log("==============ADD MOVE TO ROOM222222.5: =======================", room.moveList);
    //console.log("==============ADD MOVE TO ROOM222222.5: =======================", room.name);
    updatedRoom.moveList.push({ ...move });
    console.log("==============ADD MOVE TO ROOM33333333333: =======================");
    //console.log("==============ADD MOVE TO ROOM: ", updatedRoom.moveList);

    const result = await Room.findOneAndUpdate({ _id: room._id }, updatedRoom, (err) => {
      if (err) {
        console.log(err);
        return { status: false, err: err };
      }
    });
    if (!listGame[room._id]) {
      listGame[room._id] = new Game(room.gameSize);
      console.log("==============ADD MOVE TO ROOM44444444444444: =======================");
    }
    let res = listGame[room._id].setPosition(move.x, move.y);
    if (!res) return { status: false, message: "Invalid Move!" };

    return { status: true, updatedRoom: result };
  } catch (err) {
    return { status: false, data: err };
  }
};
const addRoomPlayerB = async (room, playerB) => {
  try {
    let updatedRoom = room;
    updatedRoom.playerB = { ...playerB };
    updatedRoom.isAvailable = false;
    const result = await Room.findOneAndUpdate({ _id: room._id }, updatedRoom, (err) => {
      if (err) {
        console.log(err);
        return { status: false, err: err };
      }
    });
    return { status: true, data: result };
  } catch (err) {
    return { status: false, data: err };
  }
};

const startRoom = async (room) => {
  try {
    const updatedRoom = room;
    updatedRoom.isAvailable = false;
    const result = await Room.findOneAndUpdate({ _id: room._id }, updatedRoom, (err) => {
      if (err) {
        console.log(err);
        return { status: false, err: err };
      }
    });
    return { status: true, data: result };
  } catch (err) {
    return { status: false, err: err };
  }
};
const createQuickPlayRoom = async (host, player) => {
  const hostP = await Account.findOne({ username: host });
  const playerB = await Account.findOne({ username: player });
  if (!host || !player) {
    return { status: false, err: "cannot find" };
  }
  const newRoom = new Room();
  newRoom.createdBy = hostP;
  newRoom.playerB = playerB;
  const result = await newRoom.save();
  if (!result) {
    return { status: false, err: "Lỗi khi tạo phòng" };
  }
  return { status: true, data: result };
};

const setWinnerForRoom = async ({ roomId, winner }) => {
  try {
    const room = await Room.findOne({ _id: roomId });
    if (room) {
      let updatedWinner = {};
      if (winner === "X") {
        updatedWinner = await Account.findOne({ _id: room.createdBy._id });
      } else {
        updatedWinner = await Account.findOne({ _id: room.playerB._id });
      }

      const newScore = Math.round(60 / room.timePerTurn);
      updatedWinner.score = updatedWinner.score + newScore;

      //Update user
      await Account.findOneAndUpdate({ _id: updatedWinner._id }, updatedWinner);

      room.winner = updatedWinner;
      room.isEnd = true;

      const result = await Room.findOneAndUpdate({ _id: roomId }, room);
      if (result) {
        return { status: true, data: result };
      } else {
        return { status: true, data: {} };
      }
    }
  } catch (e) {
    console.log(e);
    return { status: false, data: {} };
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
  addMoveToRoom,
  addRoomPlayerB,
  startRoom,
  createQuickPlayRoom,
  setWinnerForRoom,
  getGameStats,
};
