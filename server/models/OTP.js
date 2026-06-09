const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const  otpTemplate  = require("../mailTemplates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp: {
        type:String,
        required:true,
    },
    createdAt: {
        type:Date,
        default:Date.now(),
        expires: 5*60,
    }
},{timestamps:true});


//function uses nodemailer (utils -> mailsender) to send mail
async function sendVerificationEmail(email, otp) {
    try{
        const mailResponse = await mailSender(email, "Verification Email from Sign Up Page", otpTemplate(otp));
        console.log("Email sent Successfully: ", mailResponse);
    }
    catch(error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}

// just before inserting entry into the DB, it send an OTP to the user
// send send control to the next middleware
OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
}) 



module.exports = mongoose.model("OTP", OTPSchema);

