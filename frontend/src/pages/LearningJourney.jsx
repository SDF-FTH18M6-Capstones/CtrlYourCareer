import ResourceCompletion from "../components/ResourceCompletion";
import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  GraduationCap,
  Target,
  Trophy,
  AlertCircle,
  LoaderCircle,
  TrendingUp,
  Clock3,
} from "lucide-react";

import { backendApi } from "../services/backend";
import "./FeaturePages.css";

export default function LearningJourney({ journeyId, onBack }) {
  const [journey, setJourney] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  async function refresh() {
    const data = await backendApi.getJourney(journeyId);
    setJourney(data);
    return data;
  }

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setJourney(null);

    backendApi
      .getJourney(journeyId)
      .then((data) => {
        if (active) setJourney(data);
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
  }, [journeyId]);

  async function toggle(step) {
    if (updatingId !== null) return;

    setUpdatingId(step.id);
    setError("");

    try {
      await backendApi.updateJourneyStep(step.id, !step.completed);

      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <main className="cyc-page cyc-feature-page">
        <div className="cyc-feature-empty">
          <LoaderCircle className="cyc-feature-spin" size={30} />
          <p>Loading your learning journey...</p>
        </div>
      </main>
    );
  }

  if (!journey) {
    return (
      <main className="cyc-page cyc-feature-page">
        <button type="button" className="cyc-feature-back" onClick={onBack}>
          <ArrowLeft size={18} />
          My Journeys
        </button>

        <div className="cyc-feature-alert" role="alert">
          <AlertCircle size={19} />
          {error || "Learning journey not found."}
        </div>
      </main>
    );
  }

  const steps = journey.steps || [];

  const completedCount = steps.filter((step) => step.completed).length;

  const progress = steps.length
    ? Math.round((completedCount / steps.length) * 100)
    : 100;

  const matchPercentage = journey.skill_match_percentage;

  return (
    <main className="cyc-page cyc-feature-page">
      {/* BACK BUTTON */}

      <button type="button" className="cyc-feature-back" onClick={onBack}>
        <ArrowLeft size={18} />
        My Journeys
      </button>

      {/* HEADER */}

      <header className="cyc-feature-header">
        <div className="cyc-feature-heading-icon">
          <GraduationCap size={27} />
        </div>

        <div>
          <span className="cyc-feature-eyebrow">
            <Target size={14} />
            YOUR LEARNING ROADMAP
          </span>

          <h1>{journey.career?.title || "Learning Journey"}</h1>

          <p>
            {journey.career?.description ||
              "Build the skills needed for your chosen career."}
          </p>
        </div>
      </header>

      {/* ERROR */}

      {error && (
        <div className="cyc-feature-alert" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {/* PROGRESS DASHBOARD */}

      <section className="cyc-feature-progress-card">
        <div className="cyc-feature-progress-header">
          <div>
            <span className="cyc-feature-eyebrow">LEARNING PROGRESS</span>

            <h2>Your Journey Progress</h2>

            <p>Track your progress as you complete learning activities.</p>
          </div>

          <div className="cyc-feature-progress-percentage">{progress}%</div>
        </div>

        <div
          className="cyc-feature-progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Learning journey progress"
        >
          <div
            className="cyc-feature-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="cyc-feature-progress-stats">
          <div className="cyc-feature-stat">
            <CheckCircle2 size={19} />

            <span>
              <strong>{completedCount}</strong> of{" "}
              <strong>{steps.length}</strong> activities completed
            </span>
          </div>

          <div className="cyc-feature-stat">
            <TrendingUp size={19} />

            <span>
              Required skills met:{" "}
              <strong>
                {matchPercentage == null
                  ? "Not configured"
                  : `${matchPercentage}%`}
              </strong>
            </span>
          </div>
        </div>

        <div className="cyc-feature-progress-note">
          <AlertCircle size={17} />

          <p>
            Completing a lesson does not automatically certify proficiency or
            change your overall career match.
          </p>
        </div>
      </section>

      {/* ROADMAP HEADING */}

      <div className="cyc-feature-section-heading">
        <div>
          <span className="cyc-feature-eyebrow">YOUR ROADMAP</span>

          <h2>Skills to Develop</h2>

          <p>
            Complete each learning activity as you develop the skills required
            for your career.
          </p>
        </div>

        <span className="cyc-feature-count">
          {steps.length} {steps.length === 1 ? "Skill" : "Skills"}
        </span>
      </div>

      {/* ROADMAP */}

      <div className="cyc-feature-roadmap">
        {steps.map((step, index) => {
          const completed = Boolean(step.completed);
          const updating = updatingId === step.id;
          const resources = step.resources || [];

          return (
            <article
              className={`cyc-feature-step ${completed ? "is-completed" : ""}`}
              key={step.id}
            >
              {/* STEP NUMBER */}

              <div className="cyc-feature-step-marker">
                {completed ? (
                  <CheckCircle2 size={23} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* STEP CONTENT */}

              <div className="cyc-feature-step-content">
                <div className="cyc-feature-step-header">
                  <div>
                    <span className="cyc-feature-step-label">
                      SKILL {index + 1}
                    </span>

                    <h3>{step.skill?.name || "Unnamed Skill"}</h3>

                    <span className="cyc-feature-target">
                      <Target size={15} />
                      Target: {step.target_level || "Not specified"}
                    </span>
                  </div>

                  <span
                    className={`cyc-feature-status ${
                      completed ? "completed" : "pending"
                    }`}
                  >
                    {completed ? (
                      <>
                        <CheckCircle2 size={15} />
                        Completed
                      </>
                    ) : (
                      <>
                        <Clock3 size={15} />
                        In Progress
                      </>
                    )}
                  </span>
                </div>

                {/* COMPLETION CONTROL */}

                <label className="cyc-feature-completion">
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={() => toggle(step)}
                    disabled={updatingId !== null}
                  />

                  <span>
                    {updating
                      ? "Updating..."
                      : completed
                        ? "Learning activity completed"
                        : "Mark learning activity as completed"}
                  </span>
                </label>

                {/* RESOURCES */}

                <div className="cyc-feature-resources">
                  <h4>
                    <BookOpen size={18} />
                    Learning Resources
                  </h4>

                  {resources.length > 0 ? (
                    <div className="cyc-feature-resource-list">
                      {resources.map((resource) => (
                        <a
                          key={resource.id}
                          className="cyc-feature-resource"
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="cyc-feature-resource-icon">
                            <BookOpen size={19} />
                          </div>

                          <span>{resource.title || "Learning Resource"}</span>

                          <ExternalLink size={17} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="cyc-feature-no-resources">
                      <BookOpen size={20} />

                      <p>
                        Learning resources haven't been added by an
                        administrator yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* NO STEPS */}

      {steps.length === 0 && (
        <div className="cyc-feature-empty">
          <Trophy size={36} />

          <h3>You're all caught up!</h3>

          <p>All currently configured skill requirements are met.</p>
        </div>
      )}

      {/* COMPLETED MESSAGE */}

      {steps.length > 0 && progress === 100 && (
        <div className="cyc-feature-success">
          <Trophy size={25} />

          <div>
            <h3>Journey Activities Completed!</h3>

            <p>You've completed all the learning activities in this roadmap.</p>
          </div>
        </div>
      )}
    </main>
  );
}
