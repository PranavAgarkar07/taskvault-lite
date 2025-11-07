import { useEffect, useState } from "react";
import API from "./api";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  const login = async () => {
    const res = await API.post("login/", { username, password });
    localStorage.setItem("token", res.data.access);
    setToken(res.data.access);
  };

  const register = async () => {
    await API.post("register/", { username, password });
    alert("User registered, now log in");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const getUser = async () => {
    try {
      const res = await API.get("user/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ User fetched:", res.data);
      setUsername(res.data.username || res.data.first_name || "User");
    } catch (err) {
      console.error("❌ Error fetching user:", err);
    }
  };

  const getTasks = async () => {
    const res = await API.get("tasks/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data);
  };

  useEffect(() => {
    if (token) getTasks();
    if (token) getUser();
  }, [token]);

  const addTask = async () => {
    if (!title.trim()) {
      alert("Please enter a task title!");
      return;
    }

    const formattedDate =
      dueDate && dueDate !== ""
        ? new Date(dueDate).toISOString().split("T")[0]
        : null;

    try {
      await API.post(
        "tasks/",
        { title, due_date: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDueDate("");
      getTasks();
    } catch (err) {
      console.error("❌ Error adding task:", err.response?.data || err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await API.delete(`tasks/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      getTasks();
    } catch (err) {
      console.error("❌ Delete error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  const toggleComplete = async (id, newStatus) => {
    await API.patch(`tasks/${id}/update/`, { completed: newStatus });
    getTasks();
  };

  const [filter, setFilter] = useState("all");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  //Setting user login
  if (!token)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>🔐 Login or Register</h2>

        <input
          placeholder="Username"
          value={user}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div>
          <button onClick={login}>Login</button>
          <button onClick={register}>Register</button>
        </div>

        <hr style={{ margin: "20px 0" }} />
        <h3>Or Login With</h3>
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
    );

  return (
    <div style={{ maxWidth: 400, margin: "auto", textAlign: "center" }}>
      <button onClick={logout}>Logout</button>
      <h3>👋 Welcome, {username || "Guest"}</h3>
      <h1>📁 TaskVault Lite</h1>

      <div style={{ margin: "20px 0px" }}>
        <button style={{ margin: "10px" }} onClick={() => setFilter("all")}>
          All
        </button>
        <button
          style={{ margin: "10px" }}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
        <button style={{ margin: "10px" }} onClick={() => setFilter("pending")}>
          Pending
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        style={{ margin: "10px" }}
      />

      <button type="submit" onClick={addTask} value="Add">
        Add
      </button>
      <br />

      <ul>
        {filteredTasks.map((t) => (
          <li key={t.id} style={{ marginBottom: "10px" }}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => toggleComplete(t.id, !t.completed)}
              style={{ marginRight: "10px" }}
            />
            <span
              style={{ textDecoration: t.completed ? "line-through" : "none" }}
            >
              {t.title}
              {t.due_date && (
                <small style={{ marginLeft: "10px", color: "gray" }}>
                  (Due : {t.due_date})
                </small>
              )}
            </span>
            <button onClick={() => deleteTask(t.id)}>❌</button>
          </li>
        ))}
      </ul>
      <br />
    </div>
  );
}
