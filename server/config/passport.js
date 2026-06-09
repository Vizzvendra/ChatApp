const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User'); 
const dotenv = require("dotenv");
const Profile = require('../models/Profile');
dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_LINK}/api/v1/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // Check if a user exists with the same email
            const existingUser = await User.findOne({ email: profile.emails[0].value });

            if (existingUser) {
                // Link the Google account to the existing user
                existingUser.googleId = Profile.id;
                await existingUser.save();
                user = existingUser;
            } else {
                // Create a new user

                const profileDetails = await Profile.create({
                            gender:null,
                            dateOfBirth: null,
                            about:null,
                            contactNumer:null,
                        });

                        console.log("see here:---");
                        console.log(profile);

                const lname=profile.name?.familyName || "",
                // need to handle password
                user = await User.create({
                    firstName: profile.name.givenName,
                    lastName: profile.name?.familyName || ".",
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    accountType: 'Student', // Default account type
                    additionalDetails:profileDetails._id,
                    image: `https://api.dicebear.com/5.x/initials/svg?seed=${profile.name.givenName} ${lname}`,
                });
            }
        }


      // Pass the user to Passport
      return done(null, user);
    } catch (error) {
        console.log(error);
      return done(error, null);
    }
  }
));

// Serialize and Deserialize User
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
