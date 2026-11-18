const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

async function apiRequest(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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
      data?.message || data?.error || `Request failed: ${response.status}`,
    );
  }

  return data;
}

export const backendApi = {
  // Confirmed from our earlier backend setup
  health: () => apiRequest("/health"),

  // Adjust these paths if your Postman URLs differ
  getSkills: () => apiRequest("/skills"),

  getCareers: () => apiRequest("/careers"),
};
