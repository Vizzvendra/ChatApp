const jwt = require("jsonwebtoken");
require("dotenv").config();

//verifying user by cheking its JWT
exports.auth = async (req, res, next) => {
    try{
        //extract token
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorization").replace("Bearer ", "");
        // console.log(token);

        //checking if token is missing
        if(!token) {
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }

        //verifing the token
        try{
            const decodedPayload =  jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = decodedPayload;
            if (req.user && req.user.id) {
                req.user._id = req.user.id; // Add _id for consistency
            }
        }
        catch(err) {
            //verification - issue
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        next();
    }
    catch(error) {  
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
        });
    }
}

