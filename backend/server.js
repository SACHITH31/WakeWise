require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport"); // Make sure configured correctly
const authRoutes = require("./routes/auth");
const diaryRoutes = require("./routes/diary");
const alarmsRoutes = require("./routes/alarms");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and accept credentials for frontend at localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_key_here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Mount routes AFTER session and passport middlewares
app.use("/auth", authRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/alarms", alarmsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
