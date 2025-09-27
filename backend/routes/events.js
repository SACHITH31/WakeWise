const express = require("express");
const router = express.Router();
const pool = require("../db"); // your MySQL connection

// Middleware to protect routes (ensure user is logged in)
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

router.use(ensureAuth);

// Get all events for logged-in user
router.get("/", (req, res) => {
  pool.query("SELECT * FROM events WHERE user_id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ events: results });
  });
});

// Add new event (title and date required)
router.post("/", (req, res) => {
  const { title, date } = req.body;
  if (!title || !date) {
    console.log("Missing title or date in request body", req.body);
    return res.status(400).json({ message: "Title and date are required" });
  }

  pool.query(
    "INSERT INTO events (user_id, title, date) VALUES (?, ?, ?)",
    [req.user.id, title, date],
    (err, result) => {
      if (err) {
        console.error("Error inserting event:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: result.insertId, user_id: req.user.id, title, date });
    }
  );
});


module.exports = router;
