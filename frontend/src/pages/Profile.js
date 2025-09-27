import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/Profile.css"; // Import CSS for styling

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <p>Loading...</p>;

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
      <div className="profile-details">
        <p>
          <strong>Username:</strong> {user.username || user.displayName || "No username"}
        </p>
        <p>
          <strong>Email:</strong> {user.email || "No email available"}
        </p>
      </div>
    </div>
  );
};

export default Profile;
