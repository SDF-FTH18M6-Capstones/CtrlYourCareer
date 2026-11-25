import { useCallback, useEffect, useState } from "react";

import {
  BriefcaseBusiness,
  Plus,
  Pencil,
  Trash2,
  Save,
  Search,
} from "lucide-react";

import { backendApi } from "../../services/backend";
import Modal from "../ui/Modal";

const emptyForm = {
  title: "",
  category: "",
  description: "",
};

export default function AdminCareerManager() {
  const [careers, setCareers] = useState([]);
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
  // LOAD CAREERS
  // ============================================================

  const loadCareers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await backendApi.getCareers();

      setCareers(Array.isArray(data) ? data : data?.careers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCareers();
  }, [loadCareers]);

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

  function openEdit(career) {
    setForm({
      title: career.title || "",
      category: career.category || "",
      description: career.description || "",
    });

    setEditingId(career.id);
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
  // CREATE OR UPDATE CAREER
  // ============================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setFormError("");
    setSuccess("");

    if (!form.title.trim()) {
      setFormError("Career title is required.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
    };

    try {
      setSaving(true);

      const isEditing = editingId !== null;

      if (isEditing) {
        await backendApi.adminUpdateCareer(editingId, payload);
      } else {
        await backendApi.adminCreateCareer(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      setSuccess(
        isEditing
          ? "Career updated successfully."
          : "Career created successfully.",
      );

      await loadCareers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // DELETE CAREER
  // ============================================================

  async function handleDelete(career) {
    if (deletingId !== null) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${career.title}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(career.id);
      setError("");
      setSuccess("");

      await backendApi.adminDeleteCareer(career.id);

      setSuccess("Career deleted successfully.");

      await loadCareers();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredCareers = careers.filter((career) => {
    const value = search.toLowerCase();

    return (
      career.title?.toLowerCase().includes(value) ||
      career.category?.toLowerCase().includes(value)
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
          <h1>Manage Careers</h1>

          <p>
            Create, update, and organize career paths available on
            CtrlYourCareer.
          </p>
        </div>

        <button
          type="button"
          className="cyc-admin-primary-btn"
          onClick={openCreate}
        >
          <Plus size={18} />
          Add Career
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
          placeholder="Search careers..."
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
        title={editingId !== null ? "Edit Career" : "Create Career"}
      >
        {formError && (
          <div className="cyc-admin-alert error" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="cyc-admin-field">
            <label htmlFor="career-title">Career Title</label>

            <input
              id="career-title"
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>

          <div className="cyc-admin-field">
            <label htmlFor="career-category">Category</label>

            <input
              id="career-category"
              name="category"
              value={form.category}
              onChange={updateField}
              placeholder="e.g. Technology"
            />
          </div>

          <div className="cyc-admin-field">
            <label htmlFor="career-description">Description</label>

            <textarea
              id="career-description"
              name="description"
              rows="4"
              value={form.description}
              onChange={updateField}
              placeholder="Describe this career..."
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
                  : "Create Career"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================
          CAREER LIST
      ====================================================== */}

      {loading ? (
        <p className="cyc-admin-empty">Loading careers...</p>
      ) : filteredCareers.length === 0 ? (
        <p className="cyc-admin-empty">No careers found.</p>
      ) : (
        <div className="cyc-admin-manager-list">
          {filteredCareers.map((career) => (
            <article key={career.id} className="cyc-admin-manager-item">
              <div className="cyc-admin-item-icon">
                <BriefcaseBusiness size={22} />
              </div>

              <div className="cyc-admin-item-content">
                <h3>{career.title}</h3>

                <span className="cyc-admin-category">
                  {career.category || "Uncategorized"}
                </span>

                <p>{career.description || "No description provided."}</p>
              </div>

              <div className="cyc-admin-item-actions">
                <button
                  type="button"
                  className="cyc-admin-edit-btn"
                  onClick={() => openEdit(career)}
                  aria-label={`Edit ${career.title}`}
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  className="cyc-admin-delete-btn"
                  onClick={() => handleDelete(career)}
                  disabled={deletingId !== null}
                  aria-label={`Delete ${career.title}`}
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
