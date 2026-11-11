
import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="flex flex-col items-center justify-between gap-5 border-b border-gray-300 bg-white px-6 py-5 md:flex-row md:px-12">
      <Link to="/" className="text-2xl font-bold tracking-tight text-gray-900">
        CtrlYourCareer
      </Link>

      <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-gray-700">
        <Link to="/" className="hover:text-black hover:underline">
          Home
        </Link>

        <Link to="/explore-careers" className="hover:text-black hover:underline">
          Explore Careers
        </Link>

        <Link to="/skills-map" className="hover:text-black hover:underline">
          Skills Map
        </Link>

        <Link to="/dashboard" className="hover:text-black hover:underline">
          Dashboard
        </Link>

        <Link to="/login" className="hover:text-black hover:underline">
          Login
        </Link>

        <Link
          to="/register"
          className="border border-gray-900 bg-gray-900 px-5 py-2 text-white hover:bg-gray-700"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
