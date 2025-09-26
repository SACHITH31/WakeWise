import React, { useState } from "react";
import UserList from "../components/UserList";
import UserForm from "../components/UserForm";

const UsersPage = () => {
  const [editingUser, setEditingUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const saveUser = (user) => {
    const url = user.id ? `http://localhost:5000/api/users/${user.id}` : "http://localhost:5000/api/users";
    const method = user.id ? "PUT" : "POST";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then(() => {
        setEditingUser(null);
        setRefreshKey((k) => k + 1);
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div>
      {editingUser ? (
        <UserForm
          user={editingUser}
          onSave={saveUser}
          onCancel={() => setEditingUser(null)}
        />
      ) : (
        <>
          <button onClick={() => setEditingUser({})}>Add User</button>
          <UserList key={refreshKey} onEdit={setEditingUser} />
        </>
      )}
    </div>
  );
};

export default UsersPage;
