import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Search,
  Compass,
  Rocket,
  Sparkles,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { backendApi } from "../services/backend";
import "./FeaturePages.css";

export default function CareerExplorer({ onBack, onStartJourney }) {
  const [careers, setCareers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    let active = true;

    backendApi
      .getCareers()
      .then((data) => {
        if (!active) return;

        setCareers(Array.isArray(data) ? data : data?.careers || []);
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

  const filteredCareers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return careers;

    return careers.filter((career) => {
      const title = career.title || career.name || "";
      const description = career.description || "";
      const category = career.category || "";

      return [title, description, category].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [careers, search]);

  async function handleStartJourney(careerId) {
    if (startingId !== null) return;

    setStartingId(careerId);
    setError("");

    try {
      await onStartJourney(careerId);
    } catch (err) {
      setError(err.message || "Could not start the learning journey.");
    } finally {
      setStartingId(null);
    }
  }

  return (
    <main className="cyc-page cyc-feature-page">
      {/* BACK BUTTON */}

      <button type="button" className="cyc-feature-back" onClick={onBack}>
        <ArrowLeft size={18} />
        Dashboard
      </button>

      {/* PAGE HEADER */}

      <header className="cyc-feature-header">
        <div className="cyc-feature-heading-icon">
          <Compass size={25} />
        </div>

        <div>
          <span className="cyc-feature-eyebrow">
            <Sparkles size={14} />
            DISCOVER YOUR FUTURE
          </span>

          <h1>Career Explorer</h1>

          <p>
            Discover career opportunities and build a personalized learning
            roadmap toward your goals.
          </p>
        </div>
      </header>

      {/* SEARCH */}

      <section className="cyc-feature-toolbar">
        <div className="cyc-feature-search">
          <Search size={20} />

          <input
            type="search"
            placeholder="Search careers, categories, or keywords..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search careers"
          />
        </div>

        <span className="cyc-feature-count">
          {filteredCareers.length}{" "}
          {filteredCareers.length === 1 ? "Career" : "Careers"}
        </span>
      </section>

      {/* ERROR */}

      {error && (
        <div className="cyc-feature-alert" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="cyc-feature-empty">
          <LoaderCircle className="cyc-feature-spin" size={28} />
          <p>Loading career opportunities...</p>
        </div>
      )}

      {/* EMPTY STATE */}

      {!loading && filteredCareers.length === 0 && (
        <div className="cyc-feature-empty">
          <Search size={32} />

          <h3>{search ? "No matching careers" : "No careers available"}</h3>

          <p>
            {search
              ? "Try searching for a different career or keyword."
              : "Career opportunities will appear here when available."}
          </p>
        </div>
      )}

      {/* CAREER CARDS */}

      {!loading && filteredCareers.length > 0 && (
        <div className="cyc-feature-grid">
          {filteredCareers.map((career) => {
            const isStarting = startingId === career.id;

            return (
              <article className="cyc-feature-career-card" key={career.id}>
                <div className="cyc-feature-card-top">
                  <div className="cyc-feature-card-icon">
                    <BriefcaseBusiness size={25} />
                  </div>

                  {career.category && (
                    <span className="cyc-feature-category">
                      {career.category}
                    </span>
                  )}
                </div>

                <div className="cyc-feature-card-content">
                  <h2>{career.title || career.name}</h2>

                  <p>
                    {career.description ||
                      "Explore this career and develop the skills needed to succeed."}
                  </p>
                </div>

                <button
                  type="button"
                  className="cyc-feature-primary-btn"
                  onClick={() => handleStartJourney(career.id)}
                  disabled={
                    startingId !== null || typeof onStartJourney !== "function"
                  }
                >
                  {isStarting ? (
                    <>
                      <LoaderCircle size={18} className="cyc-feature-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Rocket size={18} />
                      Start Learning Journey
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
