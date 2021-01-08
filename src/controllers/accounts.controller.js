const Account = require("../models/account");
const bcrypt = require("bcrypt");
const BCRYPT_SALT = 10;
const findAccountByUsername = async (username) => {
  try {
    const account = await Account.findOne({ username: username });
    // console.log(account);
    if (account) {
      //   console.log("have");
      return { status: true, account: account };
    } else {
      return { status: false, account: null };
    }
  } catch (err) {
    return err;
  }
};

const findAccountById = async (id) => {
  try {
    const account = await Account.findOne({ _id: id });
    if (account) {
      return { status: true, account: account };
    } else {
      return { status: false, account: null };
    }
  } catch (err) {
    return err;
  }
};
const activateAccount = async (username) => {
  const account = await Account.findOne({ username: username });
  if (account) {
    if (account.isActivate) {
      return true;
    } else {
      account.isActivate = true;
      await Account.findOneAndUpdate({ username: username }, account);
      return true;
    }
  } else {
    return false;
  }
};

const changeAccountPassword = async (username, newPassword) => {
  const account = await Account.findOne({ username: username });
  if (account) {
    const newPass = await bcrypt.hash(newPassword, BCRYPT_SALT);
    account.password = newPass;
    await Account.findOneAndUpdate({ username: username }, account);
    return true;
  } else {
    return false;
  }
};

const getTopPlayer = async () => {
  try {
    const result = await Account.find().sort({ score: -1 });
    return { status: true, result: result };
  } catch (err) {
    return err;
  }
};

const addInvitation = async (id, senderUsername, roomId, targetUsername) => {
  try {
    let targetUser = await Account.find({ username: targetUsername });
    targetUser.invitations.push({ id: id, username: senderUsername, roomId });
    const result = await Account.findOneAndUpdate(
      { username: targetUsername },
      targetUser
    );
    if (result) {
      return { status: true, data: result };
    } else {
      return { status: false, data: "err" };
    }
  } catch (err) {
    return { status: false, data: err };
  }
};

const removeInvitation = async (id, senderUsername, roomId, targetUsername) => {
  try {
    let targetUser = await Account.find({ username: targetUsername });
    const findIndex = targetUser.invitations.find((item) => item.id === id);
    targetUser.invitations = [
      ...targetUser.invitations.splice(targetUser.invitations(findIndex, 1)),
    ];
    targetUser.invitations.push({ id: id, username: senderUsername, roomId });
    const result = await Account.findOneAndUpdate(
      { username: targetUsername },
      targetUser
    );
    if (result) {
      return { status: true, data: result };
    } else {
      return { status: false, data: "err" };
    }
  } catch (err) {
    return { status: false, data: err };
  }
};
module.exports = {
  findAccountByUsername,
  activateAccount,
  changeAccountPassword,
  findAccountById,
  getTopPlayer,
  addInvitation,
  removeInvitation,
};
