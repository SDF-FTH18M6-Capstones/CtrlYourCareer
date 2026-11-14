
import { Link } from 'react-router-dom'

function Dashboard() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-10">
        <p className="mb-3 text-sm uppercase tracking-widest text-gray-500">
          Your Workspace
        </p>

        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
          Welcome to Your Dashboard
        </h1>

        <p className="leading-7 text-gray-600">
          Track your progress and take the next step in your career journey.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="border border-gray-300 p-7">
          <h2 className="mb-4 text-xl font-bold">My Skills</h2>
          <p className="mb-6 leading-7 text-gray-600">
            View and manage the skills you have identified.
          </p>
          <Link to="/skills-map" className="font-bold underline">
            View Skills
          </Link>
        </div>

        <div className="border border-gray-300 p-7">
          <h2 className="mb-4 text-xl font-bold">Explore Careers</h2>
          <p className="mb-6 leading-7 text-gray-600">
            Discover career paths that match your interests.
          </p>
          <Link to="/explore-careers" className="font-bold underline">
            Explore Careers
          </Link>
        </div>

        <div className="border border-gray-300 p-7">
          <h2 className="mb-4 text-xl font-bold">My Progress</h2>
          <p className="mb-6 leading-7 text-gray-600">
            Keep track of your career development journey.
          </p>
          <Link to="/skills-map" className="font-bold underline">
            View Progress
          </Link>
        </div>
      </section>

      <section className="mt-10 bg-gray-100 p-8">
        <h2 className="mb-3 text-2xl font-bold">Ready for your next step?</h2>
        <p className="mb-6 text-gray-600">
          Start exploring careers and identify the skills you need to grow.
        </p>
        <Link to="/explore-careers" className="inline-block bg-gray-900 px-6 py-3 text-white hover:bg-gray-700">
          Get Started
        </Link>
      </section>
    </main>
  )
}

export default Dashboard
