import { useCallback, useEffect, useState } from "react";

import { BookOpen, Plus, Pencil, Trash2, Save, Search } from "lucide-react";

import { backendApi } from "../../services/backend";
import Modal from "../ui/Modal";

const emptyForm = {
  name: "",
  category: "",
  description: "",
};

export default function AdminSkillManager() {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD SKILLS
  // ============================================================

  const loadSkills = useCallback(async () => {
    try {
      setLoading(true);

      const data = await backendApi.getSkills();

      setSkills(Array.isArray(data) ? data : data?.skills || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  // ============================================================
  // OPEN CREATE POPUP
  // ============================================================

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  // ============================================================
  // OPEN EDIT POPUP
  // ============================================================

  function openEdit(skill) {
    setForm({
      name: skill.name || "",
      category: skill.category || "",
      description: skill.description || "",
    });

    setEditingId(skill.id);
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
    setEditingId(null);
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
  // CREATE OR UPDATE SKILL
  // ============================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setFormError("");
    setSuccess("");

    if (!form.name.trim()) {
      setFormError("Skill name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
    };

    try {
      setSaving(true);

      const isEditing = editingId !== null;

      if (isEditing) {
        await backendApi.adminUpdateSkill(editingId, payload);
      } else {
        await backendApi.adminCreateSkill(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      setSuccess(
        isEditing
          ? "Skill updated successfully."
          : "Skill created successfully.",
      );

      await loadSkills();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // DELETE SKILL
  // ============================================================

  async function handleDelete(skill) {
    if (deletingId !== null) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${skill.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(skill.id);
      setError("");
      setSuccess("");

      await backendApi.adminDeleteSkill(skill.id);

      setSuccess("Skill deleted successfully.");

      await loadSkills();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredSkills = skills.filter((skill) => {
    const value = search.toLowerCase();

    return (
      skill.name?.toLowerCase().includes(value) ||
      skill.category?.toLowerCase().includes(value)
    );
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="cyc-admin-manager">
      {/* HEADER */}

      <div className="cyc-admin-manager-header">
        <div>
          <h1>Manage Skills</h1>

          <p>
            Maintain the skills catalogue used for career recommendations and
            learning journeys.
          </p>
        </div>

        <button
          type="button"
          className="cyc-admin-primary-btn"
          onClick={openCreate}
        >
          <Plus size={18} />
          Add Skill
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

      {/* SEARCH */}

      <div className="cyc-admin-search">
        <Search size={19} />

        <input
          type="search"
          placeholder="Search skills..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {/* ======================================================
          CREATE / EDIT POPUP
      ====================================================== */}

      <Modal
        open={showForm}
        onClose={closeForm}
        busy={saving}
        title={editingId !== null ? "Edit Skill" : "Create Skill"}
      >
        {formError && (
          <div className="cyc-admin-alert error" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="cyc-admin-field">
            <label htmlFor="skill-name">Skill Name</label>

            <input
              id="skill-name"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="e.g. Python"
              required
            />
          </div>

          <div className="cyc-admin-field">
            <label htmlFor="skill-category">Category</label>

            <input
              id="skill-category"
              name="category"
              value={form.category}
              onChange={updateField}
              placeholder="e.g. Programming"
            />
          </div>

          <div className="cyc-admin-field">
            <label htmlFor="skill-description">Description</label>

            <textarea
              id="skill-description"
              name="description"
              rows="4"
              value={form.description}
              onChange={updateField}
              placeholder="Describe this skill..."
            />
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
              <Save size={17} />

              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save Changes"
                  : "Create Skill"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================
          SKILLS LIST
      ====================================================== */}

      {loading ? (
        <p className="cyc-admin-empty">Loading skills...</p>
      ) : filteredSkills.length === 0 ? (
        <p className="cyc-admin-empty">No skills found.</p>
      ) : (
        <div className="cyc-admin-manager-list">
          {filteredSkills.map((skill) => (
            <article key={skill.id} className="cyc-admin-manager-item">
              <div className="cyc-admin-item-icon">
                <BookOpen size={22} />
              </div>

              <div className="cyc-admin-item-content">
                <h3>{skill.name}</h3>

                <span className="cyc-admin-category">
                  {skill.category || "Uncategorized"}
                </span>

                <p>{skill.description || "No description provided."}</p>
              </div>

              <div className="cyc-admin-item-actions">
                <button
                  type="button"
                  className="cyc-admin-edit-btn"
                  onClick={() => openEdit(skill)}
                  aria-label={`Edit ${skill.name}`}
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  className="cyc-admin-delete-btn"
                  onClick={() => handleDelete(skill)}
                  disabled={deletingId !== null}
                  aria-label={`Delete ${skill.name}`}
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
