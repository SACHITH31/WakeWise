import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if(!user) return <p>Loading...</p>;

  return (
    <div className="profile-container">
       <h1>Profile</h1>
      {user.avatar_url && (
        <img
          src={user.avatar_url}
          alt="Avatar"
          className="profile-avatar"
        />
      )}
      <h2>Username: {user.display_name ||  "User"}</h2>
      <h2>Email: {user.email}</h2>
      <LogoutButton />
    </div>
  );
};

export default Profile;
