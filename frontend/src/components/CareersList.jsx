import { useCallback, useEffect, useRef, useState } from "react";

import {
  BriefcaseBusiness,
  ArrowUpRight,
  Compass,
  RefreshCw,
  GraduationCap,
  Clock3,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Rocket,
  BookOpen,
} from "lucide-react";

import { backendApi } from "../services/backend";
import Modal from "./ui/Modal";

import "./DashboardInteractions.css";

const FACTOR_LABELS = {
  skills: "Skills",
  education: "Education",
  experience: "Experience",
  interests: "Interests",
  goals: "Goals",
};

export default function CareersList({ onStartJourney }) {
  const [careers, setCareers] = useState([]);
  const [view, setView] = useState("recommended");
  const [selected, setSelected] = useState(null);
  const [gap, setGap] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [startingJourney, setStartingJourney] = useState(false);

  const [error, setError] = useState("");
  const [detailsError, setDetailsError] = useState("");

  // Prevent an older career request from overwriting a newer one.
  const requestIdRef = useRef(0);
  const selectedRef = useRef(null);

  // ============================================================
  // LOAD CAREER RECOMMENDATIONS
  // ============================================================

  const loadRecommendations = useCallback(async (refresh = false) => {
    setError("");

    try {
      const result = refresh
        ? await backendApi.refreshRecommendations()
        : await backendApi.getRecommendations();

      const list = Array.isArray(result)
        ? result
        : result?.recommendations || [];

      setCareers(list);

      return list;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    let active = true;

    backendApi
      .getRecommendations()
      .then((data) => {
        if (!active) return;

        setCareers(Array.isArray(data) ? data : data?.recommendations || []);
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

  // ============================================================
  // LOAD SELECTED CAREER'S SKILL GAP
  // ============================================================

  const loadCareerDetails = useCallback(async (careerId) => {
    const requestId = ++requestIdRef.current;

    setDetailsLoading(true);
    setDetailsError("");
    setGap(null);

    try {
      const result = await backendApi.getCareerSkillGap(careerId);

      // Ignore stale requests if the user selected another career.
      if (
        requestId !== requestIdRef.current ||
        selectedRef.current?.id !== careerId
      ) {
        return;
      }

      setGap(result);
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setDetailsError(err.message);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setDetailsLoading(false);
      }
    }
  }, []);

  // ============================================================
  // OPEN CAREER POPUP
  // ============================================================

  function openCareer(career) {
    selectedRef.current = career;

    setSelected(career);
    setDetailsError("");

    loadCareerDetails(career.id);
  }

  // ============================================================
  // CLOSE CAREER POPUP
  // ============================================================

  function closeCareerModal() {
    if (startingJourney) return;

    // Invalidate any pending skill-gap request.
    requestIdRef.current += 1;

    selectedRef.current = null;

    setSelected(null);
    setGap(null);
    setDetailsError("");
    setDetailsLoading(false);
  }

  // ============================================================
  // UPDATE RECOMMENDATIONS WHEN SKILLS CHANGE
  // ============================================================

  useEffect(() => {
    let active = true;

    const onSkillsChanged = async () => {
      if (!active) return;

      await loadRecommendations();

      const currentCareer = selectedRef.current;

      if (active && currentCareer) {
        await loadCareerDetails(currentCareer.id);
      }
    };

    window.addEventListener("ctrlyourcareer:skills-changed", onSkillsChanged);

    return () => {
      active = false;

      window.removeEventListener(
        "ctrlyourcareer:skills-changed",
        onSkillsChanged,
      );
    };
  }, [loadRecommendations, loadCareerDetails]);

  async function refresh() {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await loadRecommendations(true);

      const currentCareer = selectedRef.current;

      if (currentCareer) {
        await loadCareerDetails(currentCareer.id);
      }
    } finally {
      setRefreshing(false);
    }
  }

  // ============================================================
  // START LEARNING JOURNEY
  // ============================================================

  async function handleStartJourney() {
    if (!selected || startingJourney || typeof onStartJourney !== "function") {
      return;
    }

    try {
      setStartingJourney(true);
      setDetailsError("");

      await onStartJourney(selected.id);

      closeCareerAfterJourney();
    } catch (err) {
      setDetailsError(err.message || "Could not start the learning journey.");
    } finally {
      setStartingJourney(false);
    }
  }

  function closeCareerAfterJourney() {
    requestIdRef.current += 1;
    selectedRef.current = null;

    setSelected(null);
    setGap(null);
    setDetailsError("");
    setDetailsLoading(false);
  }

  // ============================================================
  // DISPLAY HELPERS
  // ============================================================

  function formatPercentage(value) {
    const numeric = Number(value);

    if (!Number.isFinite(numeric)) {
      return "N/A";
    }

    return `${Math.round(numeric)}%`;
  }

  function formatSkill(skill) {
    if (typeof skill === "string") {
      return skill;
    }

    return skill?.name || skill?.skill || "Unknown skill";
  }

  const recommendedCareers = careers.filter(
    (career) => career.industry_relevant === true,
  );
  const displayedCareers =
    view === "recommended" ? recommendedCareers : careers;

  const matchPercentage =
    gap?.match_percentage ?? selected?.match_percentage ?? 0;

  const matchedSkills = gap?.matched_skills || [];
  const missingSkills = gap?.missing_skills || [];
  const improvementSkills = gap?.improvement_skills || [];

  const hasRequirements = gap?.total_required_skills !== 0;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section className="explore-section dashboard-interactions">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="explore-heading">
        <div>
          <span className="section-label">
            <Compass size={15} />
            CAREER DISCOVERY
          </span>

          <h2>Discover Careers</h2>

          <p>
            Careers related to your onboarding interests come first. Explore
            every career anytime.
          </p>
        </div>

        <div className="dashboard-heading-actions">
          <span className="item-count">{careers.length} Careers</span>

          <button
            className="dashboard-secondary-button"
            type="button"
            onClick={refresh}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "cyc-career-spinning" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "16px 0" }}
        role="group"
        aria-label="Career views"
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
          Recommended for You ({recommendedCareers.length})
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
          Explore All ({careers.length})
        </button>
      </div>
      {!loading &&
        !error &&
        view === "recommended" &&
        recommendedCareers.length === 0 &&
        careers.length > 0 && (
          <p>
            No careers match your selected interests yet. Choose Explore All or
            update your interests in Settings.
          </p>
        )}
      {loading && <p>Loading career recommendations...</p>}

      {error && (
        <p role="alert" className="api-error">
          {error}
        </p>
      )}

      {!loading && !error && careers.length === 0 && (
        <p>No careers are available yet.</p>
      )}

      {/* ======================================================
          CAREER CARDS
      ====================================================== */}

      {!loading && (
        <div className="modern-card-grid">
          {displayedCareers.map((career) => (
            <button
              type="button"
              className="modern-item-card dashboard-card-button"
              key={career.id}
              onClick={() => openCareer(career)}
            >
              <div className="card-top">
                <div className="modern-icon career-icon">
                  <BriefcaseBusiness size={24} />
                </div>

                <span className="card-badge career-badge">
                  {formatPercentage(career.match_percentage)} MATCH
                </span>
              </div>

              <h3>{career.title || career.name}</h3>

              <p>{career.description || "Explore this career opportunity."}</p>

              <div className="card-bottom">
                <span>View career details and skill gap</span>
                <ArrowUpRight size={19} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ======================================================
          CAREER DETAILS POPUP
      ====================================================== */}

      <Modal
        open={Boolean(selected)}
        onClose={closeCareerModal}
        busy={startingJourney}
        title={selected?.title || selected?.name || "Career Details"}
        size="large"
      >
        <div className="cyc-career-modal">
          {/* CAREER SUMMARY */}

          <div className="cyc-career-modal-hero">
            <div className="cyc-career-modal-icon">
              <BriefcaseBusiness size={27} />
            </div>

            <div className="cyc-career-modal-hero-content">
              <span className="cyc-career-modal-eyebrow">CAREER OVERVIEW</span>

              <h3>{selected?.title || selected?.name}</h3>

              <p>
                {gap?.career?.category ||
                  selected?.category ||
                  "Career opportunity"}
              </p>
            </div>

            <div className="cyc-career-modal-match">
              <strong>{formatPercentage(matchPercentage)}</strong>

              <span>Career Match</span>
            </div>
          </div>

          {/* LOADING */}

          {detailsLoading && (
            <div className="cyc-career-modal-loading" role="status">
              <RefreshCw size={21} className="cyc-career-spinning" />

              <span>Loading career details and skill gaps...</span>
            </div>
          )}

          {/* ERROR */}

          {detailsError && (
            <div className="cyc-career-modal-error" role="alert">
              <AlertCircle size={18} />
              <span>{detailsError}</span>
            </div>
          )}

          {/* DETAILS */}

          {gap && !detailsLoading && (
            <>
              {/* DESCRIPTION */}

              <div className="cyc-career-modal-section">
                <h4>
                  <BookOpen size={18} />
                  About This Career
                </h4>

                <p className="cyc-career-modal-description">
                  {gap.career?.description ||
                    selected?.description ||
                    "No description available."}
                </p>
              </div>

              {/* CAREER INFORMATION */}

              <div className="cyc-career-modal-info-grid">
                <div className="cyc-career-modal-info-card">
                  <GraduationCap size={20} />

                  <span>Education</span>

                  <strong>
                    {gap.career?.education_requirements || "Not specified"}
                  </strong>
                </div>

                <div className="cyc-career-modal-info-card">
                  <Clock3 size={20} />

                  <span>Experience Level</span>

                  <strong>
                    {gap.career?.experience_level || "Not specified"}
                  </strong>
                </div>
              </div>

              {/* MATCH BREAKDOWN */}

              <div className="cyc-career-modal-section">
                <h4>
                  <Target size={18} />
                  Your Match Breakdown
                </h4>

                <div className="cyc-career-modal-factors">
                  {Object.entries(FACTOR_LABELS).map(([key, label]) => {
                    const rawScore = gap.factor_scores?.[key];

                    const score = Number(rawScore);

                    const valid =
                      rawScore !== null &&
                      rawScore !== undefined &&
                      Number.isFinite(score);

                    const width = valid ? Math.min(100, Math.max(0, score)) : 0;

                    return (
                      <div className="cyc-career-modal-factor" key={key}>
                        <div className="cyc-career-modal-factor-top">
                          <span>{label}</span>

                          <strong>
                            {valid ? formatPercentage(score) : "N/A"}
                          </strong>
                        </div>

                        <div className="cyc-career-modal-progress-track">
                          <div
                            className="cyc-career-modal-progress-fill"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MATCHING SKILLS */}

              <div className="cyc-career-modal-section">
                <h4>
                  <CheckCircle2 size={18} />
                  Matching Skills
                </h4>

                {matchedSkills.length ? (
                  <div className="cyc-career-modal-tags">
                    {matchedSkills.map((skill, index) => (
                      <span
                        className="cyc-career-modal-tag matched"
                        key={`${formatSkill(skill)}-${index}`}
                      >
                        <CheckCircle2 size={14} />
                        {formatSkill(skill)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="cyc-career-modal-muted">
                    No matched skills recorded.
                  </p>
                )}
              </div>

              {/* MISSING SKILLS */}

              <div className="cyc-career-modal-section">
                <h4>
                  <AlertCircle size={18} />
                  Missing Skills
                </h4>

                {missingSkills.length ? (
                  <div className="cyc-career-modal-tags">
                    {missingSkills.map((skill, index) => (
                      <span
                        className="cyc-career-modal-tag missing"
                        key={`${formatSkill(skill)}-${index}`}
                      >
                        <AlertCircle size={14} />
                        {formatSkill(skill)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="cyc-career-modal-muted">
                    No missing skills listed.
                  </p>
                )}
              </div>

              {/* SKILLS TO IMPROVE */}

              <div className="cyc-career-modal-section">
                <h4>
                  <TrendingUp size={18} />
                  Skills to Improve
                </h4>

                {improvementSkills.length ? (
                  <div className="cyc-career-modal-improvements">
                    {improvementSkills.map((item, index) => (
                      <div
                        className="cyc-career-modal-improvement"
                        key={`${item.skill}-${index}`}
                      >
                        <div>
                          <strong>{item.skill}</strong>
                          <span>Current: {item.current_level}</span>
                        </div>

                        <div className="cyc-career-modal-improvement-target">
                          <ArrowUpRight size={16} />

                          <span>{item.required_level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="cyc-career-modal-muted">
                    No proficiency gaps listed.
                  </p>
                )}
              </div>

              {/* MISSING REQUIREMENTS WARNING */}

              {!hasRequirements && (
                <div className="cyc-career-modal-warning">
                  <AlertCircle size={19} />

                  <p>
                    This career has no required skills linked yet, so skill-gap
                    results are incomplete.
                  </p>
                </div>
              )}

              {/* ACTIONS */}

              <div className="cyc-career-modal-actions">
                <button
                  type="button"
                  className="cyc-career-modal-close-btn"
                  onClick={closeCareerModal}
                  disabled={startingJourney}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="cyc-career-modal-start-btn"
                  onClick={handleStartJourney}
                  disabled={
                    startingJourney ||
                    !hasRequirements ||
                    typeof onStartJourney !== "function"
                  }
                >
                  <Rocket size={18} />

                  {startingJourney ? "Starting..." : "Start Learning Journey"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </section>
  );
}
