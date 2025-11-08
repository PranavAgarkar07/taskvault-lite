import { useState } from "react";
import API from "./api";
import { Link } from 'react-router-dom';
export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "system-ui" }}>
      <h2>🔐 Login to TaskVault</h2>

      <div style={{ display: "flex", flexDirection: "column", width: "260px", margin: "auto", gap: "10px" }}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

        <button onClick={login} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>

      <p style={{ marginTop: "20px" }}>
        Don't have an account?{" "}
        <Link
          to="/register"
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          Register here
        </Link>
      </p>

      <hr style={{ margin: "30px 0" }} />
      <h3>Or Login With</h3>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button
          onClick={() =>
            (window.location.href =
              "https://taskvault-lite.onrender.com/accounts/google/login/")
          }
        >
          🌐 Google
        </button>
        <button
          onClick={() =>
            (window.location.href =
              "https://taskvault-lite.onrender.com/accounts/github/login/")
          }
        >
          🐙 GitHub
        </button>
      </div>
    </div>
  );
}
