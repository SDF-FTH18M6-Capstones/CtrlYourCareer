import { useEffect, useState } from "react";
import {
  Code2,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
  CalendarDays,
  Save,
  Trash2,
} from "lucide-react";

import { backendApi } from "../services/backend";
import Modal from "./ui/Modal";

import "./DashboardInteractions.css";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function SkillsList() {
  const [skills, setSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [recommendedSkills, setRecommendedSkills] = useState([]);
  const [view, setView] = useState("recommended");
  const [recommendationError, setRecommendationError] = useState("");

  const [selected, setSelected] = useState(null);

  const [level, setLevel] = useState("Beginner");
  const [years, setYears] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadSkills() {
    const [available, mine] = await Promise.all([
      backendApi.getSkills(),
      backendApi.getMySkills(),
    ]);

    setSkills(Array.isArray(available) ? available : available?.skills || []);

    setMySkills(Array.isArray(mine) ? mine : mine?.skills || []);

    try {
      const recommended = await backendApi.getRecommendedSkills();
      setRecommendedSkills(Array.isArray(recommended) ? recommended : []);
      setRecommendationError("");
    } catch (err) {
      setRecommendationError(err.message);
    }
  }

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      backendApi.getSkills(),
      backendApi.getMySkills(),
      backendApi.getRecommendedSkills(),
    ])
      .then(([availableResult, mineResult, recommendedResult]) => {
        if (availableResult.status === "rejected") throw availableResult.reason;
        if (mineResult.status === "rejected") throw mineResult.reason;
        const available = availableResult.value;
        const mine = mineResult.value;
        if (!active) return;

        setSkills(
          Array.isArray(available) ? available : available?.skills || [],
        );

        setMySkills(Array.isArray(mine) ? mine : mine?.skills || []);
        if (recommendedResult.status === "fulfilled") {
          const recommended = recommendedResult.value;
          setRecommendedSkills(Array.isArray(recommended) ? recommended : []);
          setRecommendationError("");
        } else {
          setRecommendationError(
            recommendedResult.reason?.message ||
              "Could not load recommendations.",
          );
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function selectSkill(skill) {
    const existing = mySkills.find((record) => record.skill_id === skill.id);

    setSelected(skill);

    setLevel(existing?.proficiency_level || "Beginner");

    setYears(existing?.years_experience ?? 0);

    setFormError("");
    setError("");
    setNotice("");
  }

  function closeSkillModal() {
    if (saving) return;

    setSelected(null);
    setLevel("Beginner");
    setYears(0);
    setFormError("");
  }

  async function saveSkill(event) {
    event.preventDefault();

    if (!selected || saving) return;

    const record = mySkills.find((item) => item.skill_id === selected.id);

    const numericYears = Number(years);

    if (!Number.isInteger(numericYears) || numericYears < 0) {
      setFormError("Years of experience must be a non-negative whole number.");
      return;
    }

    setSaving(true);
    setFormError("");
    setNotice("");

    try {
      const payload = {
        proficiency_level: level,
        years_experience: numericYears,
      };

      if (record) {
        await backendApi.updateMySkill(record.id, payload);
      } else {
        await backendApi.addMySkill({
          skill_id: selected.id,
          ...payload,
        });
      }

      await loadSkills();

      setNotice(
        `${selected.name} ${record ? "updated" : "added"} successfully.`,
      );

      closeAfterSuccess();

      window.dispatchEvent(new Event("ctrlyourcareer:skills-changed"));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeSkill() {
    if (!selected || saving) return;

    const record = mySkills.find((item) => item.skill_id === selected.id);

    if (!record) return;

    const confirmed = window.confirm(
      `Remove ${selected.name} from your skills?`,
    );

    if (!confirmed) return;

    setSaving(true);
    setFormError("");
    setNotice("");

    try {
      await backendApi.deleteMySkill(record.id);

      await loadSkills();

      setNotice(`${selected.name} removed successfully.`);

      closeAfterSuccess();

      window.dispatchEvent(new Event("ctrlyourcareer:skills-changed"));
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function closeAfterSuccess() {
    setSelected(null);
    setLevel("Beginner");
    setYears(0);
    setFormError("");
  }

  const selectedRecord = mySkills.find(
    (item) => item.skill_id === selected?.id,
  );

  const isEditing = Boolean(selectedRecord);
  const displayedSkills = view === "recommended" ? recommendedSkills : skills;
  return (
    <section className="explore-section dashboard-interactions">
      <div className="explore-heading">
        <div>
          <span className="section-label">
            <Sparkles size={15} />
            YOUR SKILL LIBRARY
          </span>

          <h2>Discover Skills</h2>

          <p>
            Select a skill to add it to your profile or update your proficiency.
          </p>
        </div>

        <span className="item-count">
          {mySkills.length} My Skills / {skills.length} Available
        </span>
      </div>

      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "16px 0" }}
        role="group"
        aria-label="Skill views"
      >
        <button
          type="button"
          className="dashboard-secondary-button"
          aria-pressed={view === "recommended"}
          onClick={() => setView("recommended")}
          style={{
            fontWeight: view === "recommended" ? 800 : 500,
            outline: view === "recommended" ? "2px solid currentColor" : "none",
          }}
        >
          Recommended for You ({recommendedSkills.length})
        </button>
        <button
          type="button"
          className="dashboard-secondary-button"
          aria-pressed={view === "all"}
          onClick={() => setView("all")}
          style={{
            fontWeight: view === "all" ? 800 : 500,
            outline: view === "all" ? "2px solid currentColor" : "none",
          }}
        >
          Explore All ({skills.length})
        </button>
      </div>
      {view === "recommended" && recommendationError && (
        <p role="alert" className="api-error">
          Recommendations unavailable: {recommendationError}. You can still
          explore all skills.
        </p>
      )}
      {!loading &&
        view === "recommended" &&
        !recommendationError &&
        recommendedSkills.length === 0 && (
          <p>
            No new recommended skills yet. Try Explore All or update your
            interests in Settings.
          </p>
        )}
      {loading && <p>Loading skills...</p>}

      {error && (
        <p role="alert" className="api-error">
          {error}
        </p>
      )}

      {notice && (
        <p role="status" className="dashboard-notice">
          {notice}
        </p>
      )}

      {!loading && !error && skills.length === 0 && (
        <p>No skills are available yet.</p>
      )}

      {!loading && (
        <div className="modern-card-grid">
          {displayedSkills.map((skill) => {
            const owned = mySkills.find(
              (record) => record.skill_id === skill.id,
            );

            return (
              <button
                type="button"
                className="modern-item-card dashboard-card-button"
                key={skill.id}
                onClick={() => selectSkill(skill)}
              >
                <div className="card-top">
                  <div className="modern-icon skill-icon">
                    <Code2 size={24} />
                  </div>

                  <span className="card-badge">
                    {owned
                      ? "MY SKILL"
                      : view === "recommended"
                        ? "RECOMMENDED"
                        : "SKILL"}
                  </span>
                </div>

                <h3>{skill.name}</h3>

                <p>{skill.description || "Explore this skill."}</p>
                {view === "recommended" &&
                  skill.relevant_careers?.length > 0 && (
                    <p>
                      Useful for:{" "}
                      {skill.relevant_careers.slice(0, 3).join(", ")}
                    </p>
                  )}

                <div className="card-bottom">
                  <span>
                    {owned
                      ? `${owned.proficiency_level} · ${
                          owned.years_experience
                        } years`
                      : "Add to my skills"}
                  </span>

                  <ArrowUpRight size={19} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={closeSkillModal}
        busy={saving}
        title={
          selected
            ? `${isEditing ? "Edit" : "Add"} ${selected.name}`
            : "Skill Details"
        }
        size="medium"
      >
        {/* DESCRIPTION */}

        <div className="cyc-skill-modal-intro">
          <div className="cyc-skill-modal-icon">
            <GraduationCap size={23} />
          </div>

          <div>
            <h3>
              {isEditing
                ? "Update your skill details"
                : "Add this skill to your profile"}
            </h3>

            <p>
              {isEditing
                ? "Adjust your proficiency and experience to keep your career recommendations accurate."
                : "Tell us your proficiency and experience with this skill."}
            </p>
          </div>
        </div>

        {/* ERROR */}

        {formError && (
          <p role="alert" className="api-error">
            {formError}
          </p>
        )}

        {/* FORM */}

        <form className="cyc-skill-modal-form" onSubmit={saveSkill}>
          {/* PROFICIENCY */}

          <div className="cyc-admin-field">
            <label htmlFor="skill-level">
              <GraduationCap size={17} />
              Proficiency level
            </label>

            <select
              id="skill-level"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              disabled={saving}
            >
              {LEVELS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          {/* EXPERIENCE */}

          <div className="cyc-admin-field">
            <label htmlFor="skill-years">
              <CalendarDays size={17} />
              Years of experience
            </label>

            <input
              id="skill-years"
              type="number"
              min="0"
              step="1"
              required
              value={years}
              onChange={(event) => setYears(event.target.value)}
              disabled={saving}
            />
          </div>

          {/* ACTIONS */}

          <div className="cyc-admin-form-actions">
            <button
              type="button"
              className="cyc-admin-secondary-btn"
              onClick={closeSkillModal}
              disabled={saving}
            >
              Cancel
            </button>

            {isEditing && (
              <button
                type="button"
                className="cyc-skill-remove-btn"
                onClick={removeSkill}
                disabled={saving}
              >
                <Trash2 size={17} />
                Remove Skill
              </button>
            )}

            <button
              type="submit"
              className="cyc-admin-primary-btn"
              disabled={saving}
            >
              <Save size={17} />

              {saving ? "Saving..." : isEditing ? "Update Skill" : "Add Skill"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
