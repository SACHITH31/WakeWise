import React, { useState, useEffect } from "react";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/notes", { credentials: "include" })
      .then((res) => res.json())
      .then(setNotes)
      .catch(console.error);
  }, []);

  const addNote = () => {
    if (!text.trim()) return;
    fetch("http://localhost:5000/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: text }),
    })
      .then((res) => res.json())
      .then((note) => {
        setNotes((prev) => [note, ...prev]);
        setText("");
      });
  };

  const updateNote = (id, content) => {
    fetch(`http://localhost:5000/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    }).then(() => {
      setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, content } : note)));
    });
  };

  const deleteNote = (id) => {
    fetch(`http://localhost:5000/api/notes/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    });
  };

  return (
    <div>
      <h1>Notes</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Write a note..."
      />
      <button onClick={addNote}>Add Note</button>
      <ul>
        {notes.map(({ id, content }) => (
          <li key={id}>
            <textarea
              value={content}
              onChange={(e) => updateNote(id, e.target.value)}
              rows={2}
            />
            <button onClick={() => deleteNote(id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
