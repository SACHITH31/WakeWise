import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";


const Auth = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "signup";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password, username: formData.username };
    try {
      const res = await fetch(`http://localhost:5000/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Auth failed");
      setUser(data.user);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  const googleAuth = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  const githubAuth = () => {
    window.location.href = "http://localhost:5000/auth/github";
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required minLength={3} />
        )}
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required minLength={6} />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <div className="oauth-buttons">
        <button onClick={googleAuth} className="btn-google">Continue with Google</button>
        <button onClick={githubAuth} className="btn-github">Continue with GitHub</button>
      </div>
      <p className="toggle-text" onClick={() => setIsLogin(prev => !prev)}>
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
      </p>
    </div>
  );
};

export default Auth