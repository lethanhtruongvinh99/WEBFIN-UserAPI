const Account = require("../models/account");

const findAccountByUsername = async (username) => {
  try {
    const account = await Account.findOne({ username: username });
    // console.log(account);
    if (account) {
    //   console.log("have");
      return { status: true, account: account };
    } else {
      return { status: true, account: null };
    }
  } catch (err) {
    return err;
  }
};
module.exports = { findAccountByUsername };
