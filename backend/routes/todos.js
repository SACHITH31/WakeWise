const express = require("express");
const router = express.Router();
const pool = require("../db");

// Middleware to ensure authentication
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};

router.use(ensureAuth);

router.get("/", (req, res) => {
  pool.query("SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { task, completed } = req.body;
  if (!task || typeof task !== "string") {
    return res.status(400).json({ error: "Task is required and must be a string" });
  }
  pool.query(
    "INSERT INTO todos (user_id, task, completed) VALUES (?, ?, ?)",
    [req.user.id, task, completed ? 1 : 0],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, task, completed: !!completed });
    }
  );
});

router.put("/:id", (req, res) => {
  const { task, completed } = req.body;
  const id = req.params.id;
  if (!task || typeof task !== "string") {
    return res.status(400).json({ error: "Task is required and must be a string" });
  }
  pool.query(
    "UPDATE todos SET task = ?, completed = ? WHERE id = ? AND user_id = ?",
    [task, completed ? 1 : 0, id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, task, completed: !!completed });
    }
  );
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  pool.query("DELETE FROM todos WHERE id = ? AND user_id = ?", [id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id });
  });
});

module.exports = router;
