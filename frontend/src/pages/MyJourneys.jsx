import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Sparkles,
  AlertCircle,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import { backendApi } from "../services/backend";
import "./FeaturePages.css";
import Modal from "../components/ui/Modal";
import "./JourneyRemoval.css";

export default function MyJourneys({ onBack, onOpen }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [notice, setNotice] = useState("");

  async function removeJourney() {
    if (!selected || removing) return;
    setRemoving(true);
    setRemoveError("");
    try {
      await backendApi.deleteJourney(selected.id);
      setItems((previous) =>
        previous.filter((item) => item.id !== selected.id),
      );
      setSelected(null);
      setNotice("Learning journey removed successfully.");
    } catch (err) {
      setRemoveError(err.message);
    } finally {
      setRemoving(false);
    }
  }

  useEffect(() => {
    let active = true;

    backendApi
      .getMyJourneys()
      .then((data) => {
        if (!active) return;

        setItems(Array.isArray(data) ? data : data?.journeys || []);
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

  return (
    <main className="cyc-page cyc-feature-page">
      {/* BACK BUTTON */}

      <button type="button" className="cyc-feature-back" onClick={onBack}>
        <ArrowLeft size={18} />
        Dashboard
      </button>

      {/* HEADER */}

      <header className="cyc-feature-header">
        <div className="cyc-feature-heading-icon">
          <GraduationCap size={27} />
        </div>

        <div>
          <span className="cyc-feature-eyebrow">
            <Sparkles size={14} />
            YOUR CAREER DEVELOPMENT
          </span>

          <h1>My Learning Journeys</h1>

          <p>
            Continue building your skills and move closer to your career goals.
          </p>
        </div>
      </header>

      {/* SUMMARY */}

      <div className="cyc-feature-summary">
        <div className="cyc-feature-summary-icon">
          <BookOpen size={24} />
        </div>

        <div>
          <span>YOUR LEARNING PATHS</span>

          <strong>{items.length}</strong>

          <p>
            {items.length === 1
              ? "Career journey started"
              : "Career journeys started"}
          </p>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="cyc-feature-alert" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="cyc-feature-success" role="status">
          {notice}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="cyc-feature-empty">
          <LoaderCircle className="cyc-feature-spin" size={30} />

          <p>Loading your learning journeys...</p>
        </div>
      )}

      {/* EMPTY STATE */}

      {!loading && items.length === 0 && (
        <div className="cyc-feature-empty">
          <Compass size={36} />

          <h3>No learning journeys yet</h3>

          <p>
            Start exploring careers to create your first personalized learning
            roadmap.
          </p>
        </div>
      )}

      {/* JOURNEY CARDS */}

      {!loading && items.length > 0 && (
        <div className="cyc-feature-grid">
          {items.map((journey) => (
            <article className="cyc-feature-journey-card" key={journey.id}>
              <div className="cyc-feature-card-top">
                <div className="cyc-feature-card-icon">
                  <GraduationCap size={25} />
                </div>

                <span className="cyc-feature-category">LEARNING JOURNEY</span>
              </div>

              <div className="cyc-feature-card-content">
                <h2>{journey.career?.title || "Career Journey"}</h2>

                <p>
                  {journey.career?.description ||
                    "Continue developing the skills needed for this career."}
                </p>
              </div>

              <button
                type="button"
                className="cyc-feature-primary-btn"
                onClick={() => onOpen(journey.id)}
              >
                <BookOpen size={18} />
                Continue Journey
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="cyc-journey-remove"
                onClick={() => {
                  setSelected(journey);
                  setRemoveError("");
                  setNotice("");
                }}
              >
                <Trash2 size={17} /> Remove Journey
              </button>
            </article>
          ))}
        </div>
      )}
      <Modal
        open={Boolean(selected)}
        busy={removing}
        size="small"
        title="Remove learning journey?"
        onClose={() => {
          if (!removing) setSelected(null);
        }}
      >
        <div className="cyc-journey-confirm">
          <p>
            Remove <strong>{selected?.career?.title || "this career"}</strong>{" "}
            from your learning journeys?
          </p>
          <p>
            Your roadmap and its activity progress will be deleted. Your
            personal skills and individual resource completions will be
            preserved. You can start this journey again later.
          </p>
          {removeError && (
            <div className="cyc-feature-alert" role="alert">
              {removeError}
            </div>
          )}
          <div className="cyc-journey-actions">
            <button
              type="button"
              className="cyc-journey-cancel"
              disabled={removing}
              onClick={() => setSelected(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="cyc-journey-danger"
              disabled={removing}
              onClick={removeJourney}
            >
              <Trash2 size={17} /> {removing ? "Removing..." : "Remove Journey"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
