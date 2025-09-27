// routes/auth.js
const express = require("express");
const router = express.Router();
const passport = require("passport");

// Start Google OAuth login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
router.get("/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
    successRedirect: "/auth/success"
  })
);

// Returns logged in user data or 401 if not logged in
router.get("/user", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
});

// On successful login, redirect frontend to home page
router.get("/success", (req, res) => {
  res.redirect("http://localhost:3000/home");
});

// On login failure, send error
router.get("/failure", (req, res) => {
  res.status(401).send("Authentication failed");
});

module.exports = router;
