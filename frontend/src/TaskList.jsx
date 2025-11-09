import { useEffect, useState, useRef } from "react";
import API from "./api";
import { motion } from "framer-motion";
import "./TaskList.css";
import logoUrl from "./download.svg";
import { Link } from "react-router-dom";
export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  const didRun = useRef(false);

  // ✅ MIGRATION: Auto-cleanup corrupted localStorage data
  useEffect(() => {
    const CURRENT_VERSION = "2.0";
    const storedVersion = localStorage.getItem("taskvault_version");

    if (storedVersion !== CURRENT_VERSION) {
      console.log("🔄 Migrating to version", CURRENT_VERSION);

      const tasksToKeep = [];
      try {
        const localTasks = JSON.parse(
          localStorage.getItem("localTasks") || "[]"
        );
        // Keep only temp/pending tasks (user's unsaved work)
        localTasks.forEach((task) => {
          if (task.id?.toString().startsWith("temp-") || task.pendingSync) {
            tasksToKeep.push(task);
          }
        });
      } catch (err) {
        console.error("Migration error:", err);
      }

      // Clear old data
      localStorage.removeItem("localTasks");
      localStorage.removeItem("localDeletes");

      // Restore unsaved work
      if (tasksToKeep.length > 0) {
        localStorage.setItem("localTasks", JSON.stringify(tasksToKeep));
        console.log(`✅ Preserved ${tasksToKeep.length} unsaved task(s)`);
      }

      localStorage.setItem("taskvault_version", CURRENT_VERSION);
    }
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
  };

  const showSyncStatus = (msg) => {
    setSyncStatus(msg);
    setTimeout(() => setSyncStatus(""), 2000);
  };

  const loadAndSyncTasks = async () => {
    const safeGetLocal = (key) => {
      try {
        return JSON.parse(localStorage.getItem(key) || "[]");
      } catch {
        localStorage.removeItem(key);
        return [];
      }
    };

    const local = safeGetLocal("localTasks");
    setTasks(local);
    setLoading(false);

    if (!token) return;
    if (!navigator.onLine) {
      console.warn("📴 Offline mode — using cached tasks only");
      return;
    }

    try {
      if (!userFetched) {
        await getUser();
        setUserFetched(true);
      }

      const res = await API.get("tasks/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const online = res.data;
      const merged = mergeTasks(local, online);
      localStorage.setItem("localTasks", JSON.stringify(merged));
      setTasks(merged);

      console.log(
        `✅ Merged ${online.length} online + ${local.length} local tasks (deduplicated).`
      );
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
    }
  };

  // 🔧 Utility: Merge + Deduplicate Tasks
  const mergeTasks = (local = [], online = []) => {
    const all = [...local, ...online];
    const seen = new Map();

    all.forEach((task) => {
      const key = task.id?.toString().startsWith("temp-")
        ? task.title?.toLowerCase().trim()
        : task.id;

      if (!seen.has(key)) seen.set(key, task);
    });

    return Array.from(seen.values());
  };

  const [userFetched, setUserFetched] = useState(false);

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
    // 2️⃣ Sync newly created temp tasks
    for (const task of pending) {
      if (task.id.toString().startsWith("temp-")) {
        try {
          const res = await API.post(
            "tasks/",
            {
              title: task.title,
              due_date: task.due_date,
              completed: task.completed,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // replace local temp with real task
          const index = updatedTasks.findIndex((t) => t.id === task.id);
          if (index !== -1)
            updatedTasks[index] = { ...res.data, pendingSync: false };

          console.log(`✅ Created new task on server: ${task.title}`);
        } catch (err) {
          console.error("❌ Failed to upload new task:", task.title, err);
        }
      }
    }

    // 3️⃣ Sync pending updates (edits or toggles made offline)
    for (const task of pending) {
      if (!task.id.toString().startsWith("temp-")) {
        try {
          const res = await API.patch(
            `tasks/${task.id}/update/`,
            {
              title: task.title,
              due_date: task.due_date,
              completed: task.completed,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // ✅ Replace local copy and clear pendingSync
          const index = updatedTasks.findIndex((t) => t.id === task.id);
          if (index !== -1) {
            updatedTasks[index] = { ...res.data, pendingSync: false };
          }

          console.log(`✅ Updated existing task: ${task.title}`);
        } catch (err) {
          console.error("❌ Failed to update:", task.title, err);
        }
      }
    }

    // persist final state and update UI
    localStorage.setItem("localTasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
    console.log("✅ Offline tasks synced successfully!");
    showSyncStatus("✅ Synced offline changes!");
  };

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    loadAndSyncTasks();
  }, [token]);

  const logout = () => {
    // 🔒 Completely clear all stored data for full security
    localStorage.clear();

    // Reset token in state
    setToken(null);

    // Optional: add a quick delay for smooth UI feedback
    setTimeout(() => {
      window.location.reload();
    }, 300);
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

  // Load from cache first, then fetch fresh data
  // ✅ Always prefer localTasks (offline cache) and then merge with online

  const addTask = async () => {
    if (!title.trim()) return;

    const formattedDate =
      dueDate && dueDate !== ""
        ? new Date(dueDate).toISOString().split("T")[0]
        : null;

    const tempId = `temp-${Date.now()}`; // ensures temp IDs are unique & recognizable
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

  useEffect(() => {
    const handleOnline = async () => {
      console.log("🌐 Network reconnected — syncing offline + online tasks...");
      await syncOfflineTasks(); // first push local changes
      await loadAndSyncTasks(); // then pull fresh tasks
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [token]);

  // DELETE (supports offline / online / optimistic UI)
  const deleteTask = async (id) => {
    const previous = [...tasks];
    const local = JSON.parse(localStorage.getItem("localTasks") || "[]");
    const taskToDelete = local.find((t) => t.id === id);

    // Optimistic UI: remove immediately
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const localAfterRemove = local.filter((t) => t.id !== id);
    localStorage.setItem("localTasks", JSON.stringify(localAfterRemove));

    // ✅ NEW: Check if it's a temp ID (never synced to server)
    if (id.toString().startsWith("temp-")) {
      console.log(
        "🗑️ Deleted temp local task (never synced):",
        taskToDelete?.title
      );
      return;
    }

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
    // ✅ NEW: Don't sync temp tasks to server
    if (id.toString().startsWith("temp-")) {
      // Just update locally
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: newStatus } : task
        )
      );
      const local = JSON.parse(localStorage.getItem("localTasks") || "[]");
      const updatedLocal = local.map((t) =>
        t.id === id ? { ...t, completed: newStatus, pendingSync: true } : t
      );
      localStorage.setItem("localTasks", JSON.stringify(updatedLocal));
      console.log("💾 Updated temp task locally (will sync when created):", id);
      return;
    }

    // 1️⃣ Optimistically update UI
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: newStatus } : task
      )
    );

    // 2️⃣ Update localStorage immediately
    const local = JSON.parse(localStorage.getItem("localTasks") || "[]");
    const updatedLocal = local.map((t) =>
      t.id === id ? { ...t, completed: newStatus } : t
    );
    localStorage.setItem("localTasks", JSON.stringify(updatedLocal));

    // 3️⃣ If offline → mark it for sync later
    if (!navigator.onLine) {
      const pending = updatedLocal.map((t) =>
        t.id === id ? { ...t, pendingSync: true } : t
      );
      localStorage.setItem("localTasks", JSON.stringify(pending));
      console.log("💾 Saved offline toggle, will sync later:", id);
      return;
    }

    // 4️⃣ If online → sync instantly
    try {
      const res = await API.patch(
        `tasks/${id}/update/`,
        { completed: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 5️⃣ Replace in local cache with fresh server copy
      const syncedLocal = updatedLocal.map((t) =>
        t.id === id ? { ...res.data, pendingSync: false } : t
      );
      localStorage.setItem("localTasks", JSON.stringify(syncedLocal));
      setTasks(syncedLocal);

      console.log("✅ Completion synced to server:", id);
    } catch (err) {
      console.error("❌ Toggle sync failed:", err);
      // Optional: revert only if server reject (not network)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !newStatus } : task
        )
      );
    }
  };

  // ✏️ Start editing a task
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
    setEditingDueDate(task.due_date || "");
  };

  // ❌ Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingDueDate("");
  };

  // 💾 Save edited task (offline-first)
  const saveEdit = async (id) => {
    if (!editingTitle.trim()) return;

    setEditLoading(true);

    const formattedDate =
      editingDueDate && editingDueDate !== ""
        ? new Date(editingDueDate).toISOString().split("T")[0]
        : null;

    // 1️⃣ Optimistically update UI
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, title: editingTitle, due_date: formattedDate } : t
      )
    );

    // 2️⃣ Update localStorage immediately
    const local = JSON.parse(localStorage.getItem("localTasks") || "[]");
    const updatedLocal = local.map((t) =>
      t.id === id
        ? {
            ...t,
            title: editingTitle,
            due_date: formattedDate,
            pendingSync: !navigator.onLine ? true : t.pendingSync,
          }
        : t
    );
    localStorage.setItem("localTasks", JSON.stringify(updatedLocal));

    // ✅ NEW: Don't sync temp tasks to server yet
    if (id.toString().startsWith("temp-")) {
      console.log(
        "💾 Updated temp task locally (will sync when created):",
        editingTitle
      );
      setEditLoading(false);
      cancelEdit();
      return;
    }

    // 3️⃣ If offline, stop here
    if (!navigator.onLine) {
      console.log("💾 Saved offline edit, will sync later:", editingTitle);
      setEditLoading(false);
      cancelEdit();
      return;
    }

    // 4️⃣ If online, sync to backend
    try {
      const res = await API.patch(
        `tasks/${id}/update/`,
        { title: editingTitle, due_date: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const finalLocal = JSON.parse(
        localStorage.getItem("localTasks") || "[]"
      ).map((t) => (t.id === id ? { ...res.data, pendingSync: false } : t));
      localStorage.setItem("localTasks", JSON.stringify(finalLocal));
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...res.data, pendingSync: false } : t))
      );
      console.log("✅ Edit synced to server:", res.data);
    } catch (err) {
      console.error("❌ Edit failed:", err);
    } finally {
      setEditLoading(false);
      cancelEdit();
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
          {syncStatus && (
            <div
              style={{
                textAlign: "center",
                color: "#22c55e",
                fontWeight: "600",
                marginTop: "8px",
                transition: "opacity 0.3s",
              }}
            >
              {syncStatus}
            </div>
          )}
          <button onClick={logout} className="btn-logout">
            Logout
          </button>

          <Link to="/">
            <h3 className="usernameClass">👋 Welcome, {username || "Guest"}</h3>
          </Link>
          <br />
          <br />
          <br />
          <h2>📁 TaskVault Lite</h2>
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTask();
              }
            }}
            disabled={loading}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTask();
              }
            }}
            disabled={loading}
            style={{ colorScheme: "dark" }}
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
              {filteredTasks.map((t) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`task-item ${t.completed ? "completed" : ""}`}
                >
                  {/* ✅ LEFT SIDE — checkbox + content */}
                  <div
                    className="task-left"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flex: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggleComplete(t.id, !t.completed)}
                    />

                    {/* Task info */}
                    <div className="task-info" style={{ flex: 1 }}>
                      {editingId === t.id ? (
                        // ✏️ EDIT MODE
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "6px",
                              borderRadius: "8px",
                              background: "#111827",
                              color: "white",
                              border: "1px solid #444",
                            }}
                          />
                          <input
                            type="date"
                            value={editingDueDate}
                            onChange={(e) => setEditingDueDate(e.target.value)}
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              background: "#111827",
                              color: "white",
                              border: "1px solid #444",
                            }}
                          />
                        </div>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>

                  {/* ✅ RIGHT SIDE — buttons (stays at far right always) */}
                  <div
                    className="task-controls"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      justifyContent: "flex-end",
                      flexShrink: 0,
                    }}
                  >
                    {editingId === t.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(t.id)}
                          disabled={editLoading}
                          className="btn btn-save"
                        >
                          {editLoading ? "Saving..." : "💾 Save"}
                        </button>
                        <button onClick={cancelEdit} className="btn btn-cancel">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(t)}
                          className="btn btn-edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteTask(t.id)}
                          className="btn btn-delete"
                        >
                          ❌
                        </button>
                      </>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="no-tasks">No tasks yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
