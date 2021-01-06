const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  createNewRoom,
  findRoomById,
  addNewMemberToRoom,
  getAllRoom,
  getRoomDetail,
} = require("../controllers/rooms.controller");
const Room = require("../models/room");

router.get("/", async (req, res) => {
  //get all room
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      console.log("err");
      return res.json({ message: err.message });
    }
    if (info) {
      console.log(info);
      return res.json({ message: info.message });
    } else {
      const result = await getAllRoom();
      if (result.status) {
        return res.json({ rooms: result.rooms });
      } else {
        return res.json({ message: "error" });
      }
    }
  })(req, res);
});

router.post("/detail", (req, res) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      console.log("err");
      return res.json({ message: err.message });
    }
    if (info) {
      console.log(info);
      return res.json({ message: info.message });
    } else {
      const result = await getRoomDetail(req.body.roomid);
      if (result.status) {
        return res.json({ data: result.data });
      } else {
        return res.json({ message: result.data });
      }
    }
  })(req, res);
});
router.post("/add", (req, res) => {
  //create new room
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
      room.name = req.body.roomName;
      // room.createdBy._id = user._id;
      // room.createdBy.username = user.username;
      room.createdBy = { ...user };
      room.gameSize = req.body.boardSize;
      room.password = req.body.password;
      room.timePerTurn = req.body.timePerTurn;
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
            return res
              .status(200)
              .json({ auth: true, data: addMember.updatedRoom });
          } else {
            return res.status(400).json({
              auth: false,
              message: "Cannot join that room",
              err: addMember.err,
            });
          }
        } else {
          return res.json({ auth: false, message: room.err });
        }
      } catch (err) {
        return res
          .status(400)
          .json({ auth: false, message: "Cannot find that room", err: err });
      }
    }
  })(req, res);
});
//close room when the play A aka owner leave.

module.exports = router;
