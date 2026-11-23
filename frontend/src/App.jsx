import { useEffect, useRef, useState } from "react";
import Brand from "./components/Brand";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import "./theme.css";
import { useAuth } from "./context/AuthContext";

const LOADING_DURATION = 1000;

export default function App() {
  const { session, loading, login, logout, updateUser } = useAuth();

  const [screen, setScreen] = useState("landing");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("cyc-theme") || "system",
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      (document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme);
    apply();
    localStorage.setItem("cyc-theme", theme);
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  const [showLoading, setShowLoading] = useState(true);

  const timerRef = useRef(null);
  const initializedRef = useRef(false);

  const startLoading = (nextScreen) => {
    clearTimeout(timerRef.current);
    setShowLoading(true);

    timerRef.current = setTimeout(() => {
      setScreen(nextScreen);
      setShowLoading(false);
    }, LOADING_DURATION);
  };

  useEffect(() => {
    if (loading || initializedRef.current) return;

    initializedRef.current = true;

    const nextScreen = session
      ? session.user.onboardingComplete
        ? "dashboard"
        : "onboarding"
      : "landing";

    startLoading(nextScreen);
  }, [loading, session]);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const authSuccess = async (email, password) => {
    const next = await login(email, password);

    const nextScreen = next.user.onboardingComplete
      ? "dashboard"
      : "onboarding";

    startLoading(nextScreen);
  };

  const finish = (user) => {
    updateUser(user);
    startLoading("dashboard");
  };

  const signOut = () => {
    clearTimeout(timerRef.current);
    logout();
    setShowLoading(false);
    setScreen("landing");
  };

  if (loading || showLoading) {
    return (
      <div className="loading">
        <Brand />
        <p>Loading your journey…</p>
      </div>
    );
  }

  if (screen === "login" || screen === "signup") {
    const props = {
      setMode: setScreen,
      onSuccess: authSuccess,
      onBack: () => setScreen("landing"),
    };

    return screen === "login" ? <Login {...props} /> : <Register {...props} />;
  }

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

  if (session && screen === "dashboard") {
    return (
      <Dashboard
        user={session.user}
        onLogout={signOut}
        onSettings={() => setScreen("settings")}
      />
    );
  }

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
