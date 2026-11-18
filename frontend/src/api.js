const base = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";
export const demo = import.meta.env.VITE_DEMO_MODE !== "false";
const accountsKey = "cyc_demo_accounts",
  sessionKey = "cyc_demo_session";
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const wait = () => new Promise((r) => setTimeout(r, 250));
const safe = (a) => {
  const { password, ...user } = a;
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
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw Error(
      "Cannot reach Flask. Check the API URL, backend server and CORS.",
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw Error(
      data.message || data.error || `Request failed (${response.status})`,
    );
  return data;
}
export const api = {
  getSession: () => read(sessionKey, null),
  saveSession: (session) => save(sessionKey, session),
  logout: () => localStorage.removeItem(sessionKey),
  async register({ name, email, password }) {
    if (!demo)
      return request("/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
    await wait();
    const all = read(accountsKey, []),
      normalized = email.trim().toLowerCase();
    if (all.some((a) => a.email === normalized))
      throw Error("This email already has an account.");
    const account = {
      id: String(Date.now()),
      name: name.trim(),
      email: normalized,
      password,
      onboardingComplete: false,
      role: "",
      goal: "",
      experience: "",
      interests: [],
    };
    save(accountsKey, [...all, account]);
    const session = { token: `demo-${account.id}`, user: safe(account) };
    save(sessionKey, session);
    return session;
  },
  async login({ email, password }) {
    if (!demo)
      return request("/auth/login", {
        method: "POST",
        body: { email, password },
      });
    await wait();
    const account = read(accountsKey, []).find(
      (a) => a.email === email.trim().toLowerCase() && a.password === password,
    );
    if (!account) throw Error("Incorrect email or password.");
    const session = { token: `demo-${account.id}`, user: safe(account) };
    save(sessionKey, session);
    return session;
  },
  async me(token) {
    if (!demo) return request("/auth/me", { token });
    await wait();
    const account = read(accountsKey, []).find((a) => `demo-${a.id}` === token);
    if (!account) throw Error("Your session has expired.");
    return { user: safe(account) };
  },
  async onboard(token, profile) {
    if (!demo)
      return request("/profile/onboarding", {
        method: "PUT",
        token,
        body: profile,
      });
    await wait();
    const all = read(accountsKey, []),
      index = all.findIndex((a) => `demo-${a.id}` === token);
    if (index < 0) throw Error("Your session has expired.");
    all[index] = { ...all[index], ...profile, onboardingComplete: true };
    save(accountsKey, all);
    return { user: safe(all[index]) };
  },
};
