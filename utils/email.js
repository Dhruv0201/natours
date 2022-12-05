const nodemailer = require("nodemailer")
const pug = require('pug')
const htmlToText = require("html-to-text")

module.exports = class Email {
  constructor(user,url){
    this.to = user.email,
    this.from = 'Dhruv Khoradiya <mkhszdff5oraid@gmail.com>',
    this.url = url,
    this.firstName = user.name.split(' ')[0]

  }
  newTrasport(){
    if(process.env.NODE_ENV == "production"){
      return 1;
    }
    return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "737b1e177aa617",
        pass: "77a3a794b1d033"
      }
    });
  }
  async send(tamplate,subject){

    const html = pug.renderFile(`${__dirname}/../views/email/${tamplate}.pug`,{
      firstName:this.firstName,
      url:this.url,
      subject
    })


    const mailoptions = {
      from:this.from,
      to :this.to,
      subject ,
      html,
      // text: htmlToText.fromString(html)

  };
  await this.newTrasport().sendMail(mailoptions)
};
async sendWelcome() {
  await this.send('Welcome',"Welcome To Natours Family");
};
async sendresetPassword(){
  await this.send('resetPassword',"Reset Your Password")
}
}


