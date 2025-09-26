import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Alarm from "./pages/Alarm";
import Notes from "./pages/Notes";
import ToDo from "./pages/ToDo";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/alarm" element={<Alarm />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/todo" element={<ToDo />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<h2>404: Page Not Found</h2>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
