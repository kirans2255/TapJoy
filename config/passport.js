const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserData = require('../models/userDataModel');

module.exports = function (passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async function (accessToken, refreshToken, profile, done) {
    let user = await UserData.findOne({ email: profile.emails[0].value });

    if (!user) {
      user = new UserData({
        name: profile.displayName,
        email: profile.emails[0].value,
      });

      await user.save();
    }

    return done(null, user);
  }));


  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    UserData.findById(id)
      .exec()
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  });
};
