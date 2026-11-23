import { api } from "../api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

function getToken() {
  const session = api.getSession();

  const token = session?.token || session?.access_token;

  // Never send demo tokens to Flask.
  if (typeof token !== "string" || !token || token.startsWith("demo-")) {
    return null;
  }

  return token;
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,

      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to Flask. Check that the backend is running.",
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        data?.msg ||
        `Request failed: ${response.status}`,
    );
  }

  return data;
}

export const backendApi = {
  // HEALTH
  health: () => apiRequest("/health"),

  // SKILLS
  getSkills: () => apiRequest("/skills"),

  // CAREERS
  getCareers: () => apiRequest("/careers"),
};
