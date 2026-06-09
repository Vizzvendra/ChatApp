
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const validator = require('validator');
const bcrypt = require("bcrypt");
const { resetPassword } = require("../mailTemplates/resetPasswordTemplate");


// create resetPasswordToken and send mail to the desired emailID
exports.resetPasswordToken = async (req, res) => {
    try {

        //get email from req body
        const email = req.body.email;

        //checking if the email is valid or not
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success:false,
                message: 'Invalid email address' 
            });
        }

        //check if user exist or not
        const user = await User.findOne({email: email});
        if(!user) {
            return res.json({success:false,
            message:'Your Email is not registered'});
        }

        //generate token and update user by adding token and expiration time
        //crypto.randomUUID() will generate random string of 36 characters
        const token  = crypto.randomUUID();
        const updatedDetails = await User.findOneAndUpdate(
                                        {email:email},
                                        {
                                            token:token,
                                            resetPasswordExpires: Date.now() + 5*60*1000,
                                        },
                                        {new:true});


        //create url and mail to the URL
        const url = `${process.env.FRONTEND_LINK}/update-password/${token}`
        await mailSender(email, 
                        "Password Reset Link",
                        resetPassword(url));

        return res.json({
            success:true,
            message:'Email sent successfully, please check email and change pwd',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong...'
        })
    }

}


// Reset the user password when he open the link
exports.resetPassword = async (req, res) => {
    try {

        const {password, confirmPassword, token} = req.body;

        if(password !== confirmPassword) {
            return res.json({
                success:false,
                message:'Password not matching',
            });
        }

        //get userdetails from db using token
        const userDetails = await User.findOne({token: token});
        
        //Invalid Token
        if(!userDetails) {
            return res.json({
                success:false,
                message:'Token is invalid',
            });
        }

        //Token Times Expires or not
        if( userDetails.resetPasswordExpires < Date.now()  ) {
            return res.json({
                success:false,
                message:'Token is expired',
            });
        }

        //encrypt the new password and update the DB
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );
        

        return res.status(200).json({
            success:true,
            message:'Password reset successful',
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong...'
        })
    }
}