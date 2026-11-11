
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="border-t border-gray-300 bg-gray-100 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
        <div>
          <h2 className="text-lg font-bold text-gray-900">CtrlYourCareer</h2>
          <p className="mt-2 text-sm text-gray-600">
            Discover your skills. Map your future.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-5 text-sm text-gray-600">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/explore-careers" className="hover:underline">Careers</Link>
          <Link to="/skills-map" className="hover:underline">Skills Map</Link>
          <Link to="/login" className="hover:underline">Login</Link>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500">
        © 2026 CtrlYourCareer. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer
