import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  const linkClass = ({ isActive }) =>
    `transition hover:text-blue-700 ${
      isActive ? 'font-semibold text-blue-700' : 'text-gray-700'
    }`

  return (
    <nav className="flex flex-col items-center justify-between gap-5 border-b border-gray-200 bg-white px-6 py-5 shadow-sm md:flex-row md:px-12">
      <Link
        to="/"
        className="text-2xl font-bold tracking-tight text-blue-700"
      >
        CtrlYourCareer
      </Link>

      <div className="flex flex-wrap items-center justify-center gap-5 text-sm">
        <NavLink to="/" end className={linkClass}>
          Home
        </NavLink>

        <NavLink to="/explore-careers" className={linkClass}>
          Explore Careers
        </NavLink>

        <NavLink to="/skills-map" className={linkClass}>
          Skills Map
        </NavLink>

        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/login" className={linkClass}>
          Login
        </NavLink>

        <Link
          to="/register"
          className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-800"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
