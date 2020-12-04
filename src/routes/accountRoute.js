const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { AccountValidate } = require("../validator/accountValidate");
const Account = require("../models/account");
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(200).send({ message: "Auth pages" }).end();
});

router.get("/signup", async (req, res) => {
  const findAccout = await Account.findOne({ username: "testUsername" });
  res.status(200).send({ message: "sign up pages", account: findAccout }).end();
});

router.post("/signup", AccountValidate, (req, res, next) => {
  passport.authenticate("signup", { session: false }, (err, user, info) => {
    console.log(`fire here route`);
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (info) {
      console.log(info);
      return res.status(400).json({ message: info.message });
    } else {
      const token = jwt.sign({ _id: user._id }, process.env.SECRET);
      res
        .status(200)
        .json({
          auth: true,
          accessToken: token,
          message: "Signed up successfully!",
        })
        .end();
    }
  })(req, res, next);
});
router.get("/login", (req, res) => {
  res.status(200).send(`Login page`).end();
});

router.post("/login", AccountValidate, (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (info) {
      console.log(info);
      return res.status(400).json({ message: info.message });
    } else {
      const token = jwt.sign({ _id: user._id }, process.env.SECRET);
      res
        .status(200)
        .json({
          auth: true,
          accessToken: token,
          message: "Logged in successfully!",
        })
        .end();
    }
  })(req, res, next);
});

module.exports = router;
