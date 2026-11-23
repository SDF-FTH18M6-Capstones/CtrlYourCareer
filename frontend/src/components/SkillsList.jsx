import { useEffect, useRef, useState } from "react";
import { Code2, Sparkles, ArrowUpRight } from "lucide-react";
import { backendApi } from "../services/backend";
import "./DashboardInteractions.css";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function SkillsList() {
  const skillFormRef = useRef(null);
  const [skills, setSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]);
  const [selected, setSelected] = useState(null);
  const [level, setLevel] = useState("Beginner");
  const [years, setYears] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadSkills() {
    const [available, mine] = await Promise.all([
      backendApi.getSkills(),
      backendApi.getMySkills(),
    ]);
    setSkills(Array.isArray(available) ? available : available?.skills || []);
    setMySkills(Array.isArray(mine) ? mine : mine?.skills || []);
  }

  useEffect(() => {
    let active = true;
    Promise.all([backendApi.getSkills(), backendApi.getMySkills()])
      .then(([available, mine]) => {
        if (!active) return;
        setSkills(
          Array.isArray(available) ? available : available?.skills || [],
        );
        setMySkills(Array.isArray(mine) ? mine : mine?.skills || []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Scroll after React has rendered the selected skill form.
  useEffect(() => {
    if (!selected) return;
    const frame = requestAnimationFrame(() => {
      skillFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selected]);

  function selectSkill(skill) {
    const existing = mySkills.find((record) => record.skill_id === skill.id);
    setSelected(skill);
    setLevel(existing?.proficiency_level || "Beginner");
    setYears(existing?.years_experience ?? 0);
    setError("");
    setNotice("");
  }

  async function saveSkill(event) {
    event.preventDefault();
    if (!selected || saving) return;
    const record = mySkills.find((item) => item.skill_id === selected.id);
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        proficiency_level: level,
        years_experience: Number(years),
      };
      if (record) {
        await backendApi.updateMySkill(record.id, payload);
      } else {
        await backendApi.addMySkill({ skill_id: selected.id, ...payload });
      }
      await loadSkills();
      setNotice(
        `${selected.name} ${record ? "updated" : "added"} successfully.`,
      );
      setSelected(null);
      window.dispatchEvent(new Event("ctrlyourcareer:skills-changed"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeSkill() {
    const record = mySkills.find((item) => item.skill_id === selected?.id);
    if (
      !record ||
      saving ||
      !window.confirm(`Remove ${selected.name} from your skills?`)
    )
      return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await backendApi.deleteMySkill(record.id);
      await loadSkills();
      setNotice(`${selected.name} removed successfully.`);
      setSelected(null);
      window.dispatchEvent(new Event("ctrlyourcareer:skills-changed"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const selectedRecord = mySkills.find(
    (item) => item.skill_id === selected?.id,
  );

  return (
    <section className="explore-section dashboard-interactions">
      <div className="explore-heading">
        <div>
          <span className="section-label">
            <Sparkles size={15} /> YOUR SKILL LIBRARY
          </span>
          <h2>Available Skills</h2>
          <p>
            Select a skill to add it to your profile or update your proficiency.
          </p>
        </div>
        <span className="item-count">
          {mySkills.length} My Skills / {skills.length} Available
        </span>
      </div>

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
          {skills.map((skill) => {
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
                    {owned ? "MY SKILL" : "SKILL"}
                  </span>
                </div>
                <h3>{skill.name}</h3>
                <p>{skill.description || "Explore this skill."}</p>
                <div className="card-bottom">
                  <span>
                    {owned
                      ? `${owned.proficiency_level} · ${owned.years_experience} years`
                      : "Add to my skills"}
                  </span>
                  <ArrowUpRight size={19} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div ref={skillFormRef} className="dashboard-detail-panel">
          <div className="dashboard-detail-header">
            <h3>{selected.name}</h3>
            <button
              className="dashboard-secondary-button"
              type="button"
              onClick={() => setSelected(null)}
              disabled={saving}
            >
              Close
            </button>
          </div>
          <p>
            {selectedRecord
              ? "Update your skill details"
              : "Add this skill to your profile"}
          </p>
          <form className="dashboard-form" onSubmit={saveSkill}>
            <div className="dashboard-field">
              <label htmlFor="skill-level">Proficiency level</label>
              <select
                id="skill-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {LEVELS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="dashboard-field">
              <label htmlFor="skill-years">Years of experience</label>
              <input
                id="skill-years"
                type="number"
                min="0"
                step="1"
                required
                value={years}
                onChange={(e) => setYears(e.target.value)}
              />
            </div>
            <div className="dashboard-form-actions">
              <button
                className="dashboard-action-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : selectedRecord
                    ? "Update Skill"
                    : "Add Skill"}
              </button>{" "}
              {selectedRecord && (
                <button
                  className="dashboard-danger-button"
                  type="button"
                  onClick={removeSkill}
                  disabled={saving}
                >
                  Remove Skill
                </button>
              )}{" "}
              <button
                className="dashboard-secondary-button"
                type="button"
                onClick={() => {
                  setSelected(null);
                  setError("");
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
