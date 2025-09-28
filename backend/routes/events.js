const express = require("express");
const router = express.Router();

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

router.use(ensureAuth);

router.post("/", (req, res) => {
  const { title, event_date, reminder_days } = req.body;
  if (!title || !event_date) {
    return res.status(400).json({ message: "Title and event date are required" });
  }
  const userId = req.user.id;
  const reminder = Number(reminder_days) || 0;

  req.pool.query(
    "INSERT INTO events (user_id, title, event_date, reminder_days) VALUES (?, ?, ?, ?)",
    [userId, title, event_date, reminder],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, title, event_date, reminder_days: reminder });
    }
  );
});

// Updated upcoming route to send events for today and tomorrow only
router.get("/upcoming", (req, res) => {
  const userId = req.user.id;

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().slice(0, 10);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const query = `
    SELECT id, title, event_date, reminder_days,
      DATE_SUB(event_date, INTERVAL reminder_days DAY) AS reminder_date
    FROM events
    WHERE user_id = ?
      AND (
        event_date = ? OR event_date = ?
        OR DATE_SUB(event_date, INTERVAL reminder_days DAY) = ? OR DATE_SUB(event_date, INTERVAL reminder_days DAY) = ?
      )
    ORDER BY event_date ASC
  `;

  req.pool.query(query, [userId, todayStr, tomorrowStr, todayStr, tomorrowStr], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ upcoming: results });
  });
});

module.exports = router;
