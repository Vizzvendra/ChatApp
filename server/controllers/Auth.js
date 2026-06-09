const User = require("../models/User");
const Profile = require("../models/Profile");
const OTP = require("../models/OTP");
const mailSender = require("../utils/mailSender");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require('validator');
const { passwordUpdated } = require("../mailTemplates/passwordUpdate");
require("dotenv").config();



//sendOTP
exports.sendotp = async (req, res) =>  {

    try {
        //fetch email from request body
        const {email} = req.body;

        //uses validator to check whether email is valid or not
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success:false,
                message: `Invalid email address`
            });
        }

        //ensure that user don't exist already
        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent) {
            return res.status(401).json({
                success:false,
                message:`User already registered`
            })
        }


        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });


        //create an entry for OTP in DB
        const otpBody = await OTP.create({email, otp});

        //return response successful
        res.status(200).json({
            success:true,
            message:`OTP Sent Successfully`,
            otp,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }


};

//search User
exports.allUsers = async (req, res) => {
    try{
        const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
            }
        : {};
        const users = await User.find(keyword).find({ _id: { $ne: req.user.id } });
        res.send(users);
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User Not Found",
        })
    }
}


//signUp
exports.signup = async (req, res) => {
    try {

        //taking data from request body
        const {
            firstName,
            lastName, 
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber, 
            otp
        } = req.body;

        // ensuring everything is inserted by the user
        if(!firstName || !lastName || !email || !password || !confirmPassword
            || !otp) {
                return res.status(403).json({
                    success:false,
                    message:"All fields are required",
                })
        }


        //matching password and confirm passwords
        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:'Password and Confirm-Password does not match',
            });
        }

        //checking if the email is valid or not
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success:false,
                message: 'Invalid email address' 
            });
        }

        //checking if user already exist 
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            });
        }

        //find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        // console.log(recentOtp);

        //OTP not found
        if(recentOtp.length == 0) {
            return res.status(400).json({
                success:false,
                message:'OTP Not Found',
            })
        } 
        // Invalid OTP entered
        else if(otp !== recentOtp[0].otp) { 
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }


        //creating a hashed and secured password
        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about:null,
            contactNumer:null,
        });

        //Storing the hased(encrypted) password
        //Storing the id of Profile Detials created above here 
        //Using Dicebear Api that will generate initials using firstname and lastname
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })

        //return res
        return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user,
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registrered. Please try again",
        })
    }

}

//Login
exports.login = async (req, res) => {
    try {
        //get data from req body
        const {email, password} = req.body;

        // ensure both email and passoword is present
        if(!email || !password) {
            return res.status(403). json({
                success:false,
                message:'All fields are required',
            });
        }

        //checking whether email is valid or not
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success:false,
                message: 'Invalid email address' 
            });
        }

        //check user exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registrered",
            });
        }
        
        if(!user.password && user.googleId){
            return res.status(401).json({
                success:false,
                message:"Use Google For Login",
            });
        }

        //If password matches then create JWT
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            });

            // storing token  inside the document fetches from database
            // deleting the passoword from it
            user.token = token;
            user.password= undefined;

            //create cookie and stores token in it for 3 days
            //send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
            })

        }
        else {
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }
        
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
        });
    }
};


// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		const userDetails = await User.findById(req.user.id);
		// const { oldPassword, newPassword ,confirmNewPassword} = req.body;
		const { oldPassword, newPassword } = req.body;

        if(!userDetails.password  && userDetails.googleId){
            if(oldPassword!=="1234"){
                return res.status(401).json({
                    success: false, message: "Use 1234 as current password" 
                });
            }
        }
        else{
            // Validate old password
            const isPasswordMatch = await bcrypt.compare(oldPassword,userDetails.password);
            if (!isPasswordMatch) {
                return res.status(401).json({
                    success: false, message: "Current password is incorrect" 
                });
            }
        }
		


		// create new encrypted Password and update it
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email that password updated successfully
		try {
			const emailResponse = await mailSender(updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`, 
                passwordUpdated(
					updatedUserDetails.email,
					`${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			// console.log("Email sent successfully:", emailResponse.response);
		}
        catch (error) {
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		return res.status(200).json({ success: true, message: "Password updated successfully" });

	} catch (error) {

		// console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};