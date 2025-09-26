import React, { useEffect, useState } from "react";
import "../styles/Alarm.css";

const Alarm = () => {
  const [alarms, setAlarms] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [formData, setFormData] = useState({
    time: "",
    days: "",
    message: "",
    enabled: true,
  });

  // Fetch alarms
  const fetchAlarms = () => {
    fetch("http://localhost:5000/api/alarms")
      .then((res) => res.json())
      .then(setAlarms)
      .catch(console.error);
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Open Add Alarm form
  const openAddForm = () => {
    setEditingAlarm(null);
    setFormData({
      time: "",
      days: "",
      message: "",
      enabled: true,
    });
    setIsFormOpen(true);
  };

  // Open Edit Alarm form
  const openEditForm = (alarm) => {
    setEditingAlarm(alarm);
    setFormData({
      time: alarm.time,
      days: alarm.days,
      message: alarm.message,
      enabled: alarm.enabled,
    });
    setIsFormOpen(true);
  };

  // Close form modal
  const closeForm = () => {
    setIsFormOpen(false);
  };

  // Submit form (Add or Edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingAlarm ? "PUT" : "POST";
    const url = editingAlarm
      ? `http://localhost:5000/api/alarms/${editingAlarm.id}`
      : "http://localhost:5000/api/alarms";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(res => {
      if (!res.ok) throw new Error("Failed to save alarm");
      closeForm();
      fetchAlarms();
    }).catch(err => alert(err.message));
  };

  // Toggle enabled status
  const toggleEnabled = (id, currentStatus) => {
    fetch(`http://localhost:5000/api/alarms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !currentStatus }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update alarm");
        return res.json();
      })
      .then(() => fetchAlarms())
      .catch(err => alert(err.message));
  };

  // Delete alarm
  const deleteAlarm = (id) => {
    if (!window.confirm("Are you sure you want to delete this alarm?")) return;
    fetch(`http://localhost:5000/api/alarms/${id}`, { method: "DELETE" })
      .then(() => fetchAlarms())
      .catch(err => alert(err.message));
  };

  return (
    <div className="alarm-container">
      <h1>Alarm List</h1>
      <button className="btn-add" onClick={openAddForm}>+ Add Alarm</button>

      {alarms.length > 0 ? (
        <ul className="alarm-list">
          {alarms.map(({ id, time, days, message, enabled }) => (
            <li key={id} className="alarm-item">
              <div className="alarm-time">{time}</div>
              <div className="alarm-days">{days}</div>
              <div className="alarm-message">{message}</div>
              <div className="alarm-actions">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleEnabled(id, enabled)}
                  />
                  <span className="slider round"></span>
                </label>
                <button className="btn-edit" onClick={() => openEditForm({id, time, days, message, enabled})}>Edit</button>
                <button className="btn-delete" onClick={() => deleteAlarm(id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No alarms set yet.</p>
      )}

      {/* Modal form for add/edit */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingAlarm ? "Edit Alarm" : "Add Alarm"}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Time:
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Days (comma separated, e.g. Mon,Tue):
                <input
                  type="text"
                  name="days"
                  value={formData.days}
                  onChange={handleChange}
                  placeholder="Mon,Tue,Wed"
                  required
                />
              </label>
              <label>
                Message:
                <input
                  type="text"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Wake up!"
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleChange}
                />
                Enabled
              </label>

              <div className="form-buttons">
                <button type="submit" className="btn-save">{editingAlarm ? "Update" : "Add"}</button>
                <button type="button" className="btn-cancel" onClick={closeForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alarm;
