const express = require("express");
const passport = require("passport");
const { createNewMessage } = require("../controllers/messages.controller");
const {
  findRoomById,
  addNewMessageToRoom,
} = require("../controllers/rooms.controller");
const { update } = require("../models/message");
const Message = require("../models/message");

const router = express.Router();
router.get("/", (req, res) => {
  res.json("message route");
});

router.post("/add", (req, res) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    if (info) {
      console.log(info);
      return res.json(info);
    } else {
      let message = new Message();
      //roomId in req.body.roomId
      //   const roomId = "5fd610d8002ffd17b03ea21c";
      const room = await findRoomById(req.body.roomId);
      if (room.status) {
        message.content = req.body.content;
        message.createdBy = user._id;
        message.username = user.username;
        // console.log(typeof user._id);
        message.isCreatedAt = new Date();
        message.isDeleted = false;
        message.belongTo = room.room._id;
        // console.log(message);
        const result = await createNewMessage(message);
        // console.log(result);
        if (result.status) {
          const addResult = await addNewMessageToRoom(room.room, message);
          if (addResult.status) {
          } else {
            res.json(addResult.err);
          }
          return res.json(result.message);
        } else {
          return res.json("error");
        }
      } else {
        res.json("error");
      }
    }
  })(req, res);
});

module.exports = router;
