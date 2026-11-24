import { useEffect, useLayoutEffect, useRef, useState } from "react";

import Brand from "./components/Brand";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

import "./theme.css";

import { backendApi } from "./services/backend";

import AdminPin from "./components/AdminPin";
import AdminDashboard from "./pages/AdminDashboard";
import CareerExplorer from "./pages/CareerExplorer";
import MyJourneys from "./pages/MyJourneys";
import LearningJourney from "./pages/LearningJourney";

import { useAuth } from "./context/AuthContext";

const LOADING_DURATION = 1000;

export default function App() {
  const {
    session,
    loading,
    login,
    verifyAdminPin,
    cancelAdminPin,
    adminChallenge,
    logout,
    updateUser,
  } = useAuth();

  const [screen, setScreen] = useState("landing");

  const [activeJourneyId, setActiveJourneyId] = useState(null);

  const [featureError, setFeatureError] = useState("");

  const [theme, setTheme] = useState(
    () => localStorage.getItem("cyc-theme") || "system",
  );

  const [showLoading, setShowLoading] = useState(true);

  const timerRef = useRef(null);
  const initializedRef = useRef(false);

  // ==========================================
  // RESET SCROLL POSITION WHEN SCREEN CHANGES
  // ==========================================

  useLayoutEffect(() => {
    // Reset both the window and document scroll position.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [screen, showLoading]);

  // ==========================================
  // THEME MANAGEMENT
  // ==========================================

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };

    apply();

    localStorage.setItem("cyc-theme", theme);

    media.addEventListener("change", apply);

    return () => {
      media.removeEventListener("change", apply);
    };
  }, [theme]);

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  const startLoading = (nextScreen) => {
    clearTimeout(timerRef.current);

    setShowLoading(true);

    timerRef.current = setTimeout(() => {
      setScreen(nextScreen);
      setShowLoading(false);
    }, LOADING_DURATION);
  };

  // ==========================================
  // INITIAL SESSION RESTORATION
  // ==========================================

  useEffect(() => {
    if (loading || initializedRef.current) return;

    initializedRef.current = true;

    const nextScreen = session
      ? session.user.role === "admin"
        ? "admin-dashboard"
        : session.user.onboardingComplete
          ? "dashboard"
          : "onboarding"
      : "landing";

    startLoading(nextScreen);
  }, [loading, session]);

  // ==========================================
  // CLEAN UP LOADING TIMER
  // ==========================================

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const authSuccess = async (email, password) => {
    const next = await login(email, password);

    if (next.requires_admin_pin) {
      setScreen("admin-pin");
      setShowLoading(false);
      return;
    }

    const nextScreen =
      next.user.role === "admin"
        ? "admin-dashboard"
        : next.user.onboardingComplete
          ? "dashboard"
          : "onboarding";

    startLoading(nextScreen);
  };

  const verifyPin = async (pin) => {
    await verifyAdminPin(pin);
    setScreen("admin-dashboard");
  };

  // ==========================================
  // LEARNING JOURNEYS
  // ==========================================

  const startJourney = async (careerId) => {
    setFeatureError("");

    try {
      const journey = await backendApi.startJourney(careerId);

      setActiveJourneyId(journey.id);

      setScreen("learning-journey");
    } catch (e) {
      setFeatureError(e.message);
      window.alert(e.message);
    }
  };

  // ==========================================
  // ONBOARDING
  // ==========================================

  const finish = (user) => {
    updateUser(user);
    startLoading("dashboard");
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const signOut = () => {
    clearTimeout(timerRef.current);

    logout();

    setShowLoading(false);
    setScreen("landing");
  };

  // ==========================================
  // LOADING UI
  // ==========================================

  if (loading || showLoading) {
    return (
      <div className="loading">
        <Brand />
        <p>Loading your journey…</p>
      </div>
    );
  }

  // ==========================================
  // ADMIN PIN VERIFICATION
  // ==========================================

  if (screen === "admin-pin" && adminChallenge) {
    return (
      <AdminPin
        onVerify={verifyPin}
        onCancel={() => {
          cancelAdminPin();
          setScreen("login");
        }}
      />
    );
  }

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  if (session && session.user.role === "admin") {
    return <AdminDashboard user={session.user} onLogout={signOut} />;
  }

  // ==========================================
  // CAREER EXPLORER
  // ==========================================

  if (session && screen === "career-explorer") {
    return (
      <CareerExplorer
        onBack={() => setScreen("dashboard")}
        onStartJourney={startJourney}
      />
    );
  }

  // ==========================================
  // MY JOURNEYS
  // ==========================================

  if (session && screen === "my-journeys") {
    return (
      <MyJourneys
        onBack={() => setScreen("dashboard")}
        onOpen={(id) => {
          setActiveJourneyId(id);
          setScreen("learning-journey");
        }}
      />
    );
  }

  // ==========================================
  // LEARNING JOURNEY
  // ==========================================

  if (session && screen === "learning-journey") {
    return (
      <LearningJourney
        journeyId={activeJourneyId}
        onBack={() => setScreen("my-journeys")}
      />
    );
  }

  // ==========================================
  // LOGIN / REGISTER
  // ==========================================

  if (screen === "login" || screen === "signup") {
    const props = {
      setMode: setScreen,
      onSuccess: authSuccess,
      onBack: () => setScreen("landing"),
    };

    return screen === "login" ? <Login {...props} /> : <Register {...props} />;
  }

  // ==========================================
  // ONBOARDING
  // ==========================================

  if (session && screen === "onboarding") {
    return (
      <Onboarding
        user={session.user}
        token={session.token}
        onComplete={finish}
        onLogout={signOut}
      />
    );
  }

  // ==========================================
  // USER DASHBOARD
  // ==========================================

  if (session && screen === "dashboard") {
    return (
      <Dashboard
        user={session.user}
        onLogout={signOut}
        onSettings={() => setScreen("settings")}
        // Opens the separate Career Explorer page.
        onExploreCareers={() => setScreen("career-explorer")}
        onOpenJourneys={() => setScreen("my-journeys")}
        onStartJourney={startJourney}
      />
    );
  }

  // ==========================================
  // SETTINGS
  // ==========================================

  if (session && screen === "settings") {
    return (
      <Settings
        user={session.user}
        token={session.token || session.access_token}
        onBack={() => setScreen("dashboard")}
        onLogout={signOut}
        onUserUpdated={updateUser}
        theme={theme}
        onThemeChange={setTheme}
      />
    );
  }

  // ==========================================
  // LANDING PAGE
  // ==========================================

  return (
    <>
      <Header
        onAuth={setScreen}
        session={session}
        onHome={() => {
          const nextScreen = session
            ? session.user.onboardingComplete
              ? "dashboard"
              : "onboarding"
            : "landing";

          setScreen(nextScreen);

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
      />

      <Landing
        onAuth={setScreen}
        session={session}
        onDashboard={() => {
          setScreen(
            session?.user?.onboardingComplete
              ? "dashboard"
              : session
                ? "onboarding"
                : "login",
          );
        }}
      />
    </>
  );
}
