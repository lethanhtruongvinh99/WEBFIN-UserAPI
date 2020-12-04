const bcrypt = require("bcrypt");
const BCRYPT_SALT = 10;

const passport = require("passport");
const localStategy = require("passport-local").Strategy;
const JWTStategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJWT;

const Account = require("../src/models/account");

passport.use(
  "signup",
  new localStategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        console.log(`Fire passport.js ${username}`);
        const findAccount = await Account.findOne({ username: username });
        console.log(findAccount);
        if (findAccount) {
          return done(null, false, { message: "Username is already exist" });
        } else {
          console.log(`Not exist`);
          bcrypt.hash(password, BCRYPT_SALT, (err, hash) => {
            if (err) {
              return done(err);
            }
            const newAccount = new Account();
            newAccount.username = username;
            newAccount.password = hash;

            newAccount.save((err, result) => {
              if (err) {
                console.log(err);
                return done(err);
              }
              return done(null, newAccount);
            });
          });
        }
      } catch (err) {
        console.log(err);
        return done(err);
      }
    }
  )
);
passport.use(
  "login",
  new localStategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
    },
    async (username, password, done) => {
      try {
        const findAccount = await Account.findOne({ username: username });
        console.log(findAccount);
        if (!findAccount) {
          return done(null, false, { message: "Account is not exist!" });
        } else {
          bcrypt.compare(password, findAccount.password, (err, result) => {
            console.log(result);
            if (result === true) {
              return done(null, { account: findAccount });
            } else {
              return done(null, false, {
                message: "Incorrect username or password!",
              });
            }
          });
        }
      } catch (err) {
        return done({ message: err });
      }
    }
  )
);
