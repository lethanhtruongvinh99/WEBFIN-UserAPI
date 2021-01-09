var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const socket = require("socket.io");
const jwt = require("jsonwebtoken");

const indexRouter = require("./src/routes/index");
const authRouter = require("./src/routes/accountRoute");
const passport = require("passport");
const { decode } = require("punycode");
const {
  addInvitation,
  removeInvitation,
} = require("./src/controllers/accounts.controller");
dotenv.config();

var app = express();

const db = mongoose.connection;

require("./src/passport");

//connect to db
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Connected to databasae!`));
db.on("error", (err) => {
  console.log(`Error when connecting database ${err.message}`);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(cors());
app.options("*", cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//app.use("/", indexRouter);
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/room", require("./src/routes/roomRoute"));
app.use("/message", require("./src/routes/messageRoute"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
//config socket io
const server = http.createServer(app);
const io = socket(server, {
  cors: true,
  origins: [process.env.CLIENT],
});

let onlineUsers = [];
let clients = [];
let usersInRoom = [];
io.on("connection", (socket) => {
  socket.on("login", ({ token }) => {
    try {
      console.log(`Connected!`);
      socket.join("onlineUsers");
      const decoded = jwt.verify(token, process.env.SECRET);
      socket.username = decoded.username;
      onlineUsers.push({ username: socket.username, socketId: socket.id });

      //Broad cast to connected clients
      socket.to("onlineUsers").emit("onlineUsersChanged", { onlineUsers });
      //Send list of online users back to client
      socket.emit("onlineUsersChanged", { onlineUsers });
      //console.log(onlineUsers);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("logout", () => {
    try {
      onlineUsers = onlineUsers.filter(
        (item) => item.username !== socket.username
      );
      //Broad cast to connected clients
      socket.to("onlineUsers").emit("onlineUsersChanged", { onlineUsers });
      socket.leave("onlineUsers");
      console.log("Client logged out");
      //console.log(onlineUsers);
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(
      (item) => item.username !== socket.username
    );
    socket.to("onlineUsers").emit("onlineUsersChanged", { onlineUsers });
    socket.leave("onlineUsers");
    console.log("Client Disconnected");
  });

  socket.on("join", ({ roomIdT, token }) => {
    // console.log("join: " + roomIdT);
    // console.log(roomIdT + " " + token);
    const decoded = jwt.verify(token, process.env.SECRET);
    if (!usersInRoom[roomIdT]) usersInRoom[roomIdT] = [];
    usersInRoom[roomIdT].push(decoded.username);

    var orderUser = usersInRoom[roomIdT].length;
    console.log("SOCKET ON_JOIN -- OrderUser: ", usersInRoom[roomIdT].length);

    if (!clients[roomIdT]) clients[roomIdT] = [];
    clients[roomIdT].push(socket.id);

    console.log(
      "SOCKET ON_JOIN -- socket.id_2: ",
      clients[roomIdT][orderUser - 1]
    );

    // socket.broadcast.to(roomIdT).emit("message", {
    //   message: "Hello all!",
    //   username: decoded.username,
    // });

    socket.join(roomIdT);
    io.to(roomIdT).emit("Username", decoded.username);
    io.to(clients[roomIdT][orderUser - 1]).emit(
      "turnName",
      orderUser === 1 ? "X" : "O"
    );
  });

  socket.on("sendMessage", ({ roomId, message, token }) => {
    const decoded = jwt.verify(token, process.env.SECRET);
    socket.broadcast.to(roomId).emit("message", {
      message: message,
      username: decoded.username,
    });
  });

  socket.on("sendMove", ({ roomIdT, move, token, opponentTurnName }) => {
    const decoded = jwt.verify(token, process.env.SECRET);
    socket.broadcast.to(roomIdT).emit("sendMove", {
      move: move,
      username: decoded.username,
      opponentTurnName: opponentTurnName,
    });
  });

  socket.on("sendInvitation", async ({ target, token, roomId }) => {
    const decoded = jwt.verify(token, process.env.SECRET);

    const targetClient = onlineUsers.find((item) => item.username === target);

    const result = await addInvitation(
      decoded._id,
      decoded.username,
      roomId,
      target
    );

    socket.broadcast
      .to(targetClient.socketId)
      .emit("newInvitation", { sender: decoded.username, target, roomId });
  });

  //leave room
  socket.on("leaveRoom", ({ roomId, sign }) => {
    // console.log(roomId + " " + sign);
    if (sign === 3) {
      socket.to(roomId).emit("guestOut", { message: "1 Khách đã thoát!" });
      socket.leave(roomId);
      console.log("Guest out");
    }
    if (sign === 2) {
      console.log("PlayerB out");
      socket.to(roomId).emit("playerBOut", { message: "Player B đã thoát!" });
      socket.leave(roomId);
    }
    if (sign === 1) {
      console.log("Host out");
      socket.to(roomId).emit("hostOut", { message: "Chủ phòng đã thoát!" });
      socket.leave(roomId);
    }
  });
  //destroy room
});

server.listen(process.env.PORT, () => {
  console.log(`....................................`);
  console.log(`Server is listening on port: ${process.env.PORT}`);
  console.log(`.                                  .`);
  console.log(`....................................`);
});

module.exports = app;
