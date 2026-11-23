const base = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

export const demo = import.meta.env.VITE_DEMO_MODE === "true";

const accountsKey = "cyc_demo_accounts";
const sessionKey = "cyc_auth_session";

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 250));

const safe = (account) => {
  const { password, ...user } = account;
  return user;
};

async function request(path, { method = "GET", body, token } = {}) {
  let response;

  try {
    response = await fetch(base + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(
      "Cannot reach Flask. Check the API URL, backend server and CORS.",
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        data.msg ||
        `Request failed (${response.status})`,
    );
  }

  return data;
}

export const api = {
  getSession: () => read(sessionKey, null),

  saveSession: (session) => {
    save(sessionKey, session);
  },

  logout: () => {
    localStorage.removeItem(sessionKey);
  },

  // REGISTER
  async register({ username, name, email, password }) {
    const displayName = username || name;

    if (!demo) {
      await request("/auth/register", {
        method: "POST",
        body: {
          username: displayName,
          email,
          password,
        },
      });

      return api.login({ email, password });
    }

    await wait();

    const all = read(accountsKey, []);
    const normalized = email.trim().toLowerCase();

    if (all.some((account) => account.email === normalized)) {
      throw new Error("This email already has an account.");
    }

    const account = {
      id: String(Date.now()),
      name: displayName.trim(),
      email: normalized,
      password,
      onboardingComplete: false,
      role: "",
      goal: "",
      experience: "",
      interests: [],
    };

    save(accountsKey, [...all, account]);

    const session = {
      token: `demo-${account.id}`,
      user: safe(account),
    };

    save(sessionKey, session);

    return session;
  },

  // LOGIN
  async login({ email, password }) {
    if (!demo) {
      const data = await request("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      const token = data.access_token || data.token;

      if (!token) {
        throw new Error("Login response did not contain a JWT access token.");
      }

      const user = data.user || (await request("/auth/me", { token })).user;

      if (!user) {
        throw new Error("The backend did not return a user profile.");
      }

      const session = {
        token,
        user,
      };

      save(sessionKey, session);

      return session;
    }

    await wait();

    const account = read(accountsKey, []).find(
      (account) =>
        account.email === email.trim().toLowerCase() &&
        account.password === password,
    );

    if (!account) {
      throw new Error("Incorrect email or password.");
    }

    const session = {
      token: `demo-${account.id}`,
      user: safe(account),
    };

    save(sessionKey, session);

    return session;
  },

  // CURRENT USER
  async me(token) {
    if (!demo) {
      const data = await request("/auth/me", {
        token,
      });

      const user = data.user || data;

      const session = read(sessionKey, null);

      if (session && session.token === token) {
        save(sessionKey, {
          ...session,
          user,
        });
      }

      return { user };
    }

    await wait();

    const account = read(accountsKey, []).find(
      (account) => `demo-${account.id}` === token,
    );

    if (!account) {
      throw new Error("Your session has expired.");
    }

    return {
      user: safe(account),
    };
  },

  // ONBOARDING
  async onboard(token, profile) {
    if (!demo) {
      const data = await request("/profile/onboarding", {
        method: "PUT",
        token,
        body: profile,
      });

      const session = read(sessionKey, null);

      if (session && session.token === token) {
        save(sessionKey, {
          ...session,
          user: data.user,
        });
      }

      return data;
    }

    await wait();

    const all = read(accountsKey, []);

    const index = all.findIndex((account) => `demo-${account.id}` === token);

    if (index < 0) {
      throw new Error("Your session has expired.");
    }

    all[index] = {
      ...all[index],
      ...profile,
      onboardingComplete: true,
    };

    save(accountsKey, all);

    const session = {
      token,
      user: safe(all[index]),
    };

    save(sessionKey, session);

    return {
      user: safe(all[index]),
    };
  },
};
