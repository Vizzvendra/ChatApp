const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//Update User Profile
exports.updateProfile = async (req, res) => {
    try{
        
        const {
            firstName = "",
            lastName = "",
            dateOfBirth = "",
            about = "",
            contactNumber = "",
            gender = "",
        } = req.body
        const id = req.user.id;

        //finding Profile and update the values in it
        const userDetails = await User.findById(id);
        const profileDetails = await Profile.findById(userDetails.additionalDetails);

        const user = await User.findByIdAndUpdate(id, {
            firstName,
            lastName,
        })
        await user.save();

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        // Find the updated user details
        const updatedUserDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()
        
        return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully',
            updatedUserDetails,
        });

    }
    catch(error) {
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
};  



//Delete Account
exports.deleteAccount = async (req, res) => {
    try{
        const id = req.user.id;
        
        const userDetails = await User.findById(id);
        // console.log(userDetails)
        if(!userDetails) {
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        } 

        //delete profile and user
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        await User.findByIdAndDelete({_id:userDetails.id});
       
        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User cannot be deleted successfully',
        });
    }
};

//Give all the details of the User
exports.getAllUserDetails = async (req, res) => {
    try {
        const id = req.user.id;
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        
        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            data: userDetails
        });
       
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;
        

        const image = await uploadImageToCloudinary(
            displayPicture, process.env.FOLDER_NAME,
            1000, 1000
        )
        // console.log(image)

        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
        await updatedProfile.save();
        // updatedProfile=updatedProfile.populate("additionalDetails").exec()

        const updatedUserDetails = await User.findById(userId).populate("additionalDetails").exec()


        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedUserDetails,
        })
    } catch (error) {
        return res.status(500).json({
        success: false,
        message: error.message,
        })
    }
};