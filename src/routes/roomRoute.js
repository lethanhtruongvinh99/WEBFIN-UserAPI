const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  createNewRoom,
  findRoomById,
  addNewMessageToRoom,
  addNewMemberToRoom,
  getAllRoom,
} = require("../controllers/rooms.controller");
const Room = require("../models/room");

router.get("/add", (req, res) => {
  res.json("Create a new room!");
});

router.get("/", async (req, res) => {
  passport.authorize('jwt', {session: false}, async (err, user, info) => {
    if (err) {
      console.log("err");
      return res.json({message: err.message});
    } 
    if (info) {
      console.log(info);
      return res.json({message:info.message});
    } else {
      const result = await getAllRoom();
      if (result.status) {
        return res.json({ rooms: result.rooms});
      } else {
        return res.json({message: "error"});
      }
    }
  })(req, res);
})
router.post("/add", (req, res) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      console.log("err at authenticate");
      return res.json(err);
    }
    if (info) {
      console.log("info");
      return res.json(info);
    } else {
      let room = new Room();
      //   console.log(req.body.name);
      room.name = req.body.roomName;
      room.createdBy = user._id;
      room.gameSize = req.body.boardSize;
      room.members.push(user);
      room.isAvailable = true;
      room.isCreatedAt = new Date();
      room.isDeleted = false;
      const result = await createNewRoom(room);
      if (result.status) {
        res.json(result.room);
      } else {
        res.json("error");
      }
    }
  })(req, res);
});
router.post("/join", (req, res) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    if (info) {
      console.log(info);
      return res.json(info);
    } else {
      try {
        const room = await findRoomById(req.body.roomId);
        if (room.status) {
          const addMember = await addNewMemberToRoom(room.room, user);
          // console.log(addMember);
          if (addMember.status) {
            return res.status(200).json(addMember.updatedRoom);
          } else {
            return res.status(400).json({message: "Cannot join that room", err: addMember.err});
          }
        } else {
          return res.json(room.err);
        }
      } catch (err) {
        return res.status(400).json({message: "Cannot find that room", err: err});
      }
    }
  })(req, res);
});
//close room when the play A aka owner leave.

module.exports = router;
