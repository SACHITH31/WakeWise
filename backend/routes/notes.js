const express = require("express");
const router = express.Router();

// Test route: GET /api/notes/
router.get("/", (req, res) => {
  res.send("Notes route is working");
});

module.exports = router;
