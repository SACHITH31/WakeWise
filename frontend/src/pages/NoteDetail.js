import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Notes.css";

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  useEffect(() => {
    fetch(`http://localhost:5000/api/notes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setNote(data);
        setFormData({ title: data.title, content: data.content });
      })
      .catch(() => alert("Note not found"));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    fetch(`http://localhost:5000/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        setNote({ ...note, ...formData });
        setIsEditing(false);
      })
      .catch((e) => alert(e.message));
  };

  if (!note) return <p>Loading...</p>;

  return (
    <div className="notes-container detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        &larr; Back
      </button>
      <div className="note-detail-card">
        {isEditing ? (
          <div className="modal-content large-modal" style={{ margin: "auto", boxShadow: "none", maxWidth: "600px" }}>
            <h2>Edit Note</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit();
              }}
            >
              <label>
                Title:
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Content:
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={14}
                />
              </label>
              <div className="form-buttons">
                <button type="submit" className="btn-save">
                  Save
                </button>
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="detail-header-row">
              <h1 className="detail-title">{note.title}</h1>
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            </div>
            <div className="note-detail-date">
              {note.created_at ? new Date(note.created_at).toLocaleString() : ""}
            </div>
            <div className="note-detail-content">
              {note.content}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;