import { useCallback, useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, ArrowUpRight, Compass } from "lucide-react";
import { backendApi } from "../services/backend";
import "./DashboardInteractions.css";

const FACTOR_LABELS = {
  skills: "Skills",
  education: "Education",
  experience: "Experience",
  interests: "Interests",
  goals: "Goals",
};

export default function CareersList() {
  const careerDetailsRef = useRef(null);
  const [careers, setCareers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [gap, setGap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [detailsError, setDetailsError] = useState("");

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

  useEffect(() => {
    let active = true;
    backendApi
      .getRecommendations()
      .then((data) => {
        if (active)
          setCareers(Array.isArray(data) ? data : data?.recommendations || []);
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

  useEffect(() => {
    const onSkillsChanged = async () => {
      await loadRecommendations();
      if (selected) {
        try {
          const updated = await backendApi.getCareerSkillGap(selected.id);
          setGap(updated);
        } catch (err) {
          setDetailsError(err.message);
        }
      }
    };
    window.addEventListener("ctrlyourcareer:skills-changed", onSkillsChanged);
    return () =>
      window.removeEventListener(
        "ctrlyourcareer:skills-changed",
        onSkillsChanged,
      );
  }, [loadRecommendations, selected]);

  // Scroll after React has rendered the selected career's details panel.
  useEffect(() => {
    if (!selected) return;
    const frame = requestAnimationFrame(() => {
      careerDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selected?.id]);

  async function openCareer(career) {
    setSelected(career);
    setGap(null);
    setDetailsError("");
    setDetailsLoading(true);
    try {
      setGap(await backendApi.getCareerSkillGap(career.id));
    } catch (err) {
      setDetailsError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await loadRecommendations(true);
      if (selected) setGap(await backendApi.getCareerSkillGap(selected.id));
    } catch (err) {
      setDetailsError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <section className="explore-section dashboard-interactions">
      <div className="explore-heading">
        <div>
          <span className="section-label">
            <Compass size={15} /> CAREER DISCOVERY
          </span>
          <h2>Explore Careers</h2>
          <p>
            Discover opportunities ranked by your personalised career match.
          </p>
        </div>
        <div className="dashboard-heading-actions">
          <span className="item-count">{careers.length} Careers</span>{" "}
          <button
            className="dashboard-secondary-button"
            type="button"
            onClick={refresh}
            disabled={loading || refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh Matches"}
          </button>
        </div>
      </div>

      {loading && <p>Loading career recommendations...</p>}
      {error && (
        <p role="alert" className="api-error">
          {error}
        </p>
      )}
      {!loading && !error && careers.length === 0 && (
        <p>No careers are available yet.</p>
      )}

      {!loading && (
        <div className="modern-card-grid">
          {careers.map((career) => (
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
                  {career.match_percentage}% MATCH
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

      {selected && (
        <div className="dashboard-detail-panel">
          <div className="dashboard-detail-header">
            <h3>{selected.title}</h3>
            <button
              className="dashboard-secondary-button"
              type="button"
              onClick={() => {
                setSelected(null);
                setGap(null);
              }}
            >
              Close
            </button>
          </div>
          {detailsLoading && <p>Loading skill gap...</p>}
          {detailsError && (
            <p role="alert" className="api-error">
              {detailsError}
            </p>
          )}
          {gap && (
            <div>
              <p className="dashboard-match">
                {gap.match_percentage}% Career match
              </p>
              <p>{gap.career?.description || selected.description}</p>
              <p>
                <strong>Category:</strong>{" "}
                {gap.career?.category || "Not specified"}
              </p>
              <p>
                <strong>Education:</strong>{" "}
                {gap.career?.education_requirements || "Not specified"}
              </p>
              <p>
                <strong>Experience level:</strong>{" "}
                {gap.career?.experience_level || "Not specified"}
              </p>
              <h4>Match breakdown</h4>
              <div className="dashboard-factors">
                {Object.entries(FACTOR_LABELS).map(([key, label]) => (
                  <div className="dashboard-factor" key={key}>
                    <span>{label}</span>
                    <strong>{gap.factor_scores?.[key] ?? "N/A"}%</strong>
                  </div>
                ))}
              </div>
              <h4>Matching skills</h4>
              <p>
                {gap.matched_skills?.length
                  ? gap.matched_skills.join(", ")
                  : "No matched skills recorded."}
              </p>
              <h4>Missing skills</h4>
              <p>
                {gap.missing_skills?.length
                  ? gap.missing_skills.join(", ")
                  : "No missing skills listed."}
              </p>
              <h4>Skills to improve</h4>
              {gap.improvement_skills?.length ? (
                <ul>
                  {gap.improvement_skills.map((item) => (
                    <li key={item.skill}>
                      {item.skill}: {item.current_level} → {item.required_level}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No proficiency gaps listed.</p>
              )}
              {gap.total_required_skills === 0 && (
                <p>
                  <em>
                    This career has no required skills linked yet, so skill-gap
                    results are incomplete.
                  </em>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
