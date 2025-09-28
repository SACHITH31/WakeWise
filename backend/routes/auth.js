const express = require("express");
const passport = require("passport");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");


// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000/login" }),
  (req, res) => res.redirect("http://localhost:3000/home")
);

// GitHub OAuth routes
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/github/callback",
  passport.authenticate("github", { failureRedirect: "http://localhost:3000/login" }),
  (req, res) => res.redirect("http://localhost:3000/home")
);

// Current logged in user info endpoint
router.get("/user", (req, res) => {
  if (!req.user) 
    return res.json({ success: false, user: null });

  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      display_name: req.user.full_name,
      email: req.user.email,
      avatar_url: req.user.avatar_url,
      bio: req.user.bio,
      phone: req.user.phone,
      location: req.user.location,
      website: req.user.website,
      provider: req.user.google_id ? "google" : (req.user.github_id ? "github" : "local"),
    }
  });
});


router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if email already exists
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    // Return the new user info (excluding password)
    res.status(201).json({
      user: {
        id: result[0].insertId,
        username,
        email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
});

module.exports = router;
