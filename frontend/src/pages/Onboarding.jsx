import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  LogOut,
  Sparkles,
  BookOpen,
  TrendingUp,
  Compass,
  GraduationCap,
  Target,
} from "lucide-react";

import { api } from "../api";
import Brand from "../components/Brand";
import Option from "../components/Option";

import { roles, goals, interests } from "../data/onboardingOptions";

const educationLevels = [
  {
    id: "high-school",
    title: "High School",
    desc: "Secondary school education.",
  },
  {
    id: "certificate",
    title: "Certificate",
    desc: "Professional or technical certificate.",
  },
  {
    id: "diploma",
    title: "Diploma",
    desc: "College or technical diploma.",
  },
  {
    id: "undergraduate",
    title: "Undergraduate",
    desc: "Bachelor's degree studies.",
  },
  {
    id: "graduate",
    title: "Graduate",
    desc: "Completed a university degree.",
  },
  {
    id: "postgraduate",
    title: "Postgraduate",
    desc: "Master's or doctoral studies.",
  },
  {
    id: "other",
    title: "Other",
    desc: "Another educational background.",
  },
];

export default function Onboarding({ user, token, onComplete, onLogout }) {
  const [step, setStep] = useState(0);

  const [role, setRole] = useState(user.role || "");

  const [educationLevel, setEducationLevel] = useState(
    user.education_level || "",
  );

  const [course, setCourse] = useState(user.course || "");

  const [goal, setGoal] = useState(user.goal || "");

  const [experience, setExperience] = useState(user.experience || "");

  const [experienceDetails, setExperienceDetails] = useState(
    user.experience_details || "",
  );

  const [chosen, setChosen] = useState(user.interests || []);

  const [shortTermGoal, setShortTermGoal] = useState(
    user.short_term_goal || "",
  );

  const [longTermGoal, setLongTermGoal] = useState(user.long_term_goal || "");

  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);

  const valid = [
    !!role,
    !!educationLevel,
    !!goal,
    !!experience,
    chosen.length > 0,
    !!shortTermGoal.trim() && !!longTermGoal.trim(),
  ][step];

  async function next() {
    setError("");

    if (!valid) {
      return setError("Please complete this section.");
    }

    if (step < 5) {
      setStep(step + 1);
      return;
    }

    setBusy(true);

    try {
      const result = await api.onboard(token, {
        role,

        education_level: educationLevel,

        course,

        goal,

        experience,

        experience_details: experienceDetails,

        interests: chosen,

        short_term_goal: shortTermGoal,

        long_term_goal: longTermGoal,
      });

      onComplete(result.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "14px",
    border: "1px solid #dce1e8",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div className="onboarding-shell">
      <header className="onboard-header">
        <Brand />

        <div className="onboard-right">
          <span>
            Hi, {(user.name || user.username || "Explorer").split(" ")[0]} 👋
          </span>

          <button onClick={onLogout} className="text-action">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <div className="onboard-body">
        <div className="onboard-top">
          <div>
            <span className="eyebrow dark">LET'S MAKE IT PERSONAL</span>

            <h1>
              Tell us a little
              <br />
              <span>about yourself.</span>
            </h1>

            <p>
              Help us understand your background, interests and career ambitions
              so we can build a journey around you.
            </p>
          </div>

          <div className="step-indicator">
            STEP <strong>{step + 1}</strong> OF 6
          </div>
        </div>

        <div className="step-progress">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={i <= step ? "active" : ""} />
          ))}
        </div>

        <div className="question-card">
          <div className="question-kicker">
            {
              [
                "YOUR BACKGROUND",
                "YOUR EDUCATION",
                "YOUR MAIN GOAL",
                "YOUR EXPERIENCE",
                "YOUR INTERESTS",
                "YOUR CAREER PLAN",
              ][step]
            }
          </div>

          <h2>
            {
              [
                "Which best describes you?",
                "Tell us about your education.",
                "What brings you here today?",
                "Where are you in your journey?",
                "What fields interest you?",
                "Where do you want to go?",
              ][step]
            }
          </h2>

          <p className="question-sub">
            {
              [
                "Let's understand your current situation.",
                "Your educational background helps us identify suitable career paths.",
                "Choose what you want to achieve with CtrlYourCareer.",
                "Tell us about your current professional experience.",
                "Select all the industries that interest you.",
                "Tell us about your short-term and long-term ambitions.",
              ][step]
            }
          </p>

          {/* STEP 1: ROLE */}

          {step === 0 && (
            <div className="option-grid">
              {roles.map((item) => (
                <Option
                  key={item.id}
                  item={item}
                  selected={role === item.id}
                  onClick={() => setRole(item.id)}
                />
              ))}
            </div>
          )}

          {/* STEP 2: EDUCATION */}

          {step === 1 && (
            <div>
              <div className="option-grid">
                {educationLevels.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      "interest " +
                      (educationLevel === item.id ? "selected" : "")
                    }
                    onClick={() => setEducationLevel(item.id)}
                  >
                    <GraduationCap size={18} />

                    {item.title}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontWeight: 600,
                  }}
                >
                  Course or field of study (optional)
                </label>

                <input
                  type="text"
                  placeholder="e.g. Computer Science, Business Administration..."
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  maxLength={150}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* STEP 3: MAIN GOAL */}

          {step === 2 && (
            <div className="option-grid">
              {goals.map((item) => (
                <Option
                  key={item.id}
                  item={item}
                  selected={goal === item.id}
                  onClick={() => setGoal(item.id)}
                />
              ))}
            </div>
          )}

          {/* STEP 4: EXPERIENCE */}

          {step === 3 && (
            <div>
              <div className="option-grid">
                {[
                  {
                    id: "starting",
                    icon: Sparkles,
                    title: "Just getting started",
                    desc: "I'm new to this and exploring my options.",
                  },
                  {
                    id: "building",
                    icon: BookOpen,
                    title: "Building my skills",
                    desc: "I have some experience and want to improve.",
                  },
                  {
                    id: "experienced",
                    icon: TrendingUp,
                    title: "Ready for my next move",
                    desc: "I have experience and a goal in mind.",
                  },
                  {
                    id: "transitioning",
                    icon: Compass,
                    title: "Changing direction",
                    desc: "I'm considering a new field or career.",
                  },
                ].map((item) => (
                  <Option
                    key={item.id}
                    item={item}
                    selected={experience === item.id}
                    onClick={() => setExperience(item.id)}
                  />
                ))}
              </div>

              <div style={{ marginTop: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontWeight: 600,
                  }}
                >
                  Tell us more about your experience (optional)
                </label>

                <textarea
                  value={experienceDetails}
                  onChange={(e) => setExperienceDetails(e.target.value)}
                  placeholder="Mention internships, previous jobs, personal projects or relevant experience..."
                  maxLength={2000}
                  rows={4}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* STEP 5: INTERESTS */}

          {step === 4 && (
            <div className="interest-grid">
              {interests.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    "interest " + (chosen.includes(item) ? "selected" : "")
                  }
                  onClick={() => {
                    setChosen((current) =>
                      current.includes(item)
                        ? current.filter((x) => x !== item)
                        : [...current, item],
                    );
                  }}
                >
                  {chosen.includes(item) && <Check size={16} />}

                  {item}
                </button>
              ))}
            </div>
          )}

          {/* STEP 6: CAREER PLAN */}

          {step === 5 && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: 600,
                }}
              >
                What would you like to achieve in the next 6–12 months?
              </label>

              <textarea
                value={shortTermGoal}
                onChange={(e) => setShortTermGoal(e.target.value)}
                placeholder="e.g. Learn Python, complete a certification or secure an internship..."
                rows={3}
                maxLength={1000}
                style={inputStyle}
              />

              <label
                style={{
                  display: "block",
                  marginTop: "24px",
                  marginBottom: "10px",
                  fontWeight: 600,
                }}
              >
                Where would you like to be in the next 3–5 years?
              </label>

              <textarea
                value={longTermGoal}
                onChange={(e) => setLongTermGoal(e.target.value)}
                placeholder="e.g. Become a senior software engineer or establish my own business..."
                rows={3}
                maxLength={1000}
                style={inputStyle}
              />
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <div className="question-actions">
            <button
              className="btn btn-outline"
              disabled={step === 0 || busy}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <button className="btn btn-primary" disabled={busy} onClick={next}>
              {busy ? "Saving..." : step === 5 ? "Finish setup" : "Continue"}

              {!busy && <ArrowRight size={18} />}
            </button>
          </div>
        </div>

        <div className="onboard-bottom">
          <LockKeyhole size={15} />
          Your answers help personalize your experience.
        </div>
      </div>
    </div>
  );
}
