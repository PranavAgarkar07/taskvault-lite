import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import API from "./api";
import "./Login.css";

export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("login/", { username, password });
      const token = res.data.access;
      localStorage.setItem("token", token);
      setToken(token);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password.");
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
        <motion.h2 variants={fadeIn}>🔐 Login to TaskVault</motion.h2>

        <motion.div
          className="input-group"
          variants={fadeIn}
          custom={1}
        >
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

        {error && (
          <motion.p className="error" variants={fadeIn} custom={2}>
            {error}
          </motion.p>
        )}

        <motion.button
          onClick={login}
          disabled={loading}
          className="btn-login"
          variants={fadeIn}
          custom={3}
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        <motion.p className="register-text" variants={fadeIn} custom={4}>
          Don’t have an account?{" "}
          <Link to="/register" className="link">
            Register here
          </Link>
        </motion.p>

        <motion.div
          className="divider"
          variants={fadeIn}
          custom={5}
        >
          <span>OR</span>
        </motion.div>

        <motion.div
          className="oauth-buttons"
          variants={fadeIn}
          custom={6}
        >
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
