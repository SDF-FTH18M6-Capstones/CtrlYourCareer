import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LogOut,
  Save,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Check,
  LockKeyhole,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
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

const INTEREST_CATEGORIES = [
  "Software development",
  "Data & analytics",
  "Design & creativity",
  "Business & finance",
  "Marketing",
  "Cybersecurity",
  "Healthcare",
  "Engineering",
  "Product management",
  "Education",
];

function normalizeInterests(interests) {
  if (Array.isArray(interests)) return interests;

  if (typeof interests === "string") {
    try {
      const parsed = JSON.parse(interests);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Support older comma-separated values.
    }

    return interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default function Settings({
  user,
  token,
  onBack,
  onLogout,
  onUserUpdated,
  theme,
  onThemeChange,
}) {
  // PROFILE
  const [form, setForm] = useState({
    username: user.username || user.name || "",
    email: user.email || "",
    interests: [],
  });

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // PASSWORD
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ACCOUNT DELETION
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // LOAD PROFILE
  useEffect(() => {
    let active = true;

    fetch(`${API_BASE}/profile/settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.msg || "Could not load settings");
        }

        return data;
      })
      .then((data) => {
        if (!active) return;

        setForm({
          ...data.profile,
          username: data.user.username,
          email: data.user.email,
          interests: normalizeInterests(
            data.profile.interests || data.profile.career_interest,
          ),
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

  // PROFILE INPUTS
  const change = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
    setError("");
  };

  // CAREER INTERESTS
  function toggleInterest(interest) {
    setForm((previous) => {
      const selected = previous.interests || [];

      const alreadySelected = selected.some(
        (item) => item.toLowerCase() === interest.toLowerCase(),
      );

      return {
        ...previous,
        interests: alreadySelected
          ? selected.filter(
              (item) => item.toLowerCase() !== interest.toLowerCase(),
            )
          : [...selected, interest],
      };
    });

    setMessage("");
    setError("");
  }

  // SAVE PROFILE
  async function save(e) {
    e.preventDefault();

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        interests: form.interests || [],
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

      if (!response.ok) {
        throw new Error(data.error || data.msg || "Could not save settings");
      }

      onUserUpdated?.({
        ...user,
        ...data.user,
        education_level: data.profile.education_level,
        course: data.profile.course,
        experience_details: data.profile.experience_details,
        short_term_goal: data.profile.short_term_goal,
        long_term_goal: data.profile.long_term_goal,
        interests: normalizeInterests(
          data.profile.interests || payload.interests,
        ),
      });

      setForm((previous) => ({
        ...previous,
        ...data.profile,
        username: data.user.username,
        email: data.user.email,
        interests: normalizeInterests(
          data.profile.interests || payload.interests,
        ),
      }));

      setMessage("Settings saved successfully.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // CHANGE PASSWORD
  async function changePassword(e) {
    e.preventDefault();

    setPasswordBusy(true);
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.new_password.length < 8) {
      setPasswordError("Password must contain at least 8 characters.");
      setPasswordBusy(false);
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Your new passwords do not match.");
      setPasswordBusy(false);
      return;
    }

    if (passwordForm.new_password === passwordForm.current_password) {
      setPasswordError(
        "Your new password must be different from your current password.",
      );
      setPasswordBusy(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not change password.");
      }

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

      setShowPasswords(false);

      setPasswordMessage("Your password has been changed successfully.");
    } catch (e) {
      setPasswordError(e.message);
    } finally {
      setPasswordBusy(false);
    }
  }

  // DELETE ACCOUNT
  async function deleteAccount(e) {
    e.preventDefault();

    setDeleteBusy(true);
    setDeleteError("");

    try {
      const response = await fetch(`${API_BASE}/auth/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: deletePassword,
          confirmation: deleteConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete account.");
      }

      onLogout();
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="dashboard settings-page">
      {/* HEADER */}
      <header className="dash-header">
        <Brand />

        <div className="dash-user">
          <button className="btn btn-quiet" type="button" onClick={onBack}>
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <button className="btn btn-quiet" type="button" onClick={onLogout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </header>

      <main className="dash-main settings-main">
        {/* INTRO */}
        <div className="settings-intro">
          <span className="eyebrow dark">
            <SettingsIcon size={16} />
            ACCOUNT SETTINGS
          </span>

          <h1>Your settings</h1>

          <p>Manage your profile, career preferences and appearance.</p>
        </div>

        {/* APPEARANCE */}
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

        {/* PROFILE */}
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
              </div>

              {/* CAREER INTEREST SELECTOR */}
              <section className="settings-interests">
                <div className="settings-interests-heading">
                  <span className="eyebrow dark">YOUR INTERESTS</span>

                  <h3>What fields interest you?</h3>

                  <p>
                    Select all the industries and fields you are interested in.
                    You can change these anytime.
                  </p>
                </div>

                <div
                  className="settings-interest-options"
                  role="group"
                  aria-label="Career interests"
                >
                  {INTEREST_CATEGORIES.map((interest) => {
                    const selected = (form.interests || []).some(
                      (item) => item.toLowerCase() === interest.toLowerCase(),
                    );

                    return (
                      <button
                        key={interest}
                        type="button"
                        className={`settings-interest-chip ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() => toggleInterest(interest)}
                        aria-pressed={selected}
                      >
                        {selected && <Check size={16} />}
                        {interest}
                      </button>
                    );
                  })}
                </div>

                <div className="settings-interest-footer">
                  <span>
                    {(form.interests || []).length} interests selected
                  </span>

                  {(form.interests || []).length > 0 && (
                    <button
                      type="button"
                      className="settings-clear-interests"
                      onClick={() => {
                        setForm((previous) => ({
                          ...previous,
                          interests: [],
                        }));

                        setMessage("");
                        setError("");
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </section>

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

        {/* SECURITY */}
        <section className="settings-panel security-panel">
          <div className="settings-panel-heading">
            <h2>Security & Account Management</h2>
            <p>Manage your password and control your account security.</p>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="security-card">
            <div className="security-card-heading">
              <div className="security-icon">
                <LockKeyhole size={22} />
              </div>

              <div>
                <h3>Change Password</h3>
                <p>Update your password to keep your account secure.</p>
              </div>
            </div>

            <form onSubmit={changePassword}>
              <div className="security-password-fields">
                {[
                  ["current_password", "Current password"],
                  ["new_password", "New password"],
                  ["confirm_password", "Confirm new password"],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}

                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={passwordForm[key]}
                        onChange={(e) =>
                          setPasswordForm((previous) => ({
                            ...previous,
                            [key]: e.target.value,
                          }))
                        }
                        required
                        autoComplete={
                          key === "current_password"
                            ? "current-password"
                            : "new-password"
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((previous) => !previous)
                        }
                        aria-label={
                          showPasswords ? "Hide passwords" : "Show passwords"
                        }
                      >
                        {showPasswords ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </label>
                ))}
              </div>

              <small className="security-hint">
                Your new password must contain at least 8 characters.
              </small>

              {passwordMessage && (
                <p className="settings-success" role="status">
                  {passwordMessage}
                </p>
              )}

              {passwordError && (
                <p className="settings-error" role="alert">
                  {passwordError}
                </p>
              )}

              <button
                type="submit"
                className="settings-save"
                disabled={passwordBusy}
              >
                <LockKeyhole size={17} />
                {passwordBusy ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>

          {/* DELETE ACCOUNT */}
          <div className="security-card delete-account-card">
            <div className="security-card-heading">
              <div className="security-icon danger-icon">
                <Trash2 size={22} />
              </div>

              <div>
                <h3>Delete Account</h3>
                <p>
                  Permanently remove your account and associated personal data.
                </p>
              </div>
            </div>

            {user.role === "admin" ? (
              <div className="delete-warning">
                Administrator accounts cannot be deleted through this interface.
              </div>
            ) : (
              <>
                <div className="delete-warning">
                  <strong>Warning:</strong> This action cannot be undone. Your
                  personal profile, learning journeys and associated account
                  information will be deleted.
                </div>

                <button
                  type="button"
                  className="delete-account-button"
                  onClick={() => {
                    setDeleteOpen(true);
                    setDeleteError("");
                    setDeletePassword("");
                    setDeleteConfirmation("");
                  }}
                >
                  <Trash2 size={17} />
                  Delete My Account
                </button>
              </>
            )}
          </div>
        </section>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteOpen && (
        <div
          className="delete-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleteBusy) {
              setDeleteOpen(false);
            }
          }}
        >
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="delete-modal-icon">
              <AlertTriangle size={28} />
            </div>

            <h2 id="delete-modal-title">Permanently delete your account?</h2>

            <p>
              This action cannot be undone. Your personal account information
              and associated learning progress will be removed.
            </p>

            <form onSubmit={deleteAccount}>
              <label>
                Enter your current password
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>

              <label>
                Type DELETE MY ACCOUNT to confirm
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  required
                />
              </label>

              {deleteError && (
                <p className="settings-error" role="alert">
                  {deleteError}
                </p>
              )}

              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="btn btn-quiet"
                  disabled={deleteBusy}
                  onClick={() => setDeleteOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="delete-confirm-button"
                  disabled={
                    deleteBusy ||
                    !deletePassword ||
                    deleteConfirmation !== "DELETE MY ACCOUNT"
                  }
                >
                  {deleteBusy ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
