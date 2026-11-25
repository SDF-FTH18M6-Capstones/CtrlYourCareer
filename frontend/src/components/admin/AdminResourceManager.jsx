import { useCallback, useEffect, useState } from "react";

import { Library, Plus, Trash2, ExternalLink } from "lucide-react";

import { backendApi } from "../../services/backend";
import Modal from "../ui/Modal";

const emptyForm = {
  title: "",
  url: "",
  resource_type: "video",
};

export default function AdminResourceManager() {
  const [skills, setSkills] = useState([]);
  const [skillId, setSkillId] = useState("");
  const [resources, setResources] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD SKILLS
  // ============================================================

  useEffect(() => {
    async function loadSkills() {
      try {
        const data = await backendApi.getSkills();

        setSkills(Array.isArray(data) ? data : data?.skills || []);
      } catch (err) {
        setError(err.message);
      }
    }

    loadSkills();
  }, []);

  // ============================================================
  // LOAD RESOURCES
  // ============================================================

  const loadResources = useCallback(async () => {
    if (!skillId) {
      setResources([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await backendApi.getLearningResources(Number(skillId));

      setResources(Array.isArray(data) ? data : data?.resources || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // ============================================================
  // OPEN ADD RESOURCE POPUP
  // ============================================================

  function openCreate() {
    if (!skillId) {
      setError("Please select a skill first.");
      return;
    }

    setForm(emptyForm);
    setFormError("");
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  // ============================================================
  // CLOSE POPUP
  // ============================================================

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setForm(emptyForm);
    setFormError("");
  }

  // ============================================================
  // UPDATE FORM
  // ============================================================

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // ============================================================
  // ADD RESOURCE
  // ============================================================

  async function handleAdd(event) {
    event.preventDefault();

    if (saving) return;

    setFormError("");
    setSuccess("");

    if (!skillId) {
      setFormError("Please select a skill first.");
      return;
    }

    if (!form.title.trim() || !form.url.trim()) {
      setFormError("Resource title and URL are required.");
      return;
    }

    try {
      const parsedUrl = new URL(form.url.trim());

      if (parsedUrl.protocol !== "https:") {
        setFormError("Learning resource URLs must use HTTPS.");
        return;
      }
    } catch {
      setFormError("Enter a valid resource URL.");
      return;
    }

    try {
      setSaving(true);

      await backendApi.adminAddResource(Number(skillId), {
        title: form.title.trim(),
        url: form.url.trim(),
        resource_type: form.resource_type,
      });

      setShowForm(false);
      setForm(emptyForm);

      setSuccess("Learning resource added successfully.");

      await loadResources();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // DELETE RESOURCE
  // ============================================================

  async function handleDelete(resource) {
    if (deletingId !== null) return;

    const confirmed = window.confirm(`Delete "${resource.title}"?`);

    if (!confirmed) return;

    try {
      setDeletingId(resource.id);
      setError("");
      setSuccess("");

      await backendApi.adminDeleteResource(resource.id);

      setSuccess("Learning resource deleted successfully.");

      await loadResources();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="cyc-admin-manager">
      {/* HEADER */}

      <div className="cyc-admin-manager-header">
        <div>
          <h1>Learning Resources</h1>

          <p>
            Manage YouTube videos, articles, courses, and learning materials for
            each skill.
          </p>
        </div>

        <button
          type="button"
          className="cyc-admin-primary-btn"
          onClick={openCreate}
          disabled={!skillId}
        >
          <Plus size={18} />
          Add Resource
        </button>
      </div>

      {/* MESSAGES */}

      {error && (
        <div className="cyc-admin-alert error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="cyc-admin-alert success" role="status">
          {success}
        </div>
      )}

      {/* SELECT SKILL */}

      <div className="cyc-admin-field">
        <label htmlFor="resource-skill">Select Skill</label>

        <select
          id="resource-skill"
          value={skillId}
          onChange={(event) => {
            setSkillId(event.target.value);
            setResources([]);
            setShowForm(false);
            setError("");
            setSuccess("");
          }}
        >
          <option value="">Choose a skill...</option>

          {skills.map((skill) => (
            <option key={skill.id} value={skill.id}>
              {skill.name}
            </option>
          ))}
        </select>
      </div>

      {/* ======================================================
          ADD RESOURCE POPUP
      ====================================================== */}

      <Modal
        open={showForm}
        onClose={closeForm}
        busy={saving}
        title="Add Learning Resource"
      >
        {formError && (
          <div className="cyc-admin-alert error" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleAdd}>
          <div className="cyc-admin-field">
            <label htmlFor="resource-title">Resource Title</label>

            <input
              id="resource-title"
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="e.g. Python for Beginners"
              required
            />
          </div>

          <div className="cyc-admin-field">
            <label htmlFor="resource-url">Resource URL</label>

            <input
              id="resource-url"
              name="url"
              type="url"
              value={form.url}
              onChange={updateField}
              placeholder="https://..."
              required
            />
          </div>

          <div className="cyc-admin-field">
            <label htmlFor="resource-type">Resource Type</label>

            <select
              id="resource-type"
              name="resource_type"
              value={form.resource_type}
              onChange={updateField}
            >
              <option value="video">Video</option>
              <option value="article">Article</option>
              <option value="course">Course</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>

          <div className="cyc-admin-form-actions">
            <button
              type="button"
              className="cyc-admin-secondary-btn"
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="cyc-admin-primary-btn"
              disabled={saving}
            >
              <Plus size={17} />

              {saving ? "Saving..." : "Add Resource"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================
          RESOURCES LIST
      ====================================================== */}

      {!skillId ? (
        <p className="cyc-admin-empty">
          Select a skill to view its learning resources.
        </p>
      ) : loading ? (
        <p className="cyc-admin-empty">Loading learning resources...</p>
      ) : resources.length === 0 ? (
        <p className="cyc-admin-empty">
          No learning resources have been added for this skill.
        </p>
      ) : (
        <div className="cyc-admin-manager-list">
          {resources.map((resource) => (
            <article key={resource.id} className="cyc-admin-manager-item">
              <div className="cyc-admin-item-icon">
                <Library size={22} />
              </div>

              <div className="cyc-admin-item-content">
                <h3>{resource.title}</h3>

                <span className="cyc-admin-category">
                  {resource.resource_type || "Resource"}
                </span>

                <p>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Resource
                    <ExternalLink size={14} />
                  </a>
                </p>
              </div>

              <div className="cyc-admin-item-actions">
                <button
                  type="button"
                  className="cyc-admin-delete-btn"
                  onClick={() => handleDelete(resource)}
                  disabled={deletingId !== null}
                  aria-label={`Delete ${resource.title}`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
