import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import API from "./api";
import "./Login.css";
import logoUrl from "./download.svg";

export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
  };

  const login = async () => {
    if (!username || !password) {
      setError("⚠️ Please enter both username and password.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await API.post("login/", { username, password });
      const token = res.data.access;

      if (!token) throw new Error("No token received.");

      localStorage.setItem("token", token);
      setToken(token);
      setSuccess("✅ Login successful! Redirecting...");

      // Redirect smoothly after 1.5 seconds
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("❌ Login error:", err);

      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "❌ Invalid username or password.";

      setError(msg);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-card"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Link to="/">
          <img
            src={logoUrl}
            className="logo-svg"
            style={{
              justifyContent: "center", // Centers horizontally
              alignItems: "center", // Centers vertically
            }}
            alt="TaskVault logo"
          />
        </Link>
        <motion.h2 variants={fadeIn}>🔐 Login to TaskVault</motion.h2>
        <motion.div className="input-group" variants={fadeIn} custom={1}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </motion.div>
        {/* ⚡ Animated Error & Success */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              className="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              key="success"
              className="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {success}
            </motion.p>
          )}
        </AnimatePresence>
        <motion.button
          onClick={login}
          disabled={loading}
          className="btn-login"
          variants={fadeIn}
          custom={2}
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>
        <motion.p className="register-text" variants={fadeIn} custom={3}>
          Don’t have an account?{" "}
          <Link to="/register" className="link">
            Register here
          </Link>
        </motion.p>
        <motion.div className="divider" variants={fadeIn} custom={4}>
          <span>OR</span>
        </motion.div>
        <motion.div className="oauth-buttons" variants={fadeIn} custom={5}>
          <button
            className="btn-oauth google"
            onClick={() =>
              (window.location.href =
                "https://taskvault-lite.onrender.com/accounts/google/login/")
            }
          >
            🌐 Google
          </button>
          <button
            className="btn-oauth github"
            onClick={() =>
              (window.location.href =
                "https://taskvault-lite.onrender.com/accounts/github/login/")
            }
          >
            🐙 GitHub
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
