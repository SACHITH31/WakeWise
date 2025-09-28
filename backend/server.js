require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch");


const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const alarmsRoutes = require("./routes/alarms");
const diaryRoutes = require("./routes/diary");
const todosRoutes = require("./routes/todos");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS for frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(cookieParser());
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


app.use((req, res, next) => {
  req.pool = require("./db"); // Adjust path to your db
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/alarms", alarmsRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/todos", todosRoutes);

// Root route redirects to frontend


app.get("/", (req, res) => {
  if(req.isAuthenticated && req.isAuthenticated()) {
    res.redirect("http://localhost:3000/home");
  } else {
    res.redirect("http://localhost:3000/login");
  }
});

app.get("/api/quote", async (req, res) => {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch quote from external API" });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching quote: ", error);
    res.status(500).json({ error: "Internal Server Error fetching quote" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
