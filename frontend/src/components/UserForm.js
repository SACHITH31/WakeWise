import React, { useState, useEffect } from "react";

const UserForm = ({ user, onSave, onCancel }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setPasswordHash(""); // you can leave password empty for editing or add password update separately
    } else {
      setUsername("");
      setEmail("");
      setPasswordHash("");
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple validation
    if (!username || !email || (!user && !passwordHash)) {
      alert("Please fill all required fields");
      return;
    }
    onSave({ username, email, password_hash: passwordHash, id: user ? user.id : null });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{user ? "Edit User" : "Add User"}</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />
      {!user && (
        <>
          <input
            type="password"
            placeholder="Password"
            value={passwordHash}
            onChange={(e) => setPasswordHash(e.target.value)}
          /><br />
        </>
      )}
      <button type="submit">{user ? "Update" : "Create"}</button>{" "}
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default UserForm;
