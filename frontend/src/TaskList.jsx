import { useEffect, useState } from "react";
import API from "./api";
import { motion } from "framer-motion";
import "./TaskList.css";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
  };

  useEffect(() => {
    const syncOfflineTasks = async () => {
      // 1) Process queued deletes first
      const queuedDeletes = JSON.parse(
        localStorage.getItem("localDeletes") || "[]"
      );
      if (queuedDeletes.length > 0) {
        console.log(`🗑️ Syncing ${queuedDeletes.length} queued delete(s)...`);
        const remainingDeletes = [];
        for (const d of queuedDeletes) {
          try {
            await API.delete(`tasks/${d.id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Deleted on server:", d.id);
          } catch (err) {
            console.error("❌ Failed to delete on server:", d.id, err);
            remainingDeletes.push(d); // keep for later retry
          }
        }
        localStorage.setItem("localDeletes", JSON.stringify(remainingDeletes));
      }

      // 2) Then process pending creations / unsynced tasks
      const localTasks = JSON.parse(localStorage.getItem("localTasks") || "[]");
      const pending = localTasks.filter((t) => t.pendingSync);

      if (pending.length === 0) {
        // still update UI from localTasks after deletes processed
        setTasks(localTasks);
        return;
      }

      console.log(`🔄 Syncing ${pending.length} offline task(s)...`);

      const updatedTasks = [...localTasks];

      for (const task of pending) {
        try {
          const res = await API.post(
            "tasks/",
            { title: task.title, due_date: task.due_date },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // replace local temp entry with server record (and clear pendingSync)
          const index = updatedTasks.findIndex((t) => t.id === task.id);
          if (index !== -1) {
            updatedTasks[index] = { ...res.data, pendingSync: false };
          }
          console.log(`✅ Synced: ${task.title}`);
        } catch (err) {
          console.error("❌ Failed to sync:", task.title);
          // leave it pending for next attempt
        }
      }

      // persist final state and update UI
      localStorage.setItem("localTasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      console.log("✅ Offline tasks synced successfully!");
    };

    window.addEventListener("online", syncOfflineTasks);
    return () => window.removeEventListener("online", syncOfflineTasks);
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("taskvault_user");
    localStorage.removeItem("taskvault_tasks");
    setToken(null);
    window.location.reload();
  };

  const getUser = async () => {
    try {
      // 1️⃣ Check localStorage first
      const cachedUser = localStorage.getItem("taskvault_user");
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        setUsername(
          user.full_name || user.username || user.first_name || "User"
        );
        return; // skip API if cache exists
      }

      // 2️⃣ Otherwise fetch from backend
      const res = await API.get("user/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data;
      setUsername(user.full_name || user.username || user.first_name || "User");

      // 3️⃣ Cache for later use
      localStorage.setItem("taskvault_user", JSON.stringify(user));
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      if (err.response?.status === 401) logout();
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      // 1️⃣ Always load from localStorage first (offline persistence)
      const cached = JSON.parse(localStorage.getItem("localTasks") || "[]");
      if (cached.length > 0) {
        console.log("📦 Loaded offline tasks:", cached.length);
        setTasks(cached);
        setLoading(false);
      }

      // 2️⃣ If online → merge backend + offline
      if (token && navigator.onLine) {
        try {
          const res = await API.get("tasks/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const onlineTasks = res.data;

          // Keep unsynced local ones + merge backend
          const local = JSON.parse(localStorage.getItem("localTasks") || "[]");
          const merged = [
            ...local.filter((t) => t.pendingSync),
            ...onlineTasks,
          ];

          setTasks(merged);
          localStorage.setItem("localTasks", JSON.stringify(merged));
          console.log("✅ Loaded & merged online tasks");
        } catch (err) {
          console.error("❌ Failed to fetch tasks, showing cached only");
        } finally {
          setLoading(false);
        }
      }
    };

    loadTasks();
  }, [token]);

  const getTasks = async () => {
    try {
      const res = await API.get("tasks/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const onlineTasks = res.data;

      const localTasks = JSON.parse(localStorage.getItem("localTasks") || "[]");
      const merged = [
        ...localTasks.filter((t) => t.pendingSync),
        ...onlineTasks,
      ];

      setTasks(merged);
      localStorage.setItem("localTasks", JSON.stringify(merged));
    } catch (err) {
      console.error("❌ Error fetching tasks, using offline cache instead");
      const local = JSON.parse(localStorage.getItem("localTasks") || "[]");
      setTasks(local);
    }
  };

  useEffect(() => {
    const mergeOnlineTasks = async () => {
      if (!navigator.onLine) return;

      try {
        const res = await API.get("tasks/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const onlineTasks = res.data;
        const localTasks = JSON.parse(
          localStorage.getItem("localTasks") || "[]"
        );

        // Merge unique ones only
        const merged = [
          ...localTasks.filter((lt) => lt.pendingSync),
          ...onlineTasks,
        ];
        setTasks(merged);
        localStorage.setItem("localTasks", JSON.stringify(merged));
      } catch (err) {
        console.error("⚠️ Failed to merge online tasks");
      }
    };

    mergeOnlineTasks();
  }, [token]);

  // Load from cache first, then fetch fresh data
  // ✅ Always prefer localTasks (offline cache) and then merge with online
  useEffect(() => {
    const loadPersistedTasks = async () => {
      const local = JSON.parse(localStorage.getItem("localTasks") || "[]");
      if (local.length > 0) {
        console.log("📦 Loaded persisted local tasks:", local.length);
        setTasks(local);
        setLoading(false);
      }

      // Fetch from backend only if online
      if (token && navigator.onLine) {
        try {
          await getUser();

          const res = await API.get("tasks/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const online = res.data;

          // Merge unsynced local tasks + online ones
          const merged = [...local.filter((t) => t.pendingSync), ...online];

          setTasks(merged);
          localStorage.setItem("localTasks", JSON.stringify(merged));
          console.log("✅ Synced online + offline tasks");
        } catch (err) {
          console.error("❌ Could not fetch tasks, showing cached only");
        } finally {
          setLoading(false);
        }
      } else {
        // Offline mode fallback
        console.warn("📴 Offline mode - using cached tasks");
        setLoading(false);
      }
    };

    loadPersistedTasks();
  }, [token]);

  const addTask = async () => {
    if (!title.trim()) return;

    const formattedDate =
      dueDate && dueDate !== ""
        ? new Date(dueDate).toISOString().split("T")[0]
        : null;

    const tempId = Date.now();
    const newTask = {
      id: tempId,
      title,
      due_date: formattedDate,
      completed: false,
      pendingSync: !navigator.onLine, // track offline tasks
    };

    // 1️⃣ Add to UI immediately
    setTasks((prev) => [...prev, newTask]);
    setTitle("");
    setDueDate("");

    // 2️⃣ Always store locally (persistent even after reload)
    const localTasks = JSON.parse(localStorage.getItem("localTasks") || "[]");
    localTasks.push(newTask);
    localStorage.setItem("localTasks", JSON.stringify(localTasks));

    // 3️⃣ If offline → skip API call
    if (!navigator.onLine) {
      console.log("💾 Saved offline:", newTask.title);
      return;
    }

    // 4️⃣ If online → sync instantly
    try {
      const res = await API.post(
        "tasks/",
        { title, due_date: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Replace temp with actual task
      setTasks((prev) =>
        prev.map((task) =>
          task.id === tempId ? { ...res.data, pendingSync: false } : task
        )
      );

      // Update local storage too
      const updated = JSON.parse(
        localStorage.getItem("localTasks") || "[]"
      ).map((t) => (t.id === tempId ? { ...res.data, pendingSync: false } : t));
      localStorage.setItem("localTasks", JSON.stringify(updated));
    } catch (err) {
      console.error("❌ Error adding task:", err);
      // Revert if failed
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  // DELETE (supports offline / online / optimistic UI)
  const deleteTask = async (id) => {
    const previous = [...tasks];
    const local = JSON.parse(localStorage.getItem("localTasks") || "[]");
    const taskToDelete = local.find((t) => t.id === id);

    // Optimistic UI: remove immediately
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const localAfterRemove = local.filter((t) => t.id !== id);
    localStorage.setItem("localTasks", JSON.stringify(localAfterRemove));

    // 🟡 Case 1: If task was never synced → delete locally only
    if (taskToDelete && taskToDelete.pendingSync) {
      console.log("🗑️ Deleted unsynced local task:", taskToDelete.title);
      return;
    }

    // 🟢 Case 2: If offline → queue for delete later
    if (!navigator.onLine) {
      const queued = JSON.parse(localStorage.getItem("localDeletes") || "[]");
      queued.push({ id });
      localStorage.setItem("localDeletes", JSON.stringify(queued));
      console.warn("⚠️ Offline: queued delete for server:", id);
      return;
    }

    // 🔵 Case 3: Online → attempt server delete
    try {
      await API.delete(`tasks/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Deleted on server:", id);
    } catch (err) {
      console.error("❌ Delete failed:", err);

      // Rollback (only if server delete fails)
      setTasks(previous);
      localStorage.setItem("localTasks", JSON.stringify(previous));
    }
  };

  const toggleComplete = async (id, newStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: newStatus } : task
      )
    );

    try {
      await API.patch(
        `tasks/${id}/update/`,
        { completed: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("❌ Toggle error:", err);
      // Revert on failure
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !newStatus } : task
        )
      );
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
        <button onClick={() => (window.location.href = "/")}>
          Login again
        </button>
      </div>
    );
  }

  return (
    <div className="tasklist-page">
      <motion.div
        className="tasklist-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="tasklist-header">
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
          <h3 className="usernameClass">👋 Welcome, {username || "Guest"}</h3><br /><br />
          <h1>📁 TaskVault Lite</h1>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          {["all", "completed", "pending"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task Input */}
        <div className="task-input">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New task..."
            disabled={loading}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={loading}
          />
          <button className="btn-add" onClick={addTask} disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </button>
        </div>

        {/* Task List */}
        <div className="task-container">
          {loading ? (
            <p className="loading">Loading tasks...</p>
          ) : filteredTasks.length > 0 ? (
            <ul className="task-list">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t) => (
                  <li
                    key={t.id}
                    className={`task-item ${t.completed ? "completed" : ""}`}
                  >
                    <div className="task-left">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleComplete(t.id, !t.completed)}
                      />
                      <div className="task-info">
                        <span className="task-title">{t.title}</span>
                        {t.pendingSync && (
                          <small
                            style={{ color: "#fbbf24", marginLeft: "6px" }}
                          >
                            (Pending Sync)
                          </small>
                        )}

                        {t.due_date && (
                          <small className="task-date">
                            (Due: {t.due_date})
                          </small>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="btn-delete"
                    >
                      ❌
                    </button>
                  </li>
                ))
              ) : (
                <p className="no-tasks">No tasks yet.</p>
              )}
            </ul>
          ) : (
            <p className="no-tasks">No tasks yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
