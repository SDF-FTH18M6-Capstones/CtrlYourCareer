import SkillsList from "./components/SkillsList";
import CareersList from "./components/CareersList";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  GraduationCap,
  LockKeyhole,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Eye,
  EyeOff,
  Code2,
  BarChart3,
  PlayCircle,
} from "lucide-react";
import { api, demo } from "./api";

const roles = [
  {
    id: "student",
    icon: GraduationCap,
    title: "Student",
    desc: "I’m exploring my future and building new skills.",
  },
  {
    id: "job-seeker",
    icon: BriefcaseBusiness,
    title: "Job seeker",
    desc: "I’m preparing to apply for jobs and interviews.",
  },
  {
    id: "professional",
    icon: TrendingUp,
    title: "Working professional",
    desc: "I want to grow or change my career.",
  },
  {
    id: "other",
    icon: Compass,
    title: "Just exploring",
    desc: "I’m figuring out my next move.",
  },
];
const goals = [
  {
    id: "learning",
    icon: BookOpen,
    title: "Learn new skills",
    desc: "Discover resources and follow a learning path.",
  },
  {
    id: "interviews",
    icon: Users,
    title: "Prepare for interviews",
    desc: "Build confidence and assess your readiness.",
  },
  {
    id: "career",
    icon: Target,
    title: "Find my career direction",
    desc: "Explore roles that fit my interests.",
  },
  {
    id: "gaps",
    icon: BarChart3,
    title: "Understand my skill gaps",
    desc: "See what to improve for my next step.",
  },
];
const interests = [
  "Software development",
  "Data & analytics",
  "Design & creativity",
  "Business & finance",
  "Marketing",
  "Cybersecurity",
  "Healthcare",
  "Engineering",
  "Product management",
  "Education",
];
function Brand({ light = false }) {
  return (
    <div className={"brand " + (light ? "brand-light" : "")}>
      <div className="brand-mark">
        <Compass size={22} strokeWidth={2.4} />
      </div>
      <span>
        Ctrl<span className="brand-accent">Your</span>Career
      </span>
    </div>
  );
}
function Header({ onAuth, session, onHome }) {
  const [menu, setMenu] = useState(false);
  return (
    <header className="header">
      <div className="container nav">
        <button className="brand-button" onClick={onHome}>
          <Brand />
        </button>
        <nav className={menu ? "nav-links open" : "nav-links"}>
          <button onClick={onHome}>Home</button>
          <button
            onClick={() =>
              document
                .getElementById("how")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            How it works
          </button>
          <button
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Features
          </button>
        </nav>
        <div className="nav-actions">
          {session ? (
            <button className="btn btn-dark" onClick={onHome}>
              My dashboard <ArrowUpRight size={16} />
            </button>
          ) : (
            <>
              <button className="btn btn-quiet" onClick={() => onAuth("login")}>
                Log in
              </button>
              <button className="btn btn-dark" onClick={() => onAuth("signup")}>
                Get started <ArrowUpRight size={16} />
              </button>
            </>
          )}
        </div>
        <button
          className="menu-button"
          aria-label="Toggle menu"
          onClick={() => setMenu(!menu)}
        >
          <Menu />
        </button>
      </div>
    </header>
  );
}
function Landing({ onAuth, session, onDashboard }) {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={15} /> YOUR FUTURE STARTS HERE
            </span>
            <h1>
              Don't just dream
              <br />
              of your future.
              <br />
              <span>Map your way there.</span>
            </h1>
            <p>
              Discover your strengths, explore meaningful careers, and build the
              skills that get you where you want to go. All in one place.
            </p>
            <div className="hero-buttons">
              <button
                className="btn btn-primary btn-lg"
                onClick={session ? onDashboard : () => onAuth("signup")}
              >
                {session ? "Go to dashboard" : "Start your journey"}{" "}
                <ArrowRight size={19} />
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() =>
                  document
                    .getElementById("how")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See how it works <PlayCircle size={19} />
              </button>
            </div>
            <div className="trust">
              <div className="avatar-stack">
                <span>JD</span>
                <span>AM</span>
                <span>SK</span>
              </div>
              <span>
                Built for students, job seekers
                <br />
                and lifelong learners
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="glow"></div>
            <div className="mock-card">
              <div className="mock-top">
                <span className="mini-logo">
                  <Compass size={17} /> Your career map
                </span>
                <span className="pill pill-green">
                  <span className="dot"></span> In progress
                </span>
              </div>
              <div className="mock-heading">Your journey, at a glance</div>
              <div className="mock-sub">
                Keep growing. You're getting closer.
              </div>
              <div className="progress-panel">
                <div className="progress-label">
                  <span>Skill development</span>
                  <strong>68%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: "68%" }} />
                </div>
              </div>
              <div className="mock-stats">
                <div>
                  <span className="stat-icon blue">
                    <Code2 size={19} />
                  </span>
                  <strong>08</strong>
                  <small>Skills mapped</small>
                </div>
                <div>
                  <span className="stat-icon violet">
                    <Target size={19} />
                  </span>
                  <strong>03</strong>
                  <small>Career interests</small>
                </div>
              </div>
              <div className="path-card">
                <div className="path-icon">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <strong>You're on the right path</strong>
                  <small>Every skill brings you closer.</small>
                </div>
                <ChevronRight size={18} />
              </div>
            </div>
            <div className="float-badge">
              <CheckCircle2 size={20} />
              <div>
                <strong>Level up your potential</strong>
                <span>One step at a time</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="how" className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow dark">A SIMPLE PATH FORWARD</span>
            <h2>
              From where you are
              <br />
              to where you want to be.
            </h2>
            <p>
              A guided experience designed around you—not a one-size-fits-all
              career quiz.
            </p>
          </div>
          <div className="steps">
            {[
              [
                "01",
                UserRound,
                "Create your account",
                "Sign up securely to save your journey and pick up where you left off.",
              ],
              [
                "02",
                Compass,
                "Tell us about yourself",
                "Answer a few quick questions about your goals and interests.",
              ],
              [
                "03",
                Target,
                "Build your path",
                "Explore careers, map skills, and take your next step with confidence.",
              ],
            ].map(([n, Icon, title, desc]) => (
              <div className="step" key={n}>
                <span className="step-num">{n}</span>
                <div className="step-icon">
                  <Icon size={25} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="features" className="section features-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow dark">EVERYTHING IN ONE PLACE</span>
            <h2>
              Tools for every stage
              <br />
              of your journey.
            </h2>
          </div>
          <div className="feature-grid">
            {[
              [
                BookOpen,
                "Learn with purpose",
                "Find resources connected to the skills you want to develop.",
              ],
              [
                Target,
                "Explore careers",
                "Discover career paths and understand the skills they require.",
              ],
              [
                BarChart3,
                "Know your gaps",
                "Compare your current skills with your target career.",
              ],
              [
                ShieldCheck,
                "Your journey, your space",
                "A personal account keeps your progress in one place.",
              ],
            ].map(([Icon, title, desc]) => (
              <div className="feature-card" key={title}>
                <div className="feature-icon">
                  <Icon size={24} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta">
        <div className="container cta-inner">
          <div>
            <span className="eyebrow">MAKE YOUR NEXT MOVE COUNT</span>
            <h2>
              Your potential deserves
              <br />a plan.
            </h2>
            <p>
              Start with a few questions. Build a future that feels like yours.
            </p>
          </div>
          <button
            className="btn btn-white btn-lg"
            onClick={session ? onDashboard : () => onAuth("signup")}
          >
            Let's get started <ArrowRight size={19} />
          </button>
        </div>
      </section>
      <footer className="footer">
        <div className="container footer-row">
          <Brand />
          <span>
            © {new Date().getFullYear()} CtrlYourCareer · Built for what's next.
          </span>
        </div>
      </footer>
    </>
  );
}
function Auth({ mode, setMode, onSuccess, onBack }) {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const signup = mode === "signup";
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (signup && name.trim().length < 2)
      return setError("Please enter your full name.");
    if (password.length < 8)
      return setError("Your password must have at least 8 characters.");
    setBusy(true);
    try {
      const session = signup
        ? await api.register({ name, email, password })
        : await api.login({ email, password });
      onSuccess(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-shell">
      <div className="auth-aside">
        <button className="brand-button" onClick={onBack}>
          <Brand light />
        </button>
        <div className="auth-aside-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> A FUTURE THAT FITS YOU
          </span>
          <h2>
            Your next chapter
            <br />
            starts with <em>one step.</em>
          </h2>
          <p>
            Map your skills. Discover opportunities. Build a career path with
            confidence.
          </p>
          <div className="aside-quote">
            <div className="quote-icon">
              <Compass size={23} />
            </div>
            <span>
              “The best investment you can make is in your own growth.”
            </span>
          </div>
        </div>
        <div className="aside-footer">
          YOUR JOURNEY. YOUR PACE. YOUR FUTURE.
        </div>
      </div>
      <div className="auth-main">
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={17} /> Back to home
        </button>
        <div className="auth-form-wrap">
          <div className="form-badge">
            <ShieldCheck size={17} /> YOUR PERSONAL SPACE
          </div>
          <h1>{signup ? "Create your account" : "Welcome back"}</h1>
          <p className="form-intro">
            {signup
              ? "First, let’s get you set up. We’ll personalize your experience next."
              : "Log in to continue building your career journey."}
          </p>
          <form onSubmit={submit}>
            {signup && (
              <label>
                Full name
                <div className="input-wrap">
                  <UserRound size={18} />
                  <input
                    required
                    autoComplete="name"
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </label>
            )}
            <label>
              Email address
              <div className="input-wrap">
                <span className="at-symbol">@</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </label>
            <label>
              Password
              <div className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  type={show ? "text" : "password"}
                  required
                  autoComplete={signup ? "new-password" : "current-password"}
                  placeholder={
                    signup ? "At least 8 characters" : "Enter your password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="eye-button"
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            <button
              disabled={busy}
              className="btn btn-primary btn-submit"
              type="submit"
            >
              {busy ? "Please wait…" : signup ? "Create account" : "Log in"}{" "}
              {!busy && <ArrowRight size={19} />}
            </button>
          </form>
          <div className="auth-switch">
            {signup ? "Already have an account?" : "New to CtrlYourCareer?"}{" "}
            <button
              onClick={() => {
                setError("");
                setMode(signup ? "login" : "signup");
              }}
            >
              {signup ? "Log in" : "Create an account"}
            </button>
          </div>
          <p className="auth-note">
            <ShieldCheck size={15} />{" "}
            {demo
              ? "© 2026 CtrlYourCareer · Built for what's next."
              : "Your account is managed by the connected backend."}
          </p>
        </div>
      </div>
    </div>
  );
}
function Option({ item, selected, onClick }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      className={"option " + (selected ? "selected" : "")}
      onClick={onClick}
    >
      <span className="option-icon">
        <Icon size={22} />
      </span>
      <span className="option-text">
        <strong>{item.title}</strong>
        <small>{item.desc}</small>
      </span>
      <span className="option-check">
        {selected ? <Check size={17} /> : null}
      </span>
    </button>
  );
}
function Onboarding({ user, token, onComplete, onLogout }) {
  const [step, setStep] = useState(0),
    [role, setRole] = useState(user.role || ""),
    [goal, setGoal] = useState(user.goal || ""),
    [experience, setExperience] = useState(user.experience || ""),
    [chosen, setChosen] = useState(user.interests || []),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const valid = [!!role, !!goal, !!experience, chosen.length > 0][step];
  async function next() {
    setError("");
    if (!valid) return setError("Choose an option to continue.");
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      const result = await api.onboard(token, {
        role,
        goal,
        experience,
        interests: chosen,
      });
      onComplete(result.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="onboarding-shell">
      <header className="onboard-header">
        <Brand />
        <div className="onboard-right">
          <span>Hi, {user.name.split(" ")[0]} 👋</span>
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
              Just a few questions so we can tailor your experience to your
              goals.
            </p>
          </div>
          <div className="step-indicator">
            STEP <strong>{step + 1}</strong> OF 4
          </div>
        </div>
        <div className="step-progress">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={i <= step ? "active" : ""} />
          ))}
        </div>
        <div className="question-card">
          <div className="question-kicker">
            {
              [
                "YOUR BACKGROUND",
                "YOUR MAIN GOAL",
                "YOUR EXPERIENCE",
                "YOUR INTERESTS",
              ][step]
            }
          </div>
          <h2>
            {
              [
                "Which best describes you?",
                "What brings you here today?",
                "Where are you in your journey?",
                "What fields interest you?",
              ][step]
            }
          </h2>
          <p className="question-sub">
            {
              [
                "No labels—just a starting point for your experience.",
                "Choose the main thing you want help with right now.",
                "We’ll meet you wherever you are.",
                "Select as many as you like. You can change these later.",
              ][step]
            }
          </p>
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
          {step === 1 && (
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
          {step === 2 && (
            <div className="option-grid">
              {[
                {
                  id: "starting",
                  icon: Sparkles,
                  title: "Just getting started",
                  desc: "I’m new to this and exploring my options.",
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
                  desc: "I’m considering a new field or career.",
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
          )}
          {step === 3 && (
            <div className="interest-grid">
              {interests.map((item) => (
                <button
                  key={item}
                  className={
                    "interest " + (chosen.includes(item) ? "selected" : "")
                  }
                  onClick={() =>
                    setChosen((c) =>
                      c.includes(item)
                        ? c.filter((x) => x !== item)
                        : [...c, item],
                    )
                  }
                >
                  {chosen.includes(item) && <Check size={16} />} {item}
                </button>
              ))}
            </div>
          )}
          {error && <div className="error">{error}</div>}
          <div className="question-actions">
            <button
              className="btn btn-outline"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={17} /> Back
            </button>
            <button className="btn btn-primary" disabled={busy} onClick={next}>
              {busy ? "Saving…" : step === 3 ? "Finish setup" : "Continue"}{" "}
              {!busy && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
        <div className="onboard-bottom">
          <LockKeyhole size={15} /> Your answers help personalize your
          experience.
        </div>
      </div>
    </div>
  );
}
function Dashboard({ user, onLogout }) {
  const first = user.name.split(" ")[0];
  const roleName = roles.find((r) => r.id === user.role)?.title || "Explorer";
  const goalName = goals.find((g) => g.id === user.goal)?.title || "Explore";
  return (
    <div className="dashboard">
      <header className="dash-header">
        <Brand />
        <div className="dash-user">
          <span className="user-avatar">{first[0].toUpperCase()}</span>
          <span>{first}</span>
          <button className="btn btn-quiet" onClick={onLogout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </header>
      <main className="dash-main">
        <div className="welcome">
          <div>
            <span className="eyebrow dark">
              <Sparkles size={15} /> YOUR PERSONAL DASHBOARD
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
            <CheckCircle2 size={17} /> Profile ready
          </div>
        </div>
        <div className="dashboard-grid">
          <div className="dash-card profile-card">
            <span className="dash-card-label">YOUR PROFILE</span>
            <div className="profile-head">
              <div className="profile-avatar">{first[0].toUpperCase()}</div>
              <div>
                <h2>{user.name}</h2>
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
              {user.interests?.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
            <p>These interests will help shape your career exploration.</p>
          </div>
        </div>
        <h2 className="dash-section-title">Where to next?</h2>
        <div className="next-grid">
          {[
            [
              Target,
              "Explore careers",
              "Discover possible paths and what they require.",
            ],
            [
              Code2,
              "My skills map",
              "Start building a picture of what you know.",
            ],
            [BookOpen, "Learning journey", "Plan what you want to learn next."],
          ].map(([Icon, title, desc]) => (
            <div className="next-card" key={title}>
              <span className="next-icon">
                <Icon size={24} />
              </span>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="coming">
                Coming soon <ArrowUpRight size={15} />
              </span>
            </div>
          ))}
        </div>
        <div className="demo-banner">
          <ShieldCheck size={19} />
          <span>
            {demo
              ? "You’re exploring the interactive frontend demo. Connect the Flask API to save accounts securely and activate real features."
              : "Your account is connected to the backend. The career and skills modules can be wired up next."}
          </span>
        </div>
        <div className="dashboard-api-content">
          <SkillsList />
          <CareersList />
        </div>
      </main>
    </div>
  );
}
export default function App() {
  const [screen, setScreen] = useState(() =>
      api.getSession()?.token ? "loading" : "landing"
    ),
    [mode, setMode] = useState("signup"),
    [session, setSession] = useState(null);
  useEffect(() => {
    let alive = true;
    const stored = api.getSession();
    if (!stored?.token) {
      return;
    }
    api
      .me(stored.token)
      .then(({ user }) => {
        if (!alive) return;
        const fresh = { token: stored.token, user };
        api.saveSession(fresh);
        setSession(fresh);
        setScreen(user.onboardingComplete ? "dashboard" : "onboarding");
      })
      .catch(() => {
        if (alive) {
          api.logout();
          setScreen("landing");
        }
      });
    return () => {
      alive = false;
    };
  }, []);
  const startAuth = (which) => {
    setMode(which);
    setScreen("auth");
  };
  const authSuccess = (next) => {
    api.saveSession(next);
    setSession(next);
    setScreen(next.user.onboardingComplete ? "dashboard" : "onboarding");
  };
  const finish = (user) => {
    const next = { ...session, user };
    api.saveSession(next);
    setSession(next);
    setScreen("dashboard");
  };
  const logout = () => {
    api.logout();
    setSession(null);
    setScreen("landing");
  };
  if (screen === "loading")
    return (
      <div className="loading">
        <Brand />
        <p>Loading your journey…</p>
      </div>
    );
  if (screen === "auth")
    return (
      <Auth
        mode={mode}
        setMode={setMode}
        onSuccess={authSuccess}
        onBack={() => setScreen("landing")}
      />
    );
  if (screen === "onboarding")
    return (
      <Onboarding
        user={session.user}
        token={session.token}
        onComplete={finish}
        onLogout={logout}
      />
    );
  if (screen === "dashboard")
    return <Dashboard user={session.user} onLogout={logout} />;
  return (
    <>
      <Header
        onAuth={startAuth}
        session={session}
        onHome={() => {
          setScreen("landing");

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
      />
      <Landing
        onAuth={startAuth}
        session={session}
        onDashboard={() => setScreen("dashboard")}
      />
    </>
  );
}
