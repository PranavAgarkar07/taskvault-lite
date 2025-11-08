import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import TaskList from "./TaskList.jsx";
import Home from "./Home.jsx"; // ⬅️ Import the dark animated homepage

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
      {/* ===== Landing Page ===== */}
      <Route path="/" element={<Home />} />

      {/* ===== Login Page ===== */}
      <Route
        path="/login"
        element={
          token ? <Navigate to="/dashboard" replace /> : <Login setToken={setToken} />
        }
      />

      {/* ===== Register Page ===== */}
      <Route path="/register" element={<Register />} />

      {/* ===== Dashboard (Protected) ===== */}
      <Route
        path="/dashboard"
        element={
          token ? <TaskList token={token} /> : <Navigate to="/login" replace />
        }
      />

      {/* ===== Fallback ===== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
