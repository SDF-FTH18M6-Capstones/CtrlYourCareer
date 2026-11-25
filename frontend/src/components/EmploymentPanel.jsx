import { useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { request } from "../services/employment";
import "./EmploymentPanel.css";

export default function EmploymentPanel({
  admin = false,
  onUnreadChange,
  visible = true,
}) {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (admin) {
      const [c, j, r, u] = await Promise.all([
        request("/admin/companies"),
        request("/admin/jobs"),
        request("/admin/referrals"),
        request("/admin/users"),
      ]);

      setCompanies(c);
      setJobs(j);
      setReferrals(r);
      setUsers(u.filter((user) => user.role !== "admin"));
    } else {
      const [r, n] = await Promise.all([
        request("/referrals"),
        request("/notifications"),
      ]);

      setReferrals(r);
      setNotifications(n);
      onUnreadChange?.(n.filter((item) => !item.read).length);
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [admin, visible]);

  async function action(path, method, data) {
    setBusy(true);
    setError("");

    try {
      await request(path, method, data);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function submit(event, path, convert) {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(event.currentTarget));

    action(path, "POST", convert(data));
  }

  return (
    <section
      className={`employment-panel ${admin ? "employment-admin" : "employment-user"}`}
    >
      <div className="emp-heading">
        <div>
          <span className="emp-eyebrow">
            <BriefcaseBusiness size={16} /> CAREER OPPORTUNITIES
          </span>
          <h2>
            {admin ? "Employment Management" : "Employment Opportunities"}
          </h2>
          <p>
            {admin
              ? "Manage companies, jobs and consent-based referrals."
              : "Review opportunities and updates from your administrator."}
          </p>
        </div>
        <button
          type="button"
          className="emp-secondary"
          disabled={busy}
          onClick={() => {
            setError("");
            load().catch((err) => setError(err.message));
          }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      {admin && (
        <div className="emp-stats">
          {[
            ["Companies", companies.length],
            ["Active jobs", jobs.filter((j) => j.active).length],
            [
              "Pending referrals",
              referrals.filter((r) => r.status === "pending").length,
            ],
            ["Hired", referrals.filter((r) => r.status === "hired").length],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="emp-error" role="alert">
          {error}
        </p>
      )}

      {admin ? (
        <>
          <form onSubmit={(e) => submit(e, "/admin/companies", (d) => d)}>
            <h3>
              <Building2 size={20} /> Add Company
            </h3>
            <input
              name="name"
              placeholder="Company name"
              required
              maxLength={150}
            />
            <button disabled={busy}>Add Company</button>
          </form>

          <p>
            {companies.length
              ? companies.map((c) => (
                  <span className="emp-company" key={c.id}>
                    {c.name}
                  </span>
                ))
              : "No companies registered yet."}
          </p>

          <form
            onSubmit={(e) =>
              submit(e, "/admin/jobs", (d) => ({
                ...d,
                company_id: Number(d.company_id),
              }))
            }
          >
            <h3>
              <BriefcaseBusiness size={20} /> Add Job Opportunity
            </h3>

            <select name="company_id" required>
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input name="title" placeholder="Job title" required />

            <textarea
              name="description"
              placeholder="Job description"
              required
            />

            <button disabled={busy}>Add Job</button>
          </form>

          {jobs.map((job) => (
            <p className="emp-job" key={job.id}>
              {job.company} — {job.title}
              {job.active ? (
                <button
                  disabled={busy}
                  onClick={() => action(`/admin/jobs/${job.id}`, "PATCH")}
                >
                  Close Job
                </button>
              ) : (
                <span className="emp-badge unsuccessful">Closed</span>
              )}
            </p>
          ))}

          <form
            onSubmit={(e) =>
              submit(e, "/admin/referrals", (d) => ({
                user_id: Number(d.user_id),
                job_id: Number(d.job_id),
              }))
            }
          >
            <h3>
              <ShieldCheck size={20} /> Propose Employment Referral
            </h3>

            <select name="user_id" required>
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>

            <select name="job_id" required>
              <option value="">Select job</option>
              {jobs
                .filter((j) => j.active)
                .map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} — {job.company}
                  </option>
                ))}
            </select>

            <button disabled={busy}>Request Consent</button>
          </form>
        </>
      ) : (
        <>
          <h3>
            <Bell size={19} /> Notifications (
            {notifications.filter((n) => !n.read).length} unread)
          </h3>

          {notifications.map((n) => (
            <p className={`emp-notice ${n.read ? "" : "unread"}`} key={n.id}>
              {n.message}

              {!n.read && (
                <button
                  disabled={busy}
                  onClick={() => action(`/notifications/${n.id}/read`, "PATCH")}
                >
                  Mark Read
                </button>
              )}
            </p>
          ))}
        </>
      )}

      {referrals.length === 0 && (
        <div className="emp-empty">
          <BriefcaseBusiness size={28} />
          <strong>No referrals yet</strong>
          <p>
            {admin
              ? "Create a referral when a suitable opportunity is available."
              : "New employment referrals will appear here."}
          </p>
        </div>
      )}

      {referrals.map((referral) => (
        <article key={referral.id}>
          <h3>
            {referral.job.title} — {referral.job.company}
          </h3>

          <p>{referral.job.description}</p>
          <span className={`emp-badge ${referral.status}`}>
            {referral.status}
          </span>
          {admin && (
            <p>
              Candidate:{" "}
              {referral.username ||
                referral.user?.username ||
                users.find((u) => u.id === referral.user_id)?.username ||
                `User #${referral.user_id ?? "—"}`}
            </p>
          )}

          {!admin && referral.status === "pending" && (
            <>
              <p>
                Accepting allows the administrator to share your name and
                career-related skills with the company for this job.
              </p>

              <button
                className="emp-accept"
                disabled={busy || !referral.job.active}
                onClick={() =>
                  action(`/referrals/${referral.id}/accept`, "POST", {
                    consent: true,
                  })
                }
              >
                Accept and Consent
              </button>

              <button
                className="emp-decline"
                disabled={busy}
                onClick={() =>
                  action(`/referrals/${referral.id}/decline`, "POST")
                }
              >
                Decline
              </button>
            </>
          )}

          {admin && referral.status === "accepted" && (
            <button
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Confirm that you manually referred this consenting user?",
                  )
                ) {
                  action(`/admin/referrals/${referral.id}/status`, "PATCH", {
                    status: "referred",
                  });
                }
              }}
            >
              Record Referral Sent
            </button>
          )}

          {admin &&
            referral.status === "referred" &&
            ["hired", "unsuccessful"].map((status) => (
              <button
                key={status}
                disabled={busy}
                onClick={() =>
                  action(`/admin/referrals/${referral.id}/status`, "PATCH", {
                    status,
                  })
                }
              >
                {status}
              </button>
            ))}
        </article>
      ))}
    </section>
  );
}
