const express = require("express");
const router = express.Router();
const pool = require("../server");

// GET all alarms for a user (assuming user_id = 1 for simplicity)
router.get("/", (req, res) => {
  const userId = 1; // Replace with authenticated user ID
  pool.query("SELECT * FROM alarms WHERE user_id = ?", [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET next alarm for user (simple example returns earliest enabled alarm)
router.get("/next", (req, res) => {
  const userId = 1; // Replace with authenticated user ID
  pool.query(
    "SELECT * FROM alarms WHERE user_id = ? AND enabled = 1 ORDER BY time ASC LIMIT 1",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.json(null);
      res.json(results[0]);
    }
  );
});

// POST create new alarm
router.post("/", (req, res) => {
  const userId = 1; // Replace with authenticated user ID
  const { time, days, message, enabled } = req.body;
  if (!time || !days) return res.status(400).json({ error: "Time and days required" });
  const query = "INSERT INTO alarms (user_id, time, days, message, enabled) VALUES (?, ?, ?, ?, ?)";
  pool.query(query, [userId, time, days, message || "", enabled ? 1 : 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, time, days, message, enabled });
  });
});

// PUT update existing alarm by id
router.put("/:id", (req, res) => {
  const alarmId = req.params.id;
  const { time, days, message, enabled } = req.body;
  const fields = [];
  const values = [];

  if (time !== undefined) {
    fields.push("time = ?");
    values.push(time);
  }
  if (days !== undefined) {
    fields.push("days = ?");
    values.push(days);
  }
  if (message !== undefined) {
    fields.push("message = ?");
    values.push(message);
  }
  if (enabled !== undefined) {
    fields.push("enabled = ?");
    values.push(enabled ? 1 : 0);
  }

  if (fields.length === 0)
    return res.status(400).json({ error: "No fields to update" });

  const query = `UPDATE alarms SET ${fields.join(", ")} WHERE id = ?`;
  values.push(alarmId);

  pool.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Alarm not found" });
    res.json({ message: "Alarm updated" });
  });
});

// DELETE alarm by id
router.delete("/:id", (req, res) => {
  const alarmId = req.params.id;
  pool.query("DELETE FROM alarms WHERE id = ?", [alarmId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Alarm not found" });
    res.json({ message: "Alarm deleted" });
  });
});

module.exports = router;
