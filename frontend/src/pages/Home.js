import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Home.css";
import BottomNav from "../components/BottomNav.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegCalendarAlt } from "react-icons/fa";

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
  const [calendarOpen, setCalendarOpen] = useState(false);

  const calendarRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    }
    if (calendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarOpen]);

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
        setCalendarOpen(false);
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

      {/* Separate Events & Reminders Panel */}
      <div className="home-panel home-events-reminders-panel" style={{ marginTop: 20 }}>
        <h3>Events and Reminders for {selectedDate.toDateString()}</h3>
        {eventsForSelectedDate.length === 0 ? (
          <p>No events or reminders on this day.</p>
        ) : (
          <ul>
            {eventsForSelectedDate.map((ev) => (
              <li key={ev.id}>
                {ev.title} -{" "}
                {ev.event_date === selectedDate.toISOString().slice(0, 10)
                  ? "Event"
                  : `Reminder (Event: ${ev.event_date})`}
              </li>
            ))}
          </ul>
        )}
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

      {/* Floating calendar icon */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "#007bff",
          borderRadius: "50%",
          width: 60,
          height: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          zIndex: 1000,
          color: "#fff",
          fontSize: 30,
        }}
        onClick={() => setCalendarOpen(true)}
        title="Open Calendar"
      >
        <FaRegCalendarAlt />
      </div>

      {/* Calendar popup/modal */}
      {calendarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
            padding: 20,
          }}
        >
          <div
            ref={calendarRef}
            style={{
              position: "relative",
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 20,
              width: 350,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setCalendarOpen(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                fontWeight: "bold",
                fontSize: 24,
                border: "none",
                background: "none",
                cursor: "pointer",
                lineHeight: 1,
                padding: 0,
                margin: 0,
                color: "#555",
              }}
              aria-label="Close Calendar"
            >
              &times;
            </button>

            <Calendar value={selectedDate} onChange={setSelectedDate} tileContent={tileContent} />

            <div style={{ marginTop: 15 }}>
              <label>
                Event Title:
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  style={{ width: "100%", padding: 6, marginTop: 5 }}
                  placeholder="Enter event title"
                />
              </label>

              <label style={{ display: "block", marginTop: 10 }}>
                Reminder Days:
                <input
                  type="number"
                  min={0}
                  value={newEventReminderDays}
                  onChange={(e) => setNewEventReminderDays(e.target.value)}
                  style={{ width: "100%", padding: 6, marginTop: 5 }}
                  placeholder="Days before event to remind"
                />
              </label>

              <button
                onClick={addEvent}
                style={{
                  marginTop: 15,
                  padding: "10px 15px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  width: "100%",
                  fontWeight: "bold",
                }}
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Home;
