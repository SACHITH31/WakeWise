import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa"; // Trash icon for delete
import "../styles/Alarm.css";

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday","Weekend"
];

const Alarm = () => {
  const [alarms, setAlarms] = useState([]);
  const [time, setTime] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [message, setMessage] = useState("");
  const [sound, setSound] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAlarms(); }, []);

  const fetchAlarms = () => {
    fetch("http://localhost:5000/api/alarms", { credentials: "include" })
      .then(res => res.json())
      .then(data => setAlarms(Array.isArray(data) ? data : []))
      .catch(() => setAlarms([]));
  };

  const toggleDay = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const resetForm = () => {
    setTime("");
    setSelectedDays([]);
    setMessage("");
    setSound("");
    setEnabled(true);
    setError(null);
    setSubmitting(false);
  };

  const addAlarm = (e) => {
    e.preventDefault();
    setError(null);

    if (!time) return setError("Please select a time.");
    if (selectedDays.length === 0) return setError("Please select at least one day.");

    const isDuplicate = alarms.some(a =>
      a.time === time &&
      a.days.split(/[,|]/).map(d => d.trim()).sort().join(",") === selectedDays.slice().sort().join(",")
    );
    if (isDuplicate) return setError("Alarm for this time and days already exists.");

    setSubmitting(true);

    const alarmData = {
      time,
      days: selectedDays.join("|"),
      message,
      sound,
      enabled
    };

    fetch("http://localhost:5000/api/alarms", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alarmData)
    })
      .then(res => {
        setSubmitting(false);
        if (!res.ok) return res.text().then(txt => { throw new Error(txt || "Failed to add alarm"); });
        return res.json();
      })
      .then(() => {
        fetchAlarms();
        resetForm();
      })
      .catch(err => setError(err.message || "Failed to add alarm"));
  };

  const toggleAlarmStatus = (alarm) => {
    const updatedAlarm = { ...alarm, enabled: !alarm.enabled };
    fetch(`http://localhost:5000/api/alarms/${alarm.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedAlarm)
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
      })
      .then(() => fetchAlarms())
      .catch(err => setError(err.message || "Failed to update status"));
  };

  const deleteAlarm = (id) => {
    if (!window.confirm("Are you sure you want to delete this alarm?")) return;
    fetch(`http://localhost:5000/api/alarms/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete alarm");
        fetchAlarms();
      })
      .catch(err => setError(err.message || "Failed to delete alarm"));
  };

  return (
    <div className="alarm-screen">
      <h1 className="alarm-header">My Alarms</h1>

      <form className="alarm-form" onSubmit={addAlarm} noValidate>
        <div className="form-group">
          <label htmlFor="time-picker" className="input-label">Time</label>
          <input
            id="time-picker"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="alarm-input"
          />
        </div>

        <div className="form-group days-pills">
          {DAYS.map(day => (
            <button
              type="button"
              key={day}
              className={`day-pill ${selectedDays.includes(day) ? "selected" : ""}`}
              onClick={() => toggleDay(day)}
              aria-pressed={selectedDays.includes(day)}
              tabIndex={0}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="form-row">
          <input
            type="text"
            placeholder="Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="alarm-input message-input"
          />
          <input
            type="text"
            placeholder="Sound"
            value={sound}
            onChange={e => setSound(e.target.value)}
            className="alarm-input sound-input"
          />
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
          />
          Enabled
        </label>

        {error && <div className="error-msg">{error}</div>}

        <button className="alarm-submit-btn" disabled={submitting}>
          {submitting ? "Adding..." : "Add Alarm"}
        </button>
      </form>

      <section className="alarm-list-section">
        {alarms.length > 0 ? (
          <table className="alarm-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Days</th>
                <th>Message</th>
                <th>Sound</th>
                <th>Status</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {alarms.map(alarm => (
                <tr key={alarm.id}>
                  <td>{alarm.time}</td>
                  <td className="days-list">
                    {alarm.days.split(/[,|]/).map(d => (
                      <span key={d} className="day-pill-table">{d.trim()}</span>
                    ))}
                  </td>
                  <td>{alarm.message}</td>
                  <td>{alarm.sound}</td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={alarm.enabled}
                        onChange={() => toggleAlarmStatus(alarm)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteAlarm(alarm.id)}
                      className="delete-btn"
                      aria-label="Delete alarm"
                    >
                      <FaTrash size={18} color="#e74c3c" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-alarms-msg">No alarms found.</div>
        )}
      </section>
    </div>
  );
};

export default Alarm;
