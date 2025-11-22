import { useEffect, useMemo, useState } from "react";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [tab, setTab] = useState("todo"); // 'todo' or 'completed'
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("todos:v1");
      if (raw) setTodos(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("todos:v1", JSON.stringify(todos));
    } catch (e) {
      // ignore
    }
  }, [todos]);

  const createTodo = (e) => {
    e && e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((s) => [{ id: uid(), text: trimmed, completed: false }, ...s]);
    setText("");
  };

  const toggleComplete = (id) => {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const removeTodo = (id) => {
    setTodos((s) => s.filter((t) => t.id !== id));
  };

  const updateTodo = (id, newText) => {
    setTodos((s) => s.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  };

  const filtered = useMemo(() => {
    const byTab = todos.filter((t) => (tab === "todo" ? !t.completed : t.completed));
    if (!search.trim()) return byTab;
    const q = search.trim().toLowerCase();
    return byTab.filter((t) => t.text.toLowerCase().includes(q));
  }, [todos, tab, search]);

  return (
    <div style={styles.page}>
      <main style={styles.container}>
        <h1 style={styles.title}>Simple To‑Do</h1>

        <form onSubmit={createTodo} style={styles.form}>
          <input
            aria-label="New todo"
            placeholder="Add a new to-do and press Enter"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.addButton}>
            Add
          </button>
        </form>

        <div style={styles.controls}>
          <div style={styles.tabs} role="tablist">
            <button
              role="tab"
              aria-selected={tab === "todo"}
              onClick={() => setTab("todo")}
              style={tab === "todo" ? styles.tabActive : styles.tab}
            >
              To Do ({todos.filter((t) => !t.completed).length})
            </button>
            <button
              role="tab"
              aria-selected={tab === "completed"}
              onClick={() => setTab("completed")}
              style={tab === "completed" ? styles.tabActive : styles.tab}
            >
              Completed ({todos.filter((t) => t.completed).length})
            </button>
          </div>

          <input
            aria-label="Search todos"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />
        </div>

        <ul style={styles.list}>
          {filtered.length === 0 && <li style={styles.empty}>No items</li>}
          {filtered.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              onToggle={() => toggleComplete(t.id)}
              onDelete={() => removeTodo(t.id)}
              onUpdate={(newText) => updateTodo(t.id, newText)}
            />
          ))}
        </ul>
      </main>
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todo.text);

  useEffect(() => setValue(todo.text), [todo.text]);

  const save = () => {
    const v = value.trim();
    if (!v) return;
    onUpdate(v);
    setEditing(false);
  };

  return (
    <li style={styles.item}>
      <label style={styles.itemLeft}>
        <input type="checkbox" checked={todo.completed} onChange={onToggle} />
        {editing ? (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setValue(todo.text);
                setEditing(false);
              }
            }}
            style={styles.editInput}
            autoFocus
          />
        ) : (
          <span style={{ ...styles.itemText, textDecoration: todo.completed ? "line-through" : "none" }}>
            {todo.text}
          </span>
        )}
      </label>

      <div style={styles.itemActions}>
        {editing ? (
          <>
            <button onClick={save} style={styles.actionButton} aria-label="Save">
              Save
            </button>
            <button
              onClick={() => {
                setValue(todo.text);
                setEditing(false);
              }}
              style={styles.actionButton}
              aria-label="Cancel"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} style={styles.actionButton} aria-label="Edit">
              Edit
            </button>
            <button onClick={onDelete} style={styles.deleteButton} aria-label="Delete">
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f6f7", padding: 20 },
  container: { width: "100%", maxWidth: 720, background: "#fff", padding: 24, borderRadius: 10, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" },
  title: { margin: 0, marginBottom: 12, fontSize: 24 },
  form: { display: "flex", gap: 8, marginBottom: 12 },
  input: { flex: 1, padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd" },
  addButton: { padding: "8px 12px", borderRadius: 6, border: "none", background: "#111827", color: "#fff" },
  controls: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 },
  tabs: { display: "flex", gap: 8 },
  tab: { padding: "6px 10px", borderRadius: 6, border: "1px solid transparent", background: "#f2f2f3" },
  tabActive: { padding: "6px 10px", borderRadius: 6, border: "1px solid #111827", background: "#111827", color: "#fff" },
  search: { padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd", minWidth: 160 },
  list: { listStyle: "none", padding: 0, margin: 0 },
  empty: { padding: 12, color: "#666" },
  item: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderBottom: "1px solid #f0f0f0" },
  itemLeft: { display: "flex", alignItems: "center", gap: 10 },
  itemText: { fontSize: 16 },
  itemActions: { display: "flex", gap: 6 },
  actionButton: { background: "transparent", border: "1px solid #ddd", padding: "6px 8px", borderRadius: 6, cursor: "pointer" },
  deleteButton: { background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: 6, cursor: "pointer" },
  editInput: { padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd" },
};

