const nodemailer = require('nodemailer');

module.exports = async function (options) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOption = {
      from: 'Nishant Maurya <contact@nmnishant.com>',
      to: options.email,
      subject: options.subject,
      text: options.text,
    };

    return await transporter.sendMail(mailOption);
  } catch (err) {
    return 0;
  }
};
