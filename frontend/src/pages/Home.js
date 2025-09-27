import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUser, FaTasks, FaBell, FaBook, FaStickyNote } from "react-icons/fa";
import "../styles/Home.css";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [nextAlarm, setNextAlarm] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/alarms", { credentials: "include" })
      .then((res) => res.json())
      .then((alarms) => {
        const now = new Date();
        const upcoming = alarms
          .map((alarm) => ({ ...alarm, timeObj: new Date(`1970-01-01T${alarm.time}`) }))
          .filter((alarm) => alarm.timeObj > now)
          .sort((a, b) => a.timeObj - b.timeObj);
        setNextAlarm(upcoming[0] || null);
      })
      .catch(() => setNextAlarm(null));

    fetch("http://localhost:5000/api/todos", { credentials: "include" })
      .then((res) => res.json())
      .then((todos) => {
        const doneTasks = todos.filter((todo) => todo.done).length;
        setCompletedTasks(doneTasks);
      })
      .catch(() => setCompletedTasks(0));

    fetch("https://zenquotes.io/api/random")
      .then((res) => res.json())
      .then((data) => {
        if (data && data[0] && data[0].q) {
          setQuote(data[0].q);
        } else {
          setQuote("Stay motivated and keep going!");
        }
      })
      .catch(() => setQuote("Stay motivated and keep going!"));
  }, [user, navigate]);

  // Function to check if nav link is active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="home-container">
      <h1>
        Welcome back{user ? `, ${user.username ?? user.displayName ?? "User"}` : ""}!
      </h1>

      <div className="home-panel home-alarm-panel">
        <h3>Next Alarm</h3>
        {nextAlarm ? (
          <p>
            <strong>{nextAlarm.time}</strong>
            {nextAlarm.label ? ` - ${nextAlarm.label}` : ""}
          </p>
        ) : (
          <p>No upcoming alarms</p>
        )}
        <Link to="/alarms" className="home-action-button">
          Manage Alarms
        </Link>
      </div>

      <div className="home-panel home-todo-summary">
        <h3>Tasks Completed Today</h3>
        <p>{completedTasks}</p>
        <Link to="/todos" className="home-action-button">
          View Todos
        </Link>
      </div>

      <div className="home-panel home-quote-box">
        <h3>Motivational Quote</h3>
        <p className="home-quote-text">"{quote}"</p>
      </div>

      {/* Bottom fixed navigation */}
      <nav className="bottom-nav">
        <Link to="/profile" className={isActive("/profile") ? "nav-link active" : "nav-link"}>
          <FaUser size={24} />
          <span>Profile</span>
        </Link>
        <Link to="/todos" className={isActive("/todos") ? "nav-link active" : "nav-link"}>
          <FaTasks size={24} />
          <span>Todos</span>
        </Link>
        <Link to="/alarms" className={isActive("/alarms") ? "nav-link active" : "nav-link"}>
          <FaBell size={24} />
          <span>Alarms</span>
        </Link>
        <Link to="/diary" className={isActive("/diary") ? "nav-link active" : "nav-link"}>
          <FaBook size={24} />
          <span>Diary</span>
        </Link>
        <Link to="/notes" className={isActive("/notes") ? "nav-link active" : "nav-link"}>
          <FaStickyNote size={24} />
          <span>Notes</span>
        </Link>
      </nav>
    </div>
  );
};

export default Home;
