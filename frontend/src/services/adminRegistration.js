const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const { method = "GET", body, token } = options;

  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.msg ||
        data.message ||
        `Request failed (${response.status})`,
    );
  }

  return data;
}

export const adminRegistrationApi = {
  // Check whether administrator key registration is available.
  getSetupStatus() {
    return request("/admin/setup/status");
  },

  // Register an administrator using the setup key.
  registerFirstAdmin(data) {
    return request("/admin/setup/register", {
      method: "POST",
      body: data,
    });
  },

  // Generate an administrator invitation.
  createInvitation(email, token) {
    return request("/admin/invitations", {
      method: "POST",
      token,
      body: { email },
    });
  },

  // Retrieve administrator invitations.
  listInvitations(token) {
    return request("/admin/invitations", {
      token,
    });
  },

  // Validate an invitation token.
  validateInvitation(invitationToken) {
    return request("/admin/invitations/validate", {
      method: "POST",
      body: {
        token: invitationToken,
      },
    });
  },

  // Register an invited administrator.
  acceptInvitation(data) {
    return request("/admin/invitations/accept", {
      method: "POST",
      body: data,
    });
  },

  // Revoke a pending invitation.
  revokeInvitation(invitationId, token) {
    return request(`/admin/invitations/${invitationId}`, {
      method: "DELETE",
      token,
    });
  },
};
