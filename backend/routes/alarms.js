const express = require("express");
const router = express.Router();
const pool = require("../db");

const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
};

router.use(ensureAuth);

router.get("/", (req, res) => {
  pool.query("SELECT * FROM alarms WHERE user_id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { time, days, message, sound, enabled } = req.body;
  pool.query(
    "INSERT INTO alarms (user_id, time, days, message, sound, enabled) VALUES (?, ?, ?, ?, ?, ?)",
    [req.user.id, time, days || "Everyday", message || "", sound || "", enabled !== undefined ? enabled : 1],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, time, days: days || "Everyday", message: message || "", sound: sound || "", enabled: enabled !== undefined ? enabled : 1 });
    }
  );
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  const { time, days, message, sound, enabled } = req.body;
  pool.query(
    "UPDATE alarms SET time = ?, days = ?, message = ?, sound = ?, enabled = ? WHERE id = ? AND user_id = ?",
    [time, days, message, sound, enabled, id, req.user.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ id, time, days, message, sound, enabled });
    }
  );
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  pool.query("DELETE FROM alarms WHERE id = ? AND user_id = ?", [id, req.user.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ id });
  });
});

module.exports = router;
