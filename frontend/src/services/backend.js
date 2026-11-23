import { api } from "../api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

function getToken() {
  const session = api.getSession();
  const token = session?.token || session?.access_token;
  return typeof token === "string" && token && !token.startsWith("demo-")
    ? token
    : null;
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  health: () => apiRequest("/health"),
  getSkills: () => apiRequest("/skills"),
  getMySkills: () => apiRequest("/my-skills"),
  addMySkill: (payload) =>
    apiRequest("/my-skills", { method: "POST", body: JSON.stringify(payload) }),
  updateMySkill: (recordId, payload) =>
    apiRequest(`/my-skills/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteMySkill: (recordId) =>
    apiRequest(`/my-skills/${recordId}`, { method: "DELETE" }),
  getCareers: () => apiRequest("/careers"),
  getRecommendations: () => apiRequest("/careers/recommendations"),
  refreshRecommendations: () =>
    apiRequest("/careers/recommendations/refresh", { method: "POST" }),
  getCareerSkillGap: (careerId) => apiRequest(`/careers/${careerId}/skill-gap`),
};
