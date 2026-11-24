
import { useEffect, useState } from "react";
import { request } from "../services/employment";
import "./EmploymentPanel.css";

export default function EmploymentPanel({ admin = false }) {
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
        request("/admin/users")
      ]);

      setCompanies(c);
      setJobs(j);
      setReferrals(r);
      setUsers(u.filter(user => user.role !== "admin"));
    } else {
      const [r, n] = await Promise.all([
        request("/referrals"),
        request("/notifications")
      ]);

      setReferrals(r);
      setNotifications(n);
    }
  }

  useEffect(() => {
    load().catch(err => setError(err.message));
  }, [admin]);

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

    const data = Object.fromEntries(
      new FormData(event.currentTarget)
    );

    action(path, "POST", convert(data));
  }

  return (
    <section className="employment-panel">
      <h2>
        {admin ? "Employment Management" : "Employment Referrals"}
      </h2>

      <button disabled={busy} onClick={() => load()}>
        Refresh
      </button>

      {error && <p role="alert">{error}</p>}

      {admin ? (
        <>
          <form onSubmit={e =>
            submit(e, "/admin/companies", d => d)
          }>
            <h3>Add Company</h3>
            <input
              name="name"
              placeholder="Company name"
              required
              maxLength={150}
            />
            <button disabled={busy}>Add Company</button>
          </form>

          <p>
            {companies.map(c => c.name).join(", ")}
          </p>

          <form onSubmit={e =>
            submit(e, "/admin/jobs", d => ({
              ...d,
              company_id: Number(d.company_id)
            }))
          }>
            <h3>Add Job Opportunity</h3>

            <select name="company_id" required>
              <option value="">Select company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              name="title"
              placeholder="Job title"
              required
            />

            <textarea
              name="description"
              placeholder="Job description"
              required
            />

            <button disabled={busy}>Add Job</button>
          </form>

          {jobs.map(job => (
            <p key={job.id}>
              {job.company} — {job.title}

              {job.active ? (
                <button
                  disabled={busy}
                  onClick={() =>
                    action(`/admin/jobs/${job.id}`, "PATCH")
                  }
                >
                  Close Job
                </button>
              ) : "Closed"}
            </p>
          ))}

          <form onSubmit={e =>
            submit(e, "/admin/referrals", d => ({
              user_id: Number(d.user_id),
              job_id: Number(d.job_id)
            }))
          }>
            <h3>Propose Employment Referral</h3>

            <select name="user_id" required>
              <option value="">Select user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>

            <select name="job_id" required>
              <option value="">Select job</option>
              {jobs.filter(j => j.active).map(job => (
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
            Notifications ({notifications.filter(n => !n.read).length} unread)
          </h3>

          {notifications.map(n => (
            <p key={n.id}>
              {n.message}

              {!n.read && (
                <button
                  disabled={busy}
                  onClick={() =>
                    action(`/notifications/${n.id}/read`, "PATCH")
                  }
                >
                  Mark Read
                </button>
              )}
            </p>
          ))}
        </>
      )}

      {referrals.length === 0 && <p>No referrals yet.</p>}

      {referrals.map(referral => (
        <article key={referral.id}>
          <h3>
            {referral.job.title} — {referral.job.company}
          </h3>

          <p>{referral.job.description}</p>
          <p>Status: {referral.status}</p>

          {!admin && referral.status === "pending" && (
            <>
              <p>
                Accepting allows the administrator to share
                your name and career-related skills with the
                company for this job.
              </p>

              <button
                disabled={busy || !referral.job.active}
                onClick={() =>
                  action(
                    `/referrals/${referral.id}/accept`,
                    "POST",
                    { consent: true }
                  )
                }
              >
                Accept and Consent
              </button>

              <button
                disabled={busy}
                onClick={() =>
                  action(
                    `/referrals/${referral.id}/decline`,
                    "POST"
                  )
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
                if (window.confirm(
                  "Confirm that you manually referred this consenting user?"
                )) {
                  action(
                    `/admin/referrals/${referral.id}/status`,
                    "PATCH",
                    { status: "referred" }
                  );
                }
              }}
            >
              Record Referral Sent
            </button>
          )}

          {admin && referral.status === "referred" &&
            ["hired", "unsuccessful"].map(status => (
              <button
                key={status}
                disabled={busy}
                onClick={() =>
                  action(
                    `/admin/referrals/${referral.id}/status`,
                    "PATCH",
                    { status }
                  )
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
