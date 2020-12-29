const nodemailer = require("nodemailer");
const CLIENT_API = "http://localhost:3000/";
// const CLIENT_API = "";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});
const sendMail = (to, subject, text, route, sign) => {
  const mailOptions = {
    from: process.env.GMAIL,
    to: to,
    subject: subject,
    text: text + CLIENT_API + route + "?" + sign,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return false;
    } else {
      console.log("Email sent: " + info.response);
      return true;
    }
  });
};

module.exports = {sendMail}
