const express = require("express");
const router = express.Router();
const passport = require("passport");
const { createNewRoom } = require("../controllers/rooms.controller");
const Room = require("../models/room");

router.get("/add", (req, res) => {
  res.json("Create a new room!");
});
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
      room.name = req.body.name;
      room.createdBy = user._id;
      // room.gameSize = req.body.size;
      room.isAvailable = true;
      room.isCreatedAt = new Date();
      room.members.push(user._id);
      room.isDeleted = false;
      //   console.log(room);
      const result = await createNewRoom(room);
      //   console.log(result);
      if (result.status) {
        res.json(result.room);
      } else {
        res.json("error");
      }
    }
  })(req, res);
});

module.exports = router;
