// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const pool = require("../db");

// Utility to generate username
function generateUsername(email, displayName, fallback) {
  if (email) return email.split("@")[0];
  if (displayName) return displayName.toLowerCase().replace(/\s+/g, "");
  return "user" + fallback;
}

// COMMON function to handle login or signup for OAuth users
function findOrCreateUser(provider, profile, done) {
  const providerIdField = provider + "_id"; // e.g., google_id or github_id
  const providerId = profile.id;
  const email = (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : null;
  const displayName = profile.displayName || profile.username || email || "User";
  const avatarUrl = profile.photos && profile.photos[0] && profile.photos[0].value;

  if (!email) {
    return done(new Error(`${provider} profile has no public email. Please make your email public or use another login method.`));
  }

  // First, check if a user already exists with this email (any provider)
  pool.query("SELECT * FROM users WHERE email = ?", [email], (err, usersByEmail) => {
    if (err) return done(err);

    if (usersByEmail.length > 0) {
      // User exists - check if provider ID is linked
      const user = usersByEmail[0];
      if (!user[providerIdField]) {
        // Link provider ID to existing user
        pool.query(`UPDATE users SET ${providerIdField} = ? WHERE id = ?`, [providerId, user.id], (err) => {
          if (err) return done(err);
          user[providerIdField] = providerId;
          done(null, user);
        });
      } else {
        // Provider ID already linked, login directly
        done(null, user);
      }
    } else {
      // No user with this email, create new
      const username = generateUsername(email, displayName, providerId);
      const newUser = {
        email,
        full_name: displayName,
        avatar_url: avatarUrl,
        username,
        bio: null,
        phone: null,
        location: null,
        website: null,
        google_id: null,
        github_id: null,
      };
      newUser[providerIdField] = providerId;

      pool.query("INSERT INTO users SET ?", newUser, (err, res) => {
        if (err) return done(err);
        newUser.id = res.insertId;
        done(null, newUser);
      });
    }
  });
}

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
  findOrCreateUser("google", profile, done);
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/github/callback",
  scope: ['user:email'],
}, (accessToken, refreshToken, profile, done) => {
  findOrCreateUser("github", profile, done);
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  pool.query(
    `SELECT id, username, email, full_name, bio, avatar_url, phone, location, website, google_id, github_id 
     FROM users WHERE id = ?`, [id],
    (err, results) => {
      if (err) return done(err);
      console.log("Deserialized user:", results[0]);
      done(null, results[0]);
    }
  );
});

module.exports = passport;
