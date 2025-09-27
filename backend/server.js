require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");

const authRoutes = require("./routes/auth");
const alarmsRoutes = require("./routes/alarms");
const diaryRoutes = require("./routes/diary");
const eventRoutes = require("./routes/events");
const todosRoutes = require("./routes/todos");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS for frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api/alarms", alarmsRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/todos", todosRoutes);

// Root route redirects to frontend
app.get("/", (req, res) => {
  if(req.isAuthenticated && req.isAuthenticated()) {
    res.redirect("http://localhost:3000/home");
  } else {
    res.redirect("http://localhost:3000/login");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
