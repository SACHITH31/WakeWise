import React, { useEffect, useState } from "react";

const UserList = ({ onEdit }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = () => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  };

  const deleteUser = (id) => {
    fetch(`http://localhost:5000/api/users/${id}`, { method: "DELETE" })
      .then(() => fetchUsers())
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Users List</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.username} ({u.email}){" "}
            <button onClick={() => onEdit(u)}>Edit</button>{" "}
            <button onClick={() => deleteUser(u.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;