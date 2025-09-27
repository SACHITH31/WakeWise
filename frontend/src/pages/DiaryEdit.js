import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Diary.css";

const DiaryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/diary/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load entry");
        return res.json();
      })
      .then(data => {
        setTitle(data.title);
        setContent(data.content);
        setLoading(false);
      })
      .catch(() => {
        alert("Entry not found");
        navigate("/diary");
      });
  }, [id, navigate]);

  const saveEntry = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in title and content");
      return;
    }
    fetch(`http://localhost:5000/api/diary/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save");
        return res.json();
      })
      .then(() => {
        alert("Entry saved");
        navigate("/diary");
      })
      .catch(err => alert(err.message));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="diary-container">
      <h1>Edit Diary Entry</h1>
      <div className="diary-form">
        <input
          type="text"
          maxLength={100}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
        />
        <textarea
          rows={15}
          maxLength={10000}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Entry content"
        />
      </div>
      <div className="entry-actions">
        <button onClick={() => navigate("/diary")}>Back</button>
        <button onClick={saveEntry}>Save</button>
      </div>
    </div>
  );
};

export default DiaryEdit;