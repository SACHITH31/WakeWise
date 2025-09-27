const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const bcrypt = require("bcrypt");
const pool = require("../db");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  pool.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

passport.use(
  "local-signup",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password", passReqToCallback: true },
    (req, email, password, done) => {
      pool.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return done(err);
        if (results.length > 0) return done(null, false, { message: "Email already in use" });
        try {
          const hashedPassword = await bcrypt.hash(password, 12);
          const username = req.body.username || email;
          pool.query(
            "INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
            [username, email, hashedPassword],
            (err2, result) => {
              if (err2) return done(err2);
              done(null, { id: result.insertId, username, email });
            }
          );
        } catch (hashErr) {
          done(hashErr);
        }
      });
    }
  )
);

passport.use(
  "local-login",
  new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {
    pool.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) return done(err);
      if (results.length === 0) return done(null, false, { message: "Invalid email or password" });
      const user = results[0];
      try {
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return done(null, false, { message: "Invalid email or password" });
        done(null, user);
      } catch (compareErr) {
        done(compareErr);
      }
    });
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      pool.query("SELECT * FROM users WHERE google_id = ?", [profile.id], (err, results) => {
        if (err) return done(err);
        if (results.length > 0) return done(null, results[0]);
        const userData = [
          profile.id,
          profile.displayName || profile.username || "no-name",
          profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
          profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          new Date(),
          new Date(),
        ];
        pool.query(
          "INSERT INTO users (google_id, username, email, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
          userData,
          (err2, result) => {
            if (err2) return done(err2);
            done(null, { id: result.insertId, username: userData[1] });
          }
        );
      });
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/github/callback",
      scope: ["user:email"],
    },
    (accessToken, refreshToken, profile, done) => {
      pool.query("SELECT * FROM users WHERE github_id = ?", [profile.id], (err, results) => {
        if (err) return done(err);
        if (results.length > 0) return done(null, results[0]);
        const userData = [
          profile.id,
          profile.username || "no-name",
          profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
          profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          new Date(),
          new Date(),
        ];
        pool.query(
          "INSERT INTO users (github_id, username, email, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
          userData,
          (err2, result) => {
            if (err2) return done(err2);
            done(null, { id: result.insertId, username: userData[1] });
          }
        );
      });
    }
  )
);

module.exports = passport;
