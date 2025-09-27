const express = require("express");
const router = express.Router();
const passport = require("../config/passport");

router.post("/signup", (req, res, next) => {
  passport.authenticate("local-signup", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json({ message: "Signup successful", user });
    });
  })(req, res, next);
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local-login", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info.message });
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json({ message: "Login successful", user });
    });
  })(req, res, next);
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:3000");
  }
);

router.get("/github", passport.authenticate("github"));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:3000");
  }
);

router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

module.exports = router;
