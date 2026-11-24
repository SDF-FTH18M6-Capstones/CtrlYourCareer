import { useCallback, useEffect, useState } from "react";

import {
  UserPlus,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  XCircle,
  RefreshCw,
  Link,
  AlertCircle,
  Users,
  Send,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { adminRegistrationApi } from "../../services/adminRegistration";

import "./AdminInvitations.css";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    icon: Check,
  },
  expired: {
    label: "Expired",
    icon: AlertCircle,
  },
  revoked: {
    label: "Revoked",
    icon: XCircle,
  },
};

export default function AdminInvitations() {
  const { session } = useAuth();

  const token = session?.token || session?.access_token;

  const [email, setEmail] = useState("");
  const [invitations, setInvitations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [generatedLink, setGeneratedLink] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [generatedId, setGeneratedId] = useState(null);

  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("all");

  // ==========================================
  // LOAD INVITATIONS
  // ==========================================

  const loadInvitations = useCallback(async () => {
    if (!token) {
      setError("Please log in again to manage invitations.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await adminRegistrationApi.listInvitations(token);

      setInvitations(Array.isArray(data) ? data : data.invitations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  // ==========================================
  // CREATE INVITATION
  // ==========================================

  async function createInvitation(e) {
    e.preventDefault();

    if (creating || !token) return;

    setError("");
    setSuccess("");
    setGeneratedLink("");
    setGeneratedEmail("");
    setGeneratedId(null);
    setCopied(false);

    const recipient = email.trim().toLowerCase();

    if (!recipient) {
      setError("Please enter the recipient's email address.");
      return;
    }

    setCreating(true);

    try {
      const data = await adminRegistrationApi.createInvitation(
        recipient,
        token,
      );

      const url = new URL(import.meta.env.BASE_URL, window.location.origin);

      url.hash = `admin-register?token=${encodeURIComponent(data.token)}`;

      setGeneratedLink(url.toString());
      setGeneratedEmail(recipient);
      setGeneratedId(data.invitation?.id ?? null);

      setEmail("");

      setSuccess("Administrator invitation created successfully.");

      await loadInvitations();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  // ==========================================
  // COPY INVITATION LINK
  // ==========================================

  async function copyInvitation() {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink);

      setCopied(true);
    } catch {
      setError(
        "Automatic copying failed. Please select and copy the link manually.",
      );
    }
  }

  // ==========================================
  // REVOKE INVITATION
  // ==========================================

  async function revokeInvitation(invitation) {
    if (revoking !== null || !token) return;

    const confirmed = window.confirm(
      `Revoke the invitation for ${invitation.email}?\n\n` +
        "This invitation link will no longer work.",
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setRevoking(invitation.id);

    try {
      await adminRegistrationApi.revokeInvitation(invitation.id, token);

      if (generatedId === invitation.id) {
        setGeneratedLink("");
        setGeneratedEmail("");
        setGeneratedId(null);
        setCopied(false);
      }

      setSuccess("Invitation revoked successfully.");

      await loadInvitations();
    } catch (err) {
      setError(err.message);
    } finally {
      setRevoking(null);
    }
  }

  // ==========================================
  // INVITATION STATISTICS
  // ==========================================

  const statistics = [
    {
      label: "Total invitations",
      value: invitations.length,
      icon: Users,
      type: "total",
    },
    {
      label: "Pending",
      value: invitations.filter((item) => item.status === "pending").length,
      icon: Clock,
      type: "pending",
    },
    {
      label: "Accepted",
      value: invitations.filter((item) => item.status === "accepted").length,
      icon: Check,
      type: "accepted",
    },
    {
      label: "Expired",
      value: invitations.filter((item) => item.status === "expired").length,
      icon: AlertCircle,
      type: "expired",
    },
    {
      label: "Revoked",
      value: invitations.filter((item) => item.status === "revoked").length,
      icon: XCircle,
      type: "revoked",
    },
  ];

  const filteredInvitations =
    filter === "all"
      ? invitations
      : invitations.filter((item) => item.status === filter);

  return (
    <div className="admin-invitations">
      {/* PAGE HEADER */}

      <section className="admin-invite-hero">
        <div>
          <span className="admin-invite-eyebrow">
            <ShieldCheck size={16} />
            ADMINISTRATOR ACCESS
          </span>

          <h1>Admin Invitations</h1>

          <p>
            Grow your administration team by inviting trusted individuals to
            manage CtrlYourCareer securely.
          </p>
        </div>

        <div className="admin-invite-hero-icon">
          <UserPlus size={38} />
        </div>
      </section>

      {/* STATISTICS */}

      <section className="admin-invite-stats">
        {statistics.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="admin-invite-stat" key={stat.type}>
              <div className={`admin-invite-stat-icon ${stat.type}`}>
                <Icon size={21} />
              </div>

              <span>{stat.label}</span>

              <strong>{loading ? "..." : stat.value}</strong>
            </div>
          );
        })}
      </section>

      {/* FEEDBACK */}

      {error && (
        <div className="admin-invite-feedback error" role="alert">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="admin-invite-feedback success" role="status">
          <Check size={20} />
          {success}
        </div>
      )}

      {/* CREATE INVITATION */}

      <section className="admin-invite-panel">
        <div className="admin-invite-panel-heading">
          <div className="admin-invite-heading-icon">
            <Mail size={23} />
          </div>

          <div>
            <h2>Invite a new administrator</h2>

            <p>Generate a secure, single-use registration link.</p>
          </div>
        </div>

        <form className="admin-invite-form" onSubmit={createInvitation}>
          <label>
            Recipient email address
            <div className="admin-invite-input">
              <Mail size={19} />

              <input
                required
                type="email"
                maxLength={120}
                placeholder="administrator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>

          <button
            className="admin-invite-primary"
            type="submit"
            disabled={creating || !token}
          >
            <Send size={18} />

            {creating ? "Generating..." : "Generate invitation"}
          </button>
        </form>

        <div className="admin-invite-security-note">
          <ShieldCheck size={21} />

          <div>
            <strong>Secure by design</strong>

            <p>
              Each invitation expires after 24 hours, is linked to the
              recipient's email address, and can only be used once.
            </p>
          </div>
        </div>

        {/* GENERATED INVITATION */}

        {generatedLink && (
          <div className="admin-invite-generated">
            <div className="admin-invite-generated-heading">
              <div className="admin-invite-generated-icon">
                <Link size={23} />
              </div>

              <div>
                <h3>Invitation link ready</h3>

                <p>
                  Created for <strong>{generatedEmail}</strong>
                </p>
              </div>
            </div>

            <div className="admin-invite-copy-row">
              <input
                aria-label="Generated invitation link"
                value={generatedLink}
                readOnly
                onClick={(e) => e.target.select()}
              />

              <button
                type="button"
                onClick={copyInvitation}
                className="admin-invite-copy"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}

                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>

            <p className="admin-invite-link-warning">
              Share this link privately with the intended recipient. Anyone who
              obtains it could attempt to register using the invited email
              address. Copy it now because it cannot be retrieved later.
            </p>

            <button
              className="admin-invite-dismiss"
              type="button"
              onClick={() => {
                setGeneratedLink("");
                setGeneratedEmail("");
                setGeneratedId(null);
                setCopied(false);
              }}
            >
              Dismiss link
            </button>
          </div>
        )}
      </section>

      {/* INVITATION HISTORY */}

      <section className="admin-invite-panel">
        <div className="admin-invite-history-heading">
          <div>
            <h2>Invitation history</h2>

            <p>Monitor and manage administrator invitations.</p>
          </div>

          <button
            type="button"
            className="admin-invite-secondary"
            onClick={loadInvitations}
            disabled={loading}
          >
            <RefreshCw size={17} className={loading ? "invite-spinning" : ""} />
            Refresh
          </button>
        </div>

        {/* FILTERS */}

        <div className="admin-invite-filters">
          {[
            ["all", "All invitations"],
            ["pending", "Pending"],
            ["accepted", "Accepted"],
            ["expired", "Expired"],
            ["revoked", "Revoked"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* INVITATION TABLE */}

        {loading ? (
          <div className="admin-invite-empty">
            <RefreshCw size={30} className="invite-spinning" />

            <h3>Loading invitations...</h3>
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="admin-invite-empty">
            <div className="admin-invite-empty-icon">
              <Mail size={32} />
            </div>

            <h3>No invitations found</h3>

            <p>
              {filter === "all"
                ? "Create your first administrator invitation above."
                : `There are no ${filter} invitations.`}
            </p>
          </div>
        ) : (
          <div className="admin-invite-table-wrapper">
            <table className="admin-invite-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvitations.map((invitation) => {
                  const status = STATUS_CONFIG[invitation.status];

                  const StatusIcon = status?.icon || AlertCircle;

                  return (
                    <tr key={invitation.id}>
                      <td>
                        <div className="admin-invite-recipient">
                          <div className="admin-invite-avatar">
                            {invitation.email?.charAt(0).toUpperCase()}
                          </div>

                          <strong>{invitation.email}</strong>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`admin-invite-status ${invitation.status}`}
                        >
                          <StatusIcon size={14} />

                          {status?.label || invitation.status}
                        </span>
                      </td>

                      <td>{formatDate(invitation.created_at)}</td>

                      <td>{formatDate(invitation.expires_at)}</td>

                      <td>
                        {invitation.status === "pending" ? (
                          <button
                            type="button"
                            className="admin-invite-revoke"
                            disabled={revoking !== null}
                            onClick={() => revokeInvitation(invitation)}
                          >
                            <XCircle size={16} />

                            {revoking === invitation.id
                              ? "Revoking..."
                              : "Revoke"}
                          </button>
                        ) : (
                          <span className="admin-invite-no-action">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
