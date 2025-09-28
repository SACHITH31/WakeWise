const express = require("express");
const router = express.Router();

// Passports's isAuthenticated check middleware
function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

router.use(ensureAuth);

// POST new event
router.post("/", (req, res) => {
  const { title, event_date, reminder_days } = req.body;
  if (!title || !event_date) {
    return res.status(400).json({ message: "Title and event_date are required" });
  }
  const userId = req.user.id;
  const reminder = Number(reminder_days) || 0;

  req.pool.query(
    "INSERT INTO events (user_id, title, event_date, reminder_days) VALUES (?, ?, ?, ?)",
    [userId, title, event_date, reminder],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: results.insertId, title, event_date, reminder_days: reminder });
    }
  );
});

// GET upcoming events/reminders (next 30 days)
router.get("/upcoming", (req, res) => {
  const userId = req.user.id;
  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 30);

  const todayStr = today.toISOString().slice(0, 10);
  const endDateStr = endDate.toISOString().slice(0, 10);

  const query = `
    SELECT id, title, event_date, reminder_days,
           DATE_SUB(event_date, INTERVAL reminder_days DAY) AS reminder_date
    FROM events
    WHERE user_id = ? AND
      (event_date BETWEEN ? AND ? OR DATE_SUB(event_date, INTERVAL reminder_days DAY) BETWEEN ? AND ?)
    ORDER BY event_date
  `;

  req.pool.query(query, [userId, todayStr, endDateStr, todayStr, endDateStr], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ upcoming: results });
  });
});

module.exports = router;
