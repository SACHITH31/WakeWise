import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import "../styles/Diary.css";

const Diary = () => {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchEntries = () => {
    fetch("http://localhost:5000/api/diary", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Filter entries by search term
  const filteredEntries = entries.filter((entry) =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  return (
    <div className="diary-container">
      <h1>My Diary</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search diary entries..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="diary-search-input"
      />

      {/* Add new entry */}
      <button className="add-entry-btn" onClick={() => navigate("/diary/add")}>
        + Add New Entry
      </button>

      {filteredEntries.length === 0 ? (
        <p className="no-entries">No diary entries found.</p>
      ) : (
        <div className="diary-entries">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="diary-entry-preview"
              onClick={() => navigate(`/diary/${entry.id}`)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === "Enter" && navigate(`/diary/${entry.id}`)}
            >
              <h3>{entry.title}</h3>
              <p className="preview-text">{entry.content}</p>
              <span className="entry-date">{formatDate(entry.created_at)}</span>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Diary;