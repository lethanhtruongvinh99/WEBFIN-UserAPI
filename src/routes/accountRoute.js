const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { AccountValidate } = require("../validator/accountValidate");
const Account = require("../models/account");
const nodemailer = require("nodemailer");
const {
  activateAccount,
  findAccountByUsername,
  changeAccountPassword,
  getTopPlayer,
  getInvitations,
} = require("../controllers/accounts.controller");
const { getHitoryRoom } = require("../controllers/rooms.controller");
const router = express.Router();

// const CLIENT_API = "http://localhost:3000/verify";
// const CLIENT_API1 = "http://localhost:3000/recovery";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "finwebadv@gmail.com",
    pass: "FINWEBADV2020",
  },
});

router.get("/profile", async (req, res) =>
{
  passport.authorize("jwt", { session: false }, async (err, user, info) =>
  {
    if (err)
    {
      return res.status(400).json({ message: err.message });
    }
    if (info)
    {
      console.log(info);
      return res.status(400).json({ message: info.message });
    } else
    {
      const findAccount = await findAccountByUsername(user.username);
      if (findAccount.status)
      {
        return res.status(200).json({ account: findAccount.account });
      } else
      {
        return res.status(400).json({ message: "User not found." });
      }
    }
  })(req, res);
});

router.get("/history", async (req, res) =>
{
  passport.authorize("jwt", { session: false }, async (err, user, info) =>
  {
    if (err)
    {
      return res.status(400).json({ message: err.message });
    }
    if (info)
    {
      console.log(info);
      return res.status(400).json({ message: info.message });
    } else
    {
      const listGames = await getHitoryRoom(user._id);
      if (listGames.status)
      {
        return res.status(200).json({ auth: true, data: listGames.data });
      } else
      {
        return res.status(400).json({ auth: false, data: listGames.data });
      }
    }
  })(req, res);
});

router.get("/rankchart", async (req, res) =>
{
  passport.authorize("jwt", { session: false }, async (err, user, info) =>
  {
    if (err)
    {
      return res.status(400).json({ message: err.message });
    }
    if (info)
    {
      console.log(info);
      return res.status(400).json({ message: info.message });
    } else
    {
      const topPlayer = await getTopPlayer();
      if (topPlayer.status)
      {
        return res.json({ rankchart: topPlayer.result.slice(0, 5) });
      } else
      {
        return res.json({ message: "err" });
      }
    }
  })(req, res);
});

router.post("/signup", AccountValidate, (req, res, next) =>
{
  passport.authenticate("signup", { session: false }, (err, user, info) =>
  {
    if (err)
    {
      return res.status(400).json({ message: err.message });
    }
    if (info)
    {
      console.log(info);
      return res.status(400).json({ message: info.message });
    } else
    {
      // console.log(user);
      const token = jwt.sign(
        { _id: user._id, username: user.username },
        process.env.SECRET
      );
      const mailOptions = {
        from: "finwebadv@gmail.com",
        to: user.email,
        subject: "Verify your account",
        text: `Click to verify ${process.env.CLIENT}` + "/verify" + `?${token}`,
      };
      transporter.sendMail(mailOptions, function (error, info)
      {
        if (error)
        {
          console.log(error);
          return res.json({ auth: false, message: "Error" });
        } else
        {
          console.log("Email sent: " + info.response);
          return res
            .status(200)
            .json({
              auth: true,
              accessToken: token,
              message:
                "Signed up successfully! Check your e-mail and Activate your account!",
            })
            .end();
        }
      });
    }
  })(req, res, next);
});

router.post("/login", AccountValidate, (req, res, next) =>
{
  passport.authenticate("login", { session: false }, (err, user, info) =>
  {
    if (err)
    {
      return res.status(400).json({ message: err.message });
    }
    if (info)
    {
      console.log(info);
      return res.status(400).json({ message: info.message });
    } else
    {
      // console.log(user);
      const token = jwt.sign(
        { _id: user._id, username: user.username },
        process.env.SECRET
      );
      res
        .status(200)
        .json({
          auth: true,
          accessToken: token,
          username: user.username,
          message: "Logged in successfully!",
        })
        .end();
    }
  })(req, res, next);
});

router.post("/verify", async (req, res) =>
{
  const data = jwt.verify(req.body.token, process.env.SECRET);
  try
  {
    const result = await activateAccount(data.username);
    if (result)
    {
      return res.json({ auth: true, message: "Verified" });
    } else
    {
      return res.json({ auth: false, message: "Failed to Verify" });
    }
  } catch (err)
  {
    return res.json({ message: "Error" });
  }
});

router.post("/recoveryrequest", async (req, res) =>
{
  const username = req.body.username;
  const findAccount = await findAccountByUsername(username);
  if (findAccount.status)
  {
    const hashUsername = jwt.sign({ username: username }, process.env.SECRET);
    const mailOptions = {
      from: "finwebadv@gmail.com",
      to: findAccount.account.email,
      subject: "Recovery Password for Account " + findAccount.account.username,
      text:
        `Click to recovery your password: ${process.env.CLIENT}` +
        "/recovery" +
        `?${hashUsername}`,
    };
    transporter.sendMail(mailOptions, function (error, info)
    {
      if (error)
      {
        console.log(error);
        return res.json({ auth: false, message: "Error" });
      } else
      {
        console.log("Email sent: " + info.response);
        return res
          .status(200)
          .json({
            auth: true,
            message: "Check your e-mail to recovery password!",
          })
          .end();
      }
    });
  } else
  {
    return res.json({ message: "Username is not exist!" });
  }
});

router.post("/recovery", async (req, res) =>
{
  const password = req.body.password;
  const data = jwt.verify(req.body.hashUsername, process.env.SECRET);
  console.log(data.username);
  const result = await changeAccountPassword(data.username, password);
  if (result)
  {
    return res.json({ auth: true, message: "Successfully!" });
  } else
  {
    return res.json({ auth: false, message: "Error" });
  }
});

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "user_birthday", "user_gender"],
  })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook"),
  (req, res) =>
  {
    const token = req.user.accessToken;
    res.redirect(process.env.CLIENT + "/auth/" + token + "/" + req.user.username);
  }
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/callback", passport.authenticate("google"), (req, res) =>
{
  console.log(req.user);
  const token = req.user.accessToken;
  res.redirect(process.env.CLIENT + "/auth/" + token + "/" + req.user.username);
});

router.post('/invitations', (req, res) =>
{
  passport.authenticate('jwt', { session: false }, async (err, user, info) =>
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
      const result = await getInvitations(user._id);
      console.log(result);
      if (result.status)
      {
        res.status(200).json(result);
      }
      else
      {
        res.status(400).json({ message: 'Error' });
      }
    }
  })(req, res);
})

module.exports = router;
