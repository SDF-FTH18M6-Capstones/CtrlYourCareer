import AdminUserMonitor from "../components/admin/AdminUserMonitor";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  BookOpen,
  Library,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Compass,
} from "lucide-react";

import { backendApi } from "../services/backend";

import AdminCareerManager from "../components/admin/AdminCareerManager";
import AdminSkillManager from "../components/admin/AdminSkillManager";
import AdminResourceManager from "../components/admin/AdminResourceManager";

import "./AdminDashboard.css";

const navigation = [
  { id: "monitoring", label: "User progress", icon: Users },
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
  },
  {
    id: "careers",
    label: "Careers",
    icon: BriefcaseBusiness,
  },
  {
    id: "skills",
    label: "Skills",
    icon: BookOpen,
  },
  {
    id: "resources",
    label: "Resources",
    icon: Library,
  },
  { id: "employment", 
    label: "Employment", 
    icon: BriefcaseBusiness, 
  },
];

export default function AdminDashboard({ user, onLogout }) {
  const [active, setActive] = useState("overview");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [statsData, usersData] = await Promise.all([
          backendApi.getAdminStats(),
          backendApi.getAdminUsers(),
        ]);

        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function navigate(section) {
    setActive(section);
    setSidebarOpen(false);
  }

  const currentSection = navigation.find((item) => item.id === active);

  const displayName = user?.username || user?.name || "Admin";

  return (
    <div className="cyc-admin">
      {/* Mobile header */}

      <header className="cyc-admin-mobile-header">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>

        <span>CtrlYourCareer</span>
      </header>

      {/* Sidebar */}

      <aside className={`cyc-admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="cyc-admin-brand">
          <div className="cyc-admin-brand-icon">
            <Compass size={24} />
          </div>

          <div>
            <h2>
              Ctrl<span>Your</span>Career
            </h2>
            <small>ADMIN CONSOLE</small>
          </div>
        </div>

        <div className="cyc-admin-sidebar-label">WORKSPACE</div>

        <nav className="cyc-admin-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className={active === item.id ? "active" : ""}
                onClick={() => navigate(item.id)}
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="cyc-admin-sidebar-bottom">
          <div className="cyc-admin-security">
            <ShieldCheck size={20} />

            <div>
              <strong>Secure Admin Access</strong>
              <span>PIN verified session</span>
            </div>
          </div>

          <button
            className="cyc-admin-sidebar-logout"
            type="button"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}

      <main className="cyc-admin-main">
        <header className="cyc-admin-topbar">
          <div className="cyc-admin-breadcrumb">
            <span>Administration</span>
            <span>/</span>
            <strong>{currentSection?.label}</strong>
          </div>

          <div className="cyc-admin-account">
            <div className="cyc-admin-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{displayName}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <div className="cyc-admin-content">
          {error && (
            <div className="cyc-admin-error" role="alert">
              {error}
            </div>
          )}

          {active === "overview" && (
            <>
              <section className="cyc-admin-welcome">
                <div>
                  <span className="cyc-admin-eyebrow">PLATFORM OVERVIEW</span>

                  <h1>
                    Welcome back, {displayName}
                    <span>.</span>
                  </h1>

                  <p>
                    Here's what's happening across CtrlYourCareer. Manage your
                    users, careers, skills, and learning resources from one
                    place.
                  </p>
                </div>

                <div className="cyc-admin-welcome-icon">
                  <LayoutDashboard size={36} />
                </div>
              </section>

              <section className="cyc-admin-stat-grid">
                {[
                  {
                    title: "Total Users",
                    value: stats?.users,
                    icon: Users,
                    section: "users",
                  },
                  {
                    title: "Total Careers",
                    value: stats?.careers,
                    icon: BriefcaseBusiness,
                    section: "careers",
                  },
                  {
                    title: "Total Skills",
                    value: stats?.skills,
                    icon: BookOpen,
                    section: "skills",
                  },
                ].map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <button
                      className="cyc-admin-stat-card"
                      key={stat.title}
                      type="button"
                      onClick={() => navigate(stat.section)}
                    >
                      <div className="cyc-admin-stat-top">
                        <span>{stat.title}</span>

                        <div className="cyc-admin-stat-icon">
                          <Icon size={21} />
                        </div>
                      </div>

                      <strong>{loading ? "..." : (stat.value ?? 0)}</strong>

                      <span className="cyc-admin-stat-link">
                        View details <ArrowRight size={15} />
                      </span>
                    </button>
                  );
                })}
              </section>

              <section className="cyc-admin-management">
                <div className="cyc-admin-section-heading">
                  <div>
                    <h2>Platform Management</h2>
                    <p>Quick access to your administration tools.</p>
                  </div>
                </div>

                <div className="cyc-admin-management-grid">
                  {[
                    {
                      title: "Manage Careers",
                      description: "Create, update, and organize career paths.",
                      icon: BriefcaseBusiness,
                      section: "careers",
                    },
                    {
                      title: "Manage Skills",
                      description: "Maintain the platform's skills catalogue.",
                      icon: BookOpen,
                      section: "skills",
                    },
                    {
                      title: "Learning Resources",
                      description: "Manage educational videos and articles.",
                      icon: Library,
                      section: "resources",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        className="cyc-admin-management-card"
                        key={item.title}
                        type="button"
                        onClick={() => navigate(item.section)}
                      >
                        <div className="cyc-admin-management-icon">
                          <Icon size={23} />
                        </div>

                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>

                          <span>
                            Manage <ArrowRight size={16} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {active === "users" && (
            <section className="cyc-admin-panel">
              <div className="cyc-admin-section-heading">
                <div>
                  <h1>Registered Users</h1>
                  <p>View accounts registered on CtrlYourCareer.</p>
                </div>
              </div>

              <div className="cyc-admin-table-wrapper">
                <table className="cyc-admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email Address</th>
                      <th>Role</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <strong>{record.username}</strong>
                        </td>

                        <td>{record.email}</td>

                        <td>
                          <span
                            className={`cyc-admin-role ${
                              record.role === "admin" ? "admin" : "user"
                            }`}
                          >
                            {record.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!loading && users.length === 0 && (
                  <p className="cyc-admin-empty">No users found.</p>
                )}
              </div>
            </section>
          )}

          {active === "monitoring" && <AdminUserMonitor />}
          {active === "employment" && <EmploymentPanel admin />}
          
          {active === "careers" && (
            <section className="cyc-admin-panel">
              <AdminCareerManager />
            </section>
          )}

          {active === "skills" && (
            <section className="cyc-admin-panel">
              <AdminSkillManager />
            </section>
          )}

          {active === "resources" && (
            <section className="cyc-admin-panel">
              <AdminResourceManager />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
