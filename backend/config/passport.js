// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("../db");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
  const googleId = profile.id;
  const email = profile.emails[0].value;

  pool.query("SELECT * FROM users WHERE google_id = ?", [googleId], (err, results) => {
    if (err) return done(err);
    if (results.length) return done(null, results[0]);

    const newUser = {
      google_id: googleId,
      email,
      display_name: profile.displayName || email,
    };

    pool.query("INSERT INTO users SET ?", newUser, (err, res) => {
      if (err) return done(err);
      newUser.id = res.insertId;
      return done(null, newUser);
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  pool.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

module.exports = passport;
