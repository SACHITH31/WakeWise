import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import '../styles/LogoutButton.css';

const LogoutButton = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        navigate("/login");
      } else {
        alert("Logout failed.");
      }
    } catch (err) {
      alert("Logout failed.");
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)} className="logoutButton">Logout</button>
     {showConfirm && (
  <>
    <div className="logout-overlay" onClick={() => setShowConfirm(false)}></div>
    <div className="logout-popup">
      <p>Are you sure you want to logout?</p>
      <button onClick={logout}>Yes</button>
      <button onClick={() => setShowConfirm(false)}>No</button>
    </div>
  </>
)}

    </>
  );
};

export default LogoutButton;
