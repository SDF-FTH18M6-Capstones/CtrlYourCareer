import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  BookOpen,
  ChevronDown,
  Target,
} from "lucide-react";
import { request } from "../../services/monitoring";
import "../EmploymentPanel.css";

export default function AdminUserMonitor() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setUsers(await request("/admin/monitoring"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const journeys = users.flatMap((u) => u.journeys);
  const done = journeys.reduce((sum, j) => sum + j.completed, 0);
  const total = journeys.reduce((sum, j) => sum + j.total, 0);
  const visible = users.filter((u) =>
    u.username.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <section className="employment-panel monitor-panel">
      <div className="emp-heading">
        <div>
          <span className="emp-eyebrow">
            <Users size={16} /> USER DEVELOPMENT
          </span>
          <h2>User Progress Monitoring</h2>
          <p>
            Review learning activity and career readiness across your users.
          </p>
        </div>
        <button className="emp-secondary" disabled={loading} onClick={load}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <div className="emp-stats">
        {[
          ["Regular users", users.length],
          [
            "Users with journeys",
            users.filter((u) => u.journeys.length).length,
          ],
          ["Journey resource completions", done],
          [
            "Resource progress",
            total ? `${Math.round((done / total) * 100)}%` : "—",
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{loading ? "…" : value}</strong>
          </div>
        ))}
      </div>
      <label className="emp-search">
        <Search size={20} />
        <input
          aria-label="Search users"
          placeholder="Search users by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {loading && <p role="status">Loading user progress…</p>}
      {error && (
        <p className="emp-error" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && !visible.length && (
        <div className="emp-empty">
          <Users size={28} />
          <strong>No matching users</strong>
        </div>
      )}
      {visible.map((u) => (
        <details className="monitor-user" key={u.id}>
          <summary>
            <span className="monitor-avatar">
              {u.username.charAt(0).toUpperCase()}
            </span>
            <span className="monitor-name">
              <strong>{u.username}</strong>
              <small>User #{u.id}</small>
            </span>
            <span className="emp-badge accepted">{u.skills.length} skills</span>
            <span className="emp-badge unsuccessful">
              {u.journeys.length} journeys
            </span>
            <ChevronDown className="monitor-chevron" size={19} />
          </summary>
          <div className="monitor-body">
            <h3>Recorded skills</h3>
            <div className="monitor-tags">
              {u.skills.length ? (
                u.skills.map((s, i) => (
                  <span key={i}>
                    {s.name} · {s.level || "Unknown"}
                  </span>
                ))
              ) : (
                <p>No recorded skills.</p>
              )}
            </div>
            <h3>Learning journeys</h3>
            {!u.journeys.length && <p>No learning journeys started.</p>}
            {u.journeys.map((j) => (
              <article key={j.id}>
                <h3>
                  <BookOpen size={19} /> {j.career}
                </h3>
                <div className="monitor-metric">
                  <span>Resources completed</span>
                  <strong>
                    {j.completed}/{j.total}
                  </strong>
                </div>
                <progress max={j.total || 1} value={j.completed} />
                <div className="monitor-metric">
                  <span>Activities completed</span>
                  <strong>
                    {j.activities_done}/{j.activities_total}
                  </strong>
                </div>
                <progress
                  max={j.activities_total || 1}
                  value={j.activities_done}
                />
                <div className="monitor-metric">
                  <span>
                    <Target size={16} /> Required skills met
                  </span>
                  <strong>
                    {j.readiness == null ? "Not configured" : `${j.readiness}%`}
                  </strong>
                </div>
                {j.readiness != null && (
                  <progress max={100} value={j.readiness} />
                )}
              </article>
            ))}
            <p className="monitor-note">
              Self-reported skills are for human review, not employment
              certification.
            </p>
          </div>
        </details>
      ))}
    </section>
  );
}
