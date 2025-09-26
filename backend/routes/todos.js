const express = require("express");
const router = express.Router();

// Test route: GET /api/todos/
router.get("/", (req, res) => {
  res.send("ToDos route is working");
});

module.exports = router;
