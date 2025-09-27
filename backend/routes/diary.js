const express = require("express");
const router = express.Router();
const pool = require("../db");

const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};

router.use(ensureAuth);

router.get("/", (req, res) => {
  pool.query(
    "SELECT * FROM diary WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.post("/", (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content required" });
  }
  pool.query(
    "INSERT INTO diary (user_id, title, content) VALUES (?, ?, ?)",
    [req.user.id, title, content],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId, title, content });
    }
  );
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "SELECT * FROM diary WHERE id = ? AND user_id = ?",
    [id, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: "Not found" });
      res.json(results[0]);
    }
  );
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content required" });
  }
  pool.query(
    "UPDATE diary SET title = ?, content = ? WHERE id = ? AND user_id = ?",
    [title, content, id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, title, content });
    }
  );
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "DELETE FROM diary WHERE id = ? AND user_id = ?",
    [id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id });
    }
  );
});

module.exports = router;
