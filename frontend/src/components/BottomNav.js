import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaBell, FaBook, FaTasks, FaUser } from "react-icons/fa";
import "../styles/BottomNav.css";

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <Link to="/" className={isActive("/") ? "nav-link active" : "nav-link"}>
        <FaHome size={24} />
        <span>Home</span>
      </Link>
      <Link to="/alarms" className={isActive("/alarms") ? "nav-link active" : "nav-link"}>
        <FaBell size={24} />
        <span>Alarms</span>
      </Link>
      <Link to="/diary" className={isActive("/diary") ? "nav-link active" : "nav-link"}>
        <FaBook size={24} />
        <span>Diary</span>
      </Link>
      <Link to="/todos" className={isActive("/todos") ? "nav-link active" : "nav-link"}>
        <FaTasks size={24} />
        <span>Todos</span>
      </Link>
      <Link to="/profile" className={isActive("/profile") ? "nav-link active" : "nav-link"}>
        <FaUser size={24} />
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav;