const express = require("express")
const router = express.Router()

// Importing controllers and middleware functions
const { login, signup, sendotp, changePassword,allUsers } = require("../controllers/Auth");
const { resetPasswordToken, resetPassword } = require("../controllers/ResetPassword")
const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication
router.get("/",auth, allUsers)
router.post("/login", login)
router.post("/signup", signup)
router.post("/sendotp", sendotp)
router.post("/changepassword", auth, changePassword)

// Route for generating a reset password token
// Route for resetting user's password after verification
router.post("/reset-password-token", resetPasswordToken)
router.post("/reset-password", resetPassword)

module.exports = router