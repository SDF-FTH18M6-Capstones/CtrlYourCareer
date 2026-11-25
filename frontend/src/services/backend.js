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

  getRecommendedSkills: () => apiRequest("/skills/recommended"),

  getMySkills: () => apiRequest("/my-skills"),

  addMySkill: (payload) =>
    apiRequest("/my-skills", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateMySkill: (recordId, payload) =>
    apiRequest(`/my-skills/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteMySkill: (recordId) =>
    apiRequest(`/my-skills/${recordId}`, {
      method: "DELETE",
    }),

  getCareers: () => apiRequest("/careers"),

  getRecommendations: () => apiRequest("/careers/recommendations"),

  refreshRecommendations: () =>
    apiRequest("/careers/recommendations/refresh", {
      method: "POST",
    }),

  getCareerSkillGap: (careerId) => apiRequest(`/careers/${careerId}/skill-gap`),

  getMyJourneys: () => apiRequest("/journeys/me"),

  getJourney: (id) => apiRequest(`/journeys/${id}`),
  deleteJourney: (id) =>
    apiRequest(`/journeys/${id}`, {
      method: "DELETE",
    }),

  startJourney: (career_id) =>
    apiRequest("/journeys", {
      method: "POST",
      body: JSON.stringify({
        career_id,
      }),
    }),

  updateJourneyStep: (id, completed) =>
    apiRequest(`/journeys/steps/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        completed,
      }),
    }),

  getLearningResources: (skillId) => apiRequest(`/skills/${skillId}/resources`),

  getAdminStats: () => apiRequest("/admin/stats"),

  getAdminUsers: () => apiRequest("/admin/users"),

  adminCreateCareer: (data) =>
    apiRequest("/careers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminUpdateCareer: (id, data) =>
    apiRequest(`/careers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  adminDeleteCareer: (id) =>
    apiRequest(`/careers/${id}`, {
      method: "DELETE",
    }),

  adminCreateSkill: (data) =>
    apiRequest("/skills", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminUpdateSkill: (id, data) =>
    apiRequest(`/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  adminDeleteSkill: (id) =>
    apiRequest(`/skills/${id}`, {
      method: "DELETE",
    }),

  adminAddResource: (skillId, data) =>
    apiRequest(`/skills/${skillId}/resources`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  adminDeleteResource: (resourceId) =>
    apiRequest(`/resources/${resourceId}`, {
      method: "DELETE",
    }),
};
