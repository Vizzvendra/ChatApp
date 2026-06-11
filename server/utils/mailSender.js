// const nodemailer = require("nodemailer");
// require("dotenv").config();


// // using nodemailer to create a Transport and then sending the mail using Transport
// const mailSender = async (email, title, body) => {
//     try{
//             let transporter = nodemailer.createTransport({
//                 host:process.env.MAIL_HOST,
//                 port: process.env.MAIL_PORT,
//                 secure: false,
//                 auth:{
//                     user: process.env.MAIL_USER,
//                     pass: process.env.MAIL_PASS,
//                 }
//             })


//             let info = await transporter.sendMail({
//                 from: 'LoginNest || Vishvendra Rathore',
//                 to:`${email}`,
//                 subject: `${title}`,
//                 html: `${body}`,
//             })
//             console.log(info);
//             return info;
//     }
//     catch(error) {
//         console.log(error.message);
//     }
// }


// module.exports = mailSender;



const SibApiV3Sdk = require('@getbrevo/brevo');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    try {
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = title;
        sendSmtpEmail.htmlContent = body;
        sendSmtpEmail.sender = { name: 'LoginNest | Vishvendra Rathore', email: 'ae0e96001@smtp-brevo.com' };
        sendSmtpEmail.to = [{ email: email }];

        let info = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully:', info);
        return info;
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = mailSender;