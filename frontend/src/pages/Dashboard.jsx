import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Code2,
  LogOut,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useRef } from "react";

import SkillsList from "../components/SkillsList";
import CareersList from "../components/CareersList";
import Brand from "../components/Brand";
import { roles, goals } from "../data/onboardingOptions";
import { demo } from "../api";

export default function Dashboard({
  user,
  onLogout,
  onSettings,
  onExploreCareers,
  onOpenJourneys,
  onStartJourney,
}) {
  const skillsRef = useRef(null);
  const careersRef = useRef(null);

  const displayName = user.name || user.username || "Explorer";
  const first = displayName.split(" ")[0];

  const roleName = roles.find((r) => r.id === user.role)?.title || "Explorer";

  const goalName = goals.find((g) => g.id === user.goal)?.title || "Explore";

  // Scroll to a specific section within the Dashboard.
  const scrollToSection = (sectionRef) => {
    if (!sectionRef.current) return;

    const element = sectionRef.current;

    const targetPosition =
      element.getBoundingClientRect().top + window.scrollY - 90;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  };

  const nextSteps = [
    {
      Icon: Target,
      title: "Explore careers",
      description: "Discover possible career paths and what they require.",
      actionLabel: "Explore careers",

      // Open the separate Career Explorer page through App.jsx.
      onClick: onExploreCareers,

      available: true,
    },
    {
      Icon: Code2,
      title: "My skills map",
      description:
        "Find skills recommended for your interests and build your knowledge.",
      actionLabel: "View skills",

      // Scroll to the Skills section within the Dashboard.
      onClick: () => scrollToSection(skillsRef),

      available: true,
    },
    {
      Icon: BookOpen,
      title: "Learning journey",
      description: "Plan what you want to learn next.",
      actionLabel: "View my journeys",
      onClick: onOpenJourneys,
      available: true,
    },
  ];

  return (
    <div className="dashboard">
      <header className="dash-header">
        <Brand />

        <div className="dash-user">
          <button
            type="button"
            className="profile-trigger"
            onClick={onSettings}
            aria-label="Open account settings"
          >
            <span className="user-avatar">{first[0].toUpperCase()}</span>

            <span>{first}</span>

            <span aria-hidden="true">⌄</span>
          </button>

          <button type="button" className="btn btn-quiet" onClick={onLogout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </header>

      <main className="dash-main">
        <div className="welcome">
          <div>
            <span className="eyebrow dark">
              <Sparkles size={15} />
              YOUR PERSONAL DASHBOARD
            </span>

            <h1>
              You're all set, {first}! <span>✦</span>
            </h1>

            <p>
              Your journey starts here. Explore your next steps at your own
              pace.
            </p>
          </div>

          <div className="ready-pill">
            <CheckCircle2 size={17} />
            Welcome! Your profile is ready.
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card profile-card">
            <span className="dash-card-label">YOUR PROFILE</span>

            <div className="profile-head">
              <div className="profile-avatar">{first[0].toUpperCase()}</div>

              <div>
                <h2>{displayName}</h2>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="profile-meta">
              <div>
                <span>Account type</span>
                <strong>{roleName}</strong>
              </div>

              <div>
                <span>Main goal</span>
                <strong>{goalName}</strong>
              </div>
            </div>
          </div>

          <div className="dash-card focus-card">
            <span className="dash-card-label">YOUR FOCUS AREAS</span>

            <h2>What you're curious about</h2>

            <div className="tag-list">
              {user.interests?.map((interest) => (
                <span key={interest}>{interest}</span>
              ))}
            </div>

            <p>
              Your career and skill recommendations are based on these
              interests. Update them in Settings anytime.
            </p>
          </div>
        </div>

        <h2 className="dash-section-title">Where to next?</h2>

        <div className="next-grid">
          {nextSteps.map(
            ({ Icon, title, description, actionLabel, onClick, available }) => (
              <div className="next-card" key={title}>
                <span className="next-icon">
                  <Icon size={24} />
                </span>

                <h3>{title}</h3>

                <p>{description}</p>

                {available ? (
                  <button
                    type="button"
                    className="coming"
                    onClick={onClick}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      fontWeight: 600,
                      lineHeight: 1.4,
                      color: "inherit",
                    }}
                  >
                    {actionLabel}
                    <ArrowUpRight size={15} />
                  </button>
                ) : (
                  <span className="coming">{actionLabel}</span>
                )}
              </div>
            ),
          )}
        </div>

        <div className="demo-banner">
          <ShieldCheck size={19} />

          <span>
            {demo
              ? "You’re exploring the interactive frontend demo. Connect the Flask API to save accounts securely and activate real features."
              : "Your account is connected and ready to go! Explore career opportunities, discover valuable skills, and take the next step in your career journey."}
          </span>
        </div>

        <div className="dashboard-api-content">
          {/* Skills section */}
          <div
            ref={skillsRef}
            id="dashboard-skills"
            style={{
              scrollMarginTop: "90px",
            }}
          >
            <SkillsList />
          </div>

          {/* Careers section */}
          <div
            ref={careersRef}
            id="dashboard-careers"
            style={{
              scrollMarginTop: "90px",
            }}
          >
            <CareersList onStartJourney={onStartJourney} />
          </div>
        </div>
      </main>
    </div>
  );
}
