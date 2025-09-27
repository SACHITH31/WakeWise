import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Todos from "./pages/ToDo";
import Alarms from "./pages/Alarm";
import Diary from "./pages/Diary";
import Notes from "./pages/Notes";
import DiaryEdit from "./pages/DiaryEdit";

import PrivateLayout from "./components/PrivateLayout";
import DiaryAdd from "./pages/DiaryAdd";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* Private routes wrapped with PrivateLayout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <PrivateLayout>
                  <Home />
                </PrivateLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <PrivateLayout>
                  <Profile />
                </PrivateLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/todos"
            element={
              <PrivateRoute>
                <PrivateLayout>
                  <Todos />
                </PrivateLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/alarms"
            element={
              <PrivateRoute>
                <PrivateLayout>
                  <Alarms />
                </PrivateLayout>
              </PrivateRoute>
            }
          />
          <Route path="/diary" element={<Diary />} />
          <Route
            path="/notes"
            element={
              <PrivateRoute>
                <PrivateLayout>
                  <Notes />
                </PrivateLayout>
              </PrivateRoute>
            }
          />
           <Route path="/diary/:id" element={<DiaryEdit />} />
           <Route path="/diary/add" element={<DiaryAdd />} />

          {/* Redirect all unknown paths to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;