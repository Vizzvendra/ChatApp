const express = require("express")
const router = express.Router()
const passport = require('passport');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

router.get('/',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  
  // Google Callback Route
router.get('/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_LINK}/login` }),
    async (req, res) => {
        // Generate JWT Token for the user
        let user= await req.user.populate("additionalDetails");
        const payload = {
            email: user.email,
            id: user._id,
            accountType:user.accountType,
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        user = user.toObject(); 
        user.token = token;
        user.password= undefined;

        // const options = {
        //     expires: new Date(Date.now() + 3*24*60*60*1000),
        //     httpOnly:false,
        //     secure: true, // Use true in production with HTTPS
        //     sameSite: 'None', // Allows cookies to be sent across subdomains
        // }
        // res.cookie("user", JSON.stringify(user), options); // Non-httpOnly for client-side access
       

        // Redirect to the dashboard
        // At end of the callback
        const encodedUser = encodeURIComponent(JSON.stringify(user));
        res.redirect(`${process.env.FRONTEND_LINK}/google-auth?token=${encodedUser}`);
    }
);



module.exports = router