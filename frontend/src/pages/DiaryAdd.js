import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Diary.css";

const DiaryAdd = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const addEntry = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please enter title and content");
      return;
    }
    fetch("http://localhost:5000/api/diary", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to add diary entry");
        }
        return res.json();
      })
      .then(() => {
        alert("Entry added successfully");
        navigate("/diary");
      })
      .catch((err) => alert("Error adding diary entry: " + err.message));
  };

  return (
    <div className="diary-container">
      <h1>Add New Diary Entry</h1>
      <div className="diary-form">
        <input
          type="text"
          placeholder="Title"
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          rows={10}
          maxLength={10000}
          placeholder="Write your thoughts here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={addEntry}>Add Entry</button>
      </div>
    </div>
  );
};

export default DiaryAdd;