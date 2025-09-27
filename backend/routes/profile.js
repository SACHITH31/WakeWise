const express = require("express");
const router = express.Router();
const pool = require("../server");

// Get user profile (assume auth user_id=1)
router.get("/", (req, res) => {
  const userId = 1;
  pool.query(
    `SELECT id, username, email, full_name, bio, avatar_url, phone, location, website 
     FROM users WHERE id = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: "User not found" });
      res.json(results[0]);
    }
  );
});

// Update user profile
router.put("/", (req, res) => {
  const userId = 1;
  const { full_name, bio, avatar_url, phone, location, website } = req.body;
  const query = `
    UPDATE users SET full_name = ?, bio = ?, avatar_url = ?, phone = ?, location = ?, website = ?
    WHERE id = ?`;
  const params = [full_name, bio, avatar_url, phone, location, website, userId];
  pool.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Profile updated" });
  });
});

module.exports = router;
