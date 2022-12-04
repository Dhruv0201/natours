const nodemailer = require("nodemailer")

const sendMail = async function(options){
    const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "737b1e177aa617",
          pass: "77a3a794b1d033"
        }
      });
    const mailoptions = {
        from:'Dhruv Khoradiya <mkhszdff5oraid@gmail.com>',
        to :options.email,
        subject :options.subject,
        text:options.message
    }
    await transporter.sendMail(mailoptions)
}
module.exports=sendMail;