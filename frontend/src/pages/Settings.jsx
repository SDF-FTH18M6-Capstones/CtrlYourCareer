import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  Save,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import Brand from "../components/Brand";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
const FIELDS = [
  ["full_name", "Full name"],
  ["education_level", "Education level"],
  ["course", "Course / field of study"],
  ["experience", "Experience level"],
  ["experience_details", "Experience details"],
  ["career_goal", "Career goal"],
  ["short_term_goal", "Short-term goal"],
  ["long_term_goal", "Long-term goal"],
  ["bio", "About me"],
];
export default function Settings({
  user,
  token,
  onBack,
  onLogout,
  onUserUpdated,
  theme,
  onThemeChange,
}) {
  const [form, setForm] = useState({
    username: user.username || user.name || "",
    email: user.email || "",
  });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/profile/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok)
          throw new Error(data.error || data.msg || "Could not load settings");
        return data;
      })
      .then((data) => {
        if (active)
          setForm({
            ...data.profile,
            username: data.user.username,
            email: data.user.email,
            interests: (data.profile.interests || []).join(", "),
          });
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);
  const change = (e) =>
    setForm((previous) => ({ ...previous, [e.target.name]: e.target.value }));
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        interests: (form.interests || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const response = await fetch(`${API_BASE}/profile/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || data.msg || "Could not save settings");
      onUserUpdated({
        ...user,
        ...data.user,
        education_level: data.profile.education_level,
        course: data.profile.course,
        experience_details: data.profile.experience_details,
        short_term_goal: data.profile.short_term_goal,
        long_term_goal: data.profile.long_term_goal,
      });
      setMessage("Settings saved successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="dashboard settings-page">
      <header className="dash-header">
        <Brand />
        <div className="dash-user">
          <button className="btn btn-quiet" type="button" onClick={onBack}>
            <ArrowLeft size={17} /> Dashboard
          </button>
          <button className="btn btn-quiet" type="button" onClick={onLogout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </header>
      <main className="dash-main settings-main">
        <div className="settings-intro">
          <span className="eyebrow dark">
            <SettingsIcon size={16} /> ACCOUNT SETTINGS
          </span>
          <h1>Your settings</h1>
          <p>Manage your profile, career preferences and appearance.</p>
        </div>
        <section className="settings-panel">
          <div className="settings-panel-heading">
            <h2>Appearance</h2>
            <p>
              Choose the look that works best for you. Your preference is saved
              on this device.
            </p>
          </div>
          <div className="theme-choices">
            {[
              ["light", Sun, "Light"],
              ["dark", Moon, "Dark"],
              ["system", Monitor, "System"],
            ].map(([value, Icon, label]) => (
              <button
                type="button"
                key={value}
                className={`theme-choice ${theme === value ? "selected" : ""}`}
                onClick={() => onThemeChange(value)}
                aria-pressed={theme === value}
              >
                <Icon size={22} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </section>
        <form className="settings-panel" onSubmit={save}>
          <div className="settings-panel-heading">
            <h2>Profile & career preferences</h2>
            <p>These details help personalise your career recommendations.</p>
          </div>
          {loading ? (
            <p>Loading your profile…</p>
          ) : (
            <>
              <div className="settings-fields">
                <label>
                  Username
                  <input
                    name="username"
                    value={form.username || ""}
                    onChange={change}
                    required
                    maxLength={80}
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email || ""}
                    onChange={change}
                    required
                    maxLength={120}
                  />
                </label>
                {FIELDS.map(([key, label]) => (
                  <label key={key}>
                    {label}
                    {[
                      "experience_details",
                      "short_term_goal",
                      "long_term_goal",
                      "bio",
                    ].includes(key) ? (
                      <textarea
                        name={key}
                        value={form[key] || ""}
                        onChange={change}
                        rows={3}
                      />
                    ) : (
                      <input
                        name={key}
                        value={form[key] || ""}
                        onChange={change}
                      />
                    )}
                  </label>
                ))}
                <label className="settings-wide">
                  Career interests (comma-separated)
                  <textarea
                    name="interests"
                    value={form.interests || ""}
                    onChange={change}
                    rows={2}
                    placeholder="Software Development, Data Analytics"
                  />
                </label>
              </div>
              <div className="settings-actions">
                <button className="settings-save" type="submit" disabled={busy}>
                  <Save size={17} />
                  {busy ? "Saving…" : "Save changes"}
                </button>
              </div>
            </>
          )}
          {message && (
            <p role="status" className="settings-success">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="settings-error">
              {error}
            </p>
          )}
        </form>
        <section className="settings-panel">
          <h2>Security & account management</h2>
          <p>
            Password changes and account deletion are not available on this page
            yet. They require dedicated, authenticated backend endpoints.
          </p>
        </section>
      </main>
    </div>
  );
}
