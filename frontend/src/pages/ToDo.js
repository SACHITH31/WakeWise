import React, { useState, useEffect } from "react";
import "../styles/Todos.css";
import { FaTrash } from "react-icons/fa";

const ToDo = () => {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch todos from backend
  const fetchTodos = () => {
    fetch("http://localhost:5000/api/todos", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setTodos)
      .catch(() => setTodos([]));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add todo handler
  const addTodo = () => {
    if (!newTask.trim()) {
      alert("Please enter a task");
      return;
    }
    fetch("http://localhost:5000/api/todos", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: newTask, completed: false }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(text || "Failed to add todo");
          });
        }
        return res.json();
      })
      .then((todo) => {
        setTodos((prev) => [todo, ...prev]);
        setNewTask("");
        setErrorMsg(null);
      })
      .catch((err) => setErrorMsg(err.message));
  };

  // Toggle todo completed status
  const toggleTodo = (id, completed, task) => {
    fetch(`http://localhost:5000/api/todos/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, completed: !completed }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update todo");
        return res.json();
      })
      .then(() => fetchTodos())
      .catch((err) => setErrorMsg(err.message));
  };

  // Delete todo
  const deleteTodo = (id) => {
    if (!window.confirm("Delete this task?")) return;
    fetch(`http://localhost:5000/api/todos/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => fetchTodos())
      .catch((err) => setErrorMsg(err.message));
  };

  return (
    <div className="todos-container">
      <h1>My Todos</h1>
      <div className="todo-form">
        <input
          type="text"
          placeholder="New Task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          maxLength={200}
        />
        <button onClick={addTodo}>Add Task</button>
      </div>
      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {todos.length === 0 ? (
        <p>No todos found</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? "completed" : ""}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed, todo.task)}
              />
              <span>{todo.task}</span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="delete-btn"
                aria-label="Delete"
              >
                <FaTrash size={18} color="#e74c3c" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ToDo;