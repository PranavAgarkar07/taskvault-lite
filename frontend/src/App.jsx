import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import TaskList from "./TaskList.jsx";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Keep token in sync across tabs
  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Routes>
      {/* Login route */}
      <Route
        path="/"
        element={
          token ? <Navigate to="/dashboard" replace /> : <Login setToken={setToken} />
        }
      />

      {/* Registration route */}
      <Route path="/register" element={<Register />} />

      {/* Dashboard route */}
      <Route
        path="/dashboard"
        element={
          token ? <TaskList token={token} /> : <Navigate to="/" replace />
        }
      />

      {/* Fallback route for unknown URLs */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
