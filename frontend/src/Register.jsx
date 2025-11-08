import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import API from "./api";
import "./Register.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
  };

  const register = async () => {
    if (!username || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await API.post("register/", { username, password });
      setSuccess("Account created successfully! You can now log in.");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Register error:", err);
      setError("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <motion.div
        className="register-card"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.h2 variants={fadeIn}>📝 Create Your Account</motion.h2>

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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </motion.div>

        {error && (
          <motion.p className="error" variants={fadeIn} custom={2}>
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p className="success" variants={fadeIn} custom={2}>
            {success}
          </motion.p>
        )}

        <motion.button
          onClick={register}
          disabled={loading}
          className="btn-register"
          variants={fadeIn}
          custom={3}
        >
          {loading ? "Registering..." : "Register"}
        </motion.button>

        <motion.p className="login-text" variants={fadeIn} custom={4}>
          Already have an account?{" "}
          <Link to="/login" className="link">
            Login here
          </Link>
        </motion.p>

        <motion.div className="divider" variants={fadeIn} custom={5}>
          <span>OR</span>
        </motion.div>

        <motion.div className="oauth-buttons" variants={fadeIn} custom={6}>
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
