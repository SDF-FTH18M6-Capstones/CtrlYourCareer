import { createContext, useContext, useEffect, useState } from "react";
import { api, demo } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminChallenge, setAdminChallenge] = useState(null);

  // ============================================================
  // RESTORE EXISTING SESSION
  // ============================================================

  useEffect(() => {
    let active = true;

    const stored = api.getSession();

    if (!stored?.token) {
      setLoading(false);
      return;
    }

    api
      .me(stored.token)
      .then(({ user }) => {
        if (!active) return;

        const refreshed = {
          token: stored.token,
          user,
        };

        api.saveSession(refreshed);
        setSession(refreshed);
      })
      .catch(() => {
        if (active) {
          api.logout();
          setSession(null);
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
  // LOGIN — NORMAL USER AND ADMIN
  // ============================================================

  async function login(email, password) {
    const next = await api.login({
      email,
      password,
    });

    // Admins must verify their PIN before receiving a session.
    if (next.requires_admin_pin) {
      setAdminChallenge(next.challenge);
      return next;
    }

    // Regular users can log in immediately.
    api.saveSession(next);
    setSession(next);

    return next;
  }

  // ============================================================
  // VERIFY ADMIN PIN
  // ============================================================

  async function verifyAdminPin(pin) {
    if (!adminChallenge) {
      throw new Error(
        "Admin verification challenge has expired. Please log in again.",
      );
    }

    // Use the centralized API function from api.js.
    const next = await api.verifyAdminPin({
      challenge: adminChallenge,
      pin,
    });

    // The API saves the verified admin session.
    setSession(next);

    // Clear the temporary challenge after successful verification.
    setAdminChallenge(null);

    return next;
  }

  // ============================================================
  // CANCEL ADMIN PIN VERIFICATION
  // ============================================================

  function cancelAdminPin() {
    setAdminChallenge(null);
  }

  // ============================================================
  // UPDATE CURRENT USER
  // ============================================================

  function updateUser(user) {
    setSession((current) => {
      if (!current) return current;

      const next = {
        ...current,
        user,
      };

      api.saveSession(next);

      return next;
    });
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  function logout() {
    api.logout();

    setSession(null);
    setAdminChallenge(null);
  }

  // ============================================================
  // CONTEXT PROVIDER
  // ============================================================

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        login,
        verifyAdminPin,
        cancelAdminPin,
        adminChallenge,
        logout,
        updateUser,
        demo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
