import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Home.css";
import BottomNav from "../components/BottomNav.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [nextAlarm, setNextAlarm] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [quote, setQuote] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventReminderDays, setNewEventReminderDays] = useState(0);

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

    fetch("http://localhost:5000/api/events/upcoming", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUpcomingEvents(data.upcoming ?? []))
      .catch(() => {
        toast.error("Failed to load upcoming events");
        setUpcomingEvents([]);
      });
  }, [user, navigate]);

  const addEvent = () => {
    if (!newEventTitle.trim()) {
      toast.error("Event title cannot be empty");
      return;
    }

   fetch("http://localhost:5000/api/events", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: newEventTitle.trim(),
    event_date: selectedDate.toISOString().slice(0, 10),
    reminder_days: parseInt(newEventReminderDays, 10) || 0,
  }),
})
  .then((res) => {
    if (!res.ok) {
      return res.json().then((data) => {
        throw new Error(data.message || "Unable to add event");
      });
    }
    return res.json();
  })
  .then((newEvent) => {
    setUpcomingEvents((prev) => [...prev, newEvent]);
    setNewEventTitle("");
    setNewEventReminderDays(0);
    toast.success("Event added successfully!");
  })
  .catch((err) => toast.error(err.message));

  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = date.toISOString().slice(0, 10);
    const events = upcomingEvents.filter(
      (ev) => ev.event_date === dateStr || ev.reminder_date === dateStr
    );
    return events.length > 0 ? (
      <div
        style={{
          backgroundColor: "#007bff",
          borderRadius: "50%",
          width: 8,
          height: 8,
          margin: "0 auto",
        }}
      />
    ) : null;
  };

  const eventsForSelectedDate = upcomingEvents.filter(
    (ev) =>
      ev.event_date === selectedDate.toISOString().slice(0, 10) ||
      ev.reminder_date === selectedDate.toISOString().slice(0, 10)
  );

  return (
    <div className="home-container">
      <h1>Welcome back{user ? `, ${user.username ?? user.displayName ?? "User"}` : ""}!</h1>

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

      <div className="home-panel home-calendar-panel">
        <h3>Calendar</h3>
        <Calendar value={selectedDate} onChange={setSelectedDate} tileContent={tileContent} />
        <div style={{ marginTop: 20 }}>
          <input
            type="text"
            value={newEventTitle}
            placeholder="New event title"
            onChange={(e) => setNewEventTitle(e.target.value)}
            style={{ padding: 8, width: "60%", fontSize: 16 }}
          />
          <input
            type="number"
            value={newEventReminderDays}
            min={0}
            onChange={(e) => setNewEventReminderDays(e.target.value)}
            placeholder="Reminder days before"
            style={{ padding: 8, width: "20%", fontSize: 16, marginLeft: 8 }}
          />
          <button onClick={addEvent} style={{ padding: "8px 20px", marginLeft: 8, fontSize: 16 }}>
            Add Event
          </button>
        </div>
        <div style={{ marginTop: 20, textAlign: "left" }}>
          <h4>Events and Reminders for {selectedDate.toDateString()}</h4>
          {eventsForSelectedDate.length === 0 ? (
            <p>No events or reminders on this date.</p>
          ) : (
            <ul>
              {eventsForSelectedDate.map((ev) => (
                <li key={ev.id}>
                  {ev.title} - {ev.event_date === selectedDate.toISOString().slice(0, 10) ? "Event" : `Reminder (Event: ${ev.event_date})`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Home;
