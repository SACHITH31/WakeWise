import React from "react";
import { NavLink } from "react-router-dom";
import { AiFillHome, AiFillClockCircle } from "react-icons/ai";
import { MdNotes, MdChecklist, MdPerson } from "react-icons/md";
import "../styles/BottomNavBar.css";

const BottomNavBar = () => {
  return (
    <nav className="nav">
      <NavLink to="/home" className={({ isActive }) => (isActive ? "link active" : "link")}>
        <AiFillHome size={24} />
        <span className="label">Home</span>
      </NavLink>
      <NavLink to="/alarm" className={({ isActive }) => (isActive ? "link active" : "link")}>
        <AiFillClockCircle size={24} />
        <span className="label">Alarm</span>
      </NavLink>
      <NavLink to="/notes" className={({ isActive }) => (isActive ? "link active" : "link")}>
        <MdNotes size={24} />
        <span className="label">Notes</span>
      </NavLink>
      <NavLink to="/todo" className={({ isActive }) => (isActive ? "link active" : "link")}>
        <MdChecklist size={24} />
        <span className="label">To-Do</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => (isActive ? "link active" : "link")}>
        <MdPerson size={24} />
        <span className="label">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNavBar;
