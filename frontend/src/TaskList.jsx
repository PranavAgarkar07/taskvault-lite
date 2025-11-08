import { useEffect, useState } from "react";
import API from "./api";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("taskvault_tasks");
    setToken(null);
    window.location.reload();
  };

  const getUser = async () => {
    try {
      const res = await API.get("user/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user =
        res.data.full_name || res.data.username || res.data.first_name || "User";
      setUsername(user);
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      if (err.response?.status === 401) logout();
    }
  };

  const getTasks = async () => {
    try {
      const res = await API.get("tasks/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
      localStorage.setItem("taskvault_tasks", JSON.stringify(res.data));
    } catch (err) {
      console.error("❌ Error fetching tasks:", err);
      if (err.response?.status === 401) logout();
    }
  };

  // Load from cache first, then fetch fresh data
  useEffect(() => {
    const cached = localStorage.getItem("taskvault_tasks");
    if (cached) {
      setTasks(JSON.parse(cached));
      setLoading(false);
    }

    if (token) {
      Promise.all([getUser(), getTasks()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
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
      setTasks((prev) => prev.filter((t) => t.id !== id));
      localStorage.setItem(
        "taskvault_tasks",
        JSON.stringify(tasks.filter((t) => t.id !== id))
      );
    } catch (err) {
      console.error("❌ Delete error:", err.response?.data || err.message);
    }
  };

  const toggleComplete = async (id, newStatus) => {
    try {
      await API.patch(
        `tasks/${id}/update/`,
        { completed: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: newStatus } : task
        )
      );
    } catch (err) {
      console.error("❌ Error toggling task:", err.response?.data || err.message);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Session expired ⚠️</h2>
        <button onClick={() => (window.location.href = "/")}>Login again</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto", textAlign: "center" }}>
      <button onClick={logout}>Logout</button>
      <h3>👋 Welcome, {username || "Guest"}</h3>
      <h1>📁 TaskVault Lite</h1>

      <div style={{ margin: "20px 0px" }}>
        {["all", "completed", "pending"].map((f) => (
          <button
            key={f}
            style={{
              margin: "10px",
              fontWeight: filter === f ? "bold" : "normal",
            }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
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
      <button onClick={addTask}>Add</button>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((t) => (
              <li key={t.id} style={{ marginBottom: "10px" }}>
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleComplete(t.id, !t.completed)}
                  style={{ marginRight: "10px" }}
                />
                <span
                  style={{
                    textDecoration: t.completed ? "line-through" : "none",
                  }}
                >
                  {t.title}
                  {t.due_date && (
                    <small style={{ marginLeft: "10px", color: "gray" }}>
                      (Due: {t.due_date})
                    </small>
                  )}
                </span>
                <button onClick={() => deleteTask(t.id)}>❌</button>
              </li>
            ))
          ) : (
            <p>No tasks yet.</p>
          )}
        </ul>
      )}
    </div>
  );
}
