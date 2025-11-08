import { useState } from "react";
import API from "./api";
import { Link } from 'react-router-dom';
export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!username || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("register/", { username, password });
      alert("✅ Registered successfully! You can now log in.");
      window.location.href = "/"; // Redirect to login
    } catch (err) {
      console.error("Registration error:", err);
      setError("Registration failed — try another username.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "system-ui" }}>
      <h2>🧾 Register for TaskVault</h2>

      <div style={{ display: "flex", flexDirection: "column", width: "280px", margin: "auto", gap: "10px" }}>
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />

        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

        <button onClick={register} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </div>

      <p style={{ marginTop: "20px" }}>
        Already have an account?{" "}
        <Link to="/" style={{ color: "#007bff", textDecoration: "none" }}>
          Login here
        </Link>
      </p>
      <hr style={{ margin: "30px 0"}} />
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
