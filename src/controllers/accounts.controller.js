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

//Get all invitations of a user
const getInvitations = async (_id) => {
  try {
    let targetUser = await Account.findOne({ _id: _id });

    if (targetUser) {
      return { status: true, data: targetUser.invitations };
    } else {
      return { status: false, data: "err" };
    }
  } catch (err) {
    return { status: false, data: err };
  }
};

const addInvitation = async (id, senderUsername, roomId, targetUsername) => {
  try {
    let targetUser = await Account.findOne({ username: targetUsername });

    if (targetUser.invitations) {
      targetUser.invitations.push({ id: id, username: senderUsername, roomId });
    } else {
      targetUser.invitations = [{ id: id, username: senderUsername, roomId }];
    }

    const result = await Account.findOneAndUpdate({ username: targetUsername }, { $set: { invitations: targetUser.invitations } }, { useFindAndModify: false });

    if (result) {
      return { status: true, data: result };
    } else {
      return { status: false, data: "err" };
    }
  } catch (err) {
    return { status: false, data: err };
  }
};

const removeInvitation = async (roomId, targetUsername) => {
  try {
    let targetUser = await Account.findOne({ username: targetUsername });

    const updatedInvitations = targetUser.invitations.filter((item) => item.roomId !== roomId);

    const result = await Account.findOneAndUpdate({ username: targetUsername }, { $set: { invitations: updatedInvitations } });
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
  getInvitations,
};
