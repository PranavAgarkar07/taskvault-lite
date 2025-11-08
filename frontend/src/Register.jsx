import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import API from "./api";
import { AnimatePresence } from "framer-motion";
import "./Register.css";
import logoUrl from "./download.svg";

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
      setSuccess("");
      return;
    }
    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await API.post("register/", {
        username,
        password,
        password2: confirmPassword,
      });

      console.log("✅ Registration success:", res.data);
      setSuccess("✅ Account created successfully! Redirecting to login...");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      // ⏳ Redirect after short delay
      setTimeout(() => {
        navigate("/login"); // redirect to your login page
      }, 2000);
    } catch (err) {
      console.error("❌ Register error:", err);

      if (err.response?.data) {
        const data = err.response.data;
        const msg =
          data.password ||
          data.password2 ||
          data.username ||
          data.detail ||
          data.error ||
          "Registration failed. Please try again.";
        setError(Array.isArray(msg) ? msg[0] : msg);
      } else {
        setError("Something went wrong. Please try again.");
      }
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

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key={error} // important to re-render on new message
              className="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
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
