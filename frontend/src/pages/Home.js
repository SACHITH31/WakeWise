import React, { useEffect, useState } from "react";
import "../styles/Home.css";

const Home = () => {
  const [greeting, setGreeting] = useState("");
  const [nextAlarm, setNextAlarm] = useState(null);
  const [todoStats, setTodoStats] = useState({ total: 0, completed: 0 });
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/alarms/next")
      .then((res) => res.json())
      .then((data) => setNextAlarm(data))
      .catch(() => {
        setNextAlarm({ time: "07:30 AM", message: "Wake up!" });
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/todos/today/stats")
      .then((res) => res.json())
      .then(setTodoStats)
      .catch(() => {
        setTodoStats({ total: 5, completed: 2 });
      });
  }, []);

  useEffect(() => {
    fetch("https://api.quotable.io/random?tags=motivational")
      .then((res) => res.json())
      .then((data) => setQuote(data.content))
      .catch(() => {
        setQuote("The only way to do great work is to love what you do.");
      });
  }, []);

  const handleAddAlarm = () => alert("Add Alarm clicked");
  const handleAddNote = () => alert("Add Note clicked");
  const handleAddTodo = () => alert("Add To-Do clicked");

  return (
    <div className="home-container">
      <h1>{greeting}, User!</h1>

      <div className="home-panel home-alarm-panel">
        <h3>Next Alarm</h3>
        {nextAlarm ? (
          <div>
            <strong>{nextAlarm.time}</strong> - {nextAlarm.message}
          </div>
        ) : (
          <div>No upcoming alarms</div>
        )}
      </div>

      <div className="home-panel home-todo-summary">
        <h3>Today's To-Do Summary</h3>
        <div>
          {todoStats.completed} of {todoStats.total} tasks completed
        </div>
      </div>

      <div className="home-panel home-quote-box">
        <h3>Motivational Quote</h3>
        <p className="home-quote-text">"{quote}"</p>
      </div>

      <div className="home-quick-actions">
        <button className="home-action-button" onClick={handleAddAlarm}>
          + Add Alarm
        </button>
        <button className="home-action-button" onClick={handleAddNote}>
          + Add Note
        </button>
        <button className="home-action-button" onClick={handleAddTodo}>
          + Add To-Do
        </button>
      </div>
    </div>
  );
};

export default Home;
