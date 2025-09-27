const express = require("express");
const router = express.Router();
const pool = require("../server");

// Get all notes for a user (Assuming user_id = 1 for now)
router.get("/", (req, res) => {
  const userId = 1; // Substitute proper auth user id here
  pool.query("SELECT * FROM notes WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get note by id
router.get("/:id", (req, res) => {
  const noteId = req.params.id;
  pool.query("SELECT * FROM notes WHERE id = ?", [noteId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Note not found" });
    res.json(results[0]);
  });
});

// Create new note
router.post("/", (req, res) => {
  const userId = 1; // Substitute proper auth user id
  const { title, content } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const query = "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)";
  pool.query(query, [userId, title, content || ""], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, title, content });
  });
});

// Update note by id
router.put("/:id", (req, res) => {
  const noteId = req.params.id;
  const { title, content } = req.body;
  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push("title = ?");
    values.push(title);
  }
  if (content !== undefined) {
    updates.push("content = ?");
    values.push(content);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(noteId);
  const query = `UPDATE notes SET ${updates.join(", ")} WHERE id = ?`;

  pool.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note updated" });
  });
});

// Delete note by id
router.delete("/:id", (req, res) => {
  const noteId = req.params.id;
  pool.query("DELETE FROM notes WHERE id = ?", [noteId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted" });
  });
});

module.exports = router;