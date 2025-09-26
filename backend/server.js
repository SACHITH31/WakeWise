// backend/server.js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
    connection.release();
  }
});

// Export pool for use in routes
module.exports = pool;

// Import routes
const userRoutes = require("./routes/users");
const alarmRoutes = require("./routes/alarms");
const notesRoutes = require("./routes/notes");
const todoRoutes = require("./routes/todos");

// Mount routes
app.use("/api/users", userRoutes);
app.use("/api/alarms", alarmRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/todos", todoRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.send("WakeWise Backend Running with MySQL");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
