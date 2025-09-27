const express = require("express");
const router = express.Router();
const pool = require("../server");

// CREATE new user
router.post("/", (req, res) => {
  const { username, email, password_hash } = req.body;
  if (!username || !email || !password_hash) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const query = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
  pool.query(query, [username, email, password_hash], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, username, email });
  });
});

// READ all users
router.get("/", (req, res) => {
  pool.query("SELECT id, username, email, created_at FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// READ single user by id
router.get("/:id", (req, res) => {
  const userId = req.params.id;
  pool.query("SELECT id, username, email, created_at FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  });
});

// UPDATE user by id
router.put("/:id", (req, res) => {
  const userId = req.params.id;
  const { username, email, password_hash } = req.body;
  const query = "UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?";
  pool.query(query, [username, email, password_hash, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully" });
  });
});

// DELETE user by id
router.delete("/:id", (req, res) => {
  const userId = req.params.id;
  pool.query("DELETE FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  });
});

module.exports = router;