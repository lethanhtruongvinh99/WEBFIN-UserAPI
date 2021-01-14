const express = require("express");
const router = express.Router();
const passport = require("passport");
const { createNewRoom, findRoomById, addNewMemberToRoom, getAllRoom, getRoomDetail, addMoveToRoom, addRoomPlayerB, createQuickPlayRoom } = require("../controllers/rooms.controller");
const message = require("../models/message");
const Room = require("../models/room");

router.get("/", async (req, res) =>
{
  //get all room
  passport.authenticate("jwt", { session: false }, async (err, user, info) =>
  {
    if (err)
    {
      console.log("err");
      return res.json({ message: err.message });
    }
    if (info)
    {
      console.log(info);
      return res.json({ message: info.message });
    } else
    {
      const result = await getAllRoom();
      if (result.status)
      {
        return res.json({ rooms: result.rooms });
      } else
      {
        return res.json({ message: "error" });
      }
    }
  })(req, res);
});

router.post("/detail", (req, res) =>
{
  passport.authenticate("jwt", { session: false }, async (err, user, info) =>
  {
    if (err)
    {
      console.log("err");
      return res.json({ message: err.message });
    }
    if (info)
    {
      console.log(info);
      return res.json({ message: info.message });
    } else
    {
      const result = await getRoomDetail(req.body.roomId);
      if (result.status)
      {
        return res.json({ data: result.data });
      } else
      {
        return res.json({ message: result.data });
      }
    }
  })(req, res);
});
router.post("/add", (req, res) =>
{
  //create new room
  passport.authenticate("jwt", { session: false }, async (err, user, info) =>
  {
    if (err)
    {
      console.log("err at authenticate");
      return res.json(err);
    }
    if (info)
    {
      console.log("info");
      return res.json(info);
    } else
    {
      let room = new Room();
      room.name = req.body.roomName;
      // room.createdBy._id = user._id;
      // room.createdBy.username = user.username;
      room.createdBy = { ...user };
      room.gameSize = req.body.boardSize;
      room.password = req.body.roomPassword;
      room.timePerTurn = req.body.roomTimePerTurn;
      room.members.push(user);
      room.isAvailable = true;
      room.isCreatedAt = new Date();
      room.isDeleted = false;
      room.moveList = [];
      const result = await createNewRoom(room);
      if (result.status)
      {
        res.json(result.room);
      } else
      {
        res.json("error");
      }
    }
  })(req, res);
});
router.post("/join", (req, res) =>
{
  passport.authenticate("jwt", { session: false }, async (err, user, info) =>
  {
    if (err)
    {
      console.log(err);
      return res.json(err);
    }
    if (info)
    {
      console.log(info);
      return res.json(info);
    } else
    {
      try
      {
        const room = await findRoomById(req.body.roomId);
        //console.log(req.body.joinMode);
        if (room.status)
        {
          if (req.body.joinMode === "play")
          {
            if (!room.room.isAvailable)
            {
              return res.status(404).json({ auth: false, message: "Cannot Join that room!" });
            }
            const addPlayerB = await addRoomPlayerB(room.room, user);
            if (addPlayerB.status)
            {
              // console.log(addPlayerB);
              return res.status(200).json({ auth: true, data: addPlayerB.data });
            }
          }
          if (req.body.joinMode === "observe")
          {
            const addMember = await addNewMemberToRoom(room.room, user);
            // console.log(addMember);
            if (addMember.status)
            {
              return res.status(200).json({ auth: true, data: addMember.updatedRoom });
            } else
            {
              return res.status(400).json({
                auth: false,
                message: "Cannot join that room",
                err: addMember.err,
              });
            }
          }
        } else
        {
          return res.json({ auth: false, message: room.err });
        }
      } catch (err)
      {
        return res.status(400).json({ auth: false, message: "Cannot find that room", err: err });
      }
    }
  })(req, res);
});

router.post("/leave", (req, res) =>
{
  passport.authenticate("jwt", async (err, user, info) =>
  {
    if (err)
    {
      console.log("err");
      return res.json({ message: err.message });
    }
    if (info)
    {
      console.log(info);
      return res.json({ message: info.message });
    } else
    {
      const result = await getRoomDetail(req.body.roomId);
      // console.log(result);
      console.log(result.data.createdBy._id.toString().localeCompare(user._id.toString()));
      if (result.status)
      {
        if (result.data.createdBy._id.toString().localeCompare(user._id.toString()) === 0)
        {
          return res.status(200).json({ sign: 1 });
        }
        if (result.data.hasOwnProperty("playerB"))
        {
          if (result.data.playerB._id.toString().localeCompare(user._id.toString()) === 0)
          {
            result.data.isAvailable = true;
            const fin = await Room.findOneAndUpdate({ _id: result.data._id }, result.data);
            if (fin)
            {
              return res.status(200).json({ sign: 2 });
            }
          }
        }

        return res.status(200).json({ sign: 3 });
      } else
      {
        return res.status(400).json({ message: result.err });
      }
      return res.json(result);
    }
  })(req, res);
});

router.post("/start", (req, res) =>
{
  passport.authenticate("jwt", async (err, user, info) =>
  {
    if (err)
    {
      console.log("err");
      return res.json({ message: err.message });
    }
    if (info)
    {
      console.log(info);
      return res.json({ message: info.message });
    } else
    {
      const result = await getRoomDetail(req.body.roomId);
      console.log(result);
      if (result.status)
      {
        if (!result.data.playerB)
        {
          return res.status(400).json({ auth: false, message: "Đang đợi người chơi" });
        } else
        {
          const startRoom = await startRoom(result.data);
          if (startRoom.status)
          {
            return res.status(200).json({ auth: true, message: "Bắt đầu trờ chơi." });
          } else
          {
            return res.status(400).json({ auth: false, message: startRoom.err });
          }
        }
      } else
      {
        return res.status(400).json({ auth: false, message: result.err });
      }
    }
  })(req, res);
});
router.post("/quickplay", async (req, res) =>
{
  const result = await createQuickPlayRoom(req.body.host, req.body.player);
  if (result.status)
  {
    res.json({ data: result.data });
  } else
  {
    res.json({ message: result.err });
  }
});
//close room when the play A aka owner leave.

router.post("/move", (req, res) =>
{
  passport.authenticate("jwt", { session: false }, async (err, user, info) =>
  {
    if (err)
    {
      console.log("err at authenticate");
      return res.json(err);
    }
    if (info)
    {
      console.log("info");
      return res.json(info);
    } else
    {
      try
      {
        //console.log("POST ROOM/MOVE:----- ", req.body.roomId);
        const room = await findRoomById(req.body.roomId);
        if (room.status)
        {
          let move = req.body.move;
          console.log("POST:room/move: ", move.x);
          console.log("POST:room/move: ", move.y);
          const result = await addMoveToRoom(room.room, move);
          if (result.status)
          {
            res.json(result.status);
          } else
          {
            res.json("error");
          }
        } else
        {
          return res.json({ auth: false, message: room.err });
        }
      } catch (error)
      {
        return res.status(400).json({ auth: false, message: "Cannot find that room", err: err });
      }
    }
  })(req, res);
});
module.exports = router;
