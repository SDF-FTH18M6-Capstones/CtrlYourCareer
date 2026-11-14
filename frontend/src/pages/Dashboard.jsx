
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSkills, getCareers } from '../services/api'

function Dashboard() {
  const [skillsCount, setSkillsCount] = useState(0)
  const [careersCount, setCareersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [skills, careers] = await Promise.all([
          getSkills(),
          getCareers()
        ])

        setSkillsCount(Array.isArray(skills) ? skills.length : 0)
        setCareersCount(Array.isArray(careers) ? careers.length : 0)
      } catch {
        setError('Unable to load dashboard statistics. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const roadmap = [
    {
      number: '01',
      title: 'Assess Your Skills',
      description: 'Complete practical assessments to understand your technical, professional and interpersonal abilities.'
    },
    {
      number: '02',
      title: 'Discover Career Matches',
      description: 'Explore career opportunities based on your skills, interests and professional strengths.'
    },
    {
      number: '03',
      title: 'Identify Skill Gaps',
      description: 'Understand which skills you need to improve for your preferred career.'
    },
    {
      number: '04',
      title: 'Build Your Career',
      description: 'Access learning resources, develop new abilities and monitor your professional growth.'
    }
  ]

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">

        <section className="mb-10 rounded-xl bg-blue-600 px-6 py-12 text-white md:px-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-100">
            Your Career Dashboard
          </p>

          <h1 className="mb-4 text-3xl font-bold md:text-5xl">
            Welcome to Your Career Journey!
          </h1>

          <p className="mb-7 max-w-2xl text-base leading-7 text-blue-50">
            Discover your strengths, explore career opportunities and
            develop the skills you need to achieve your professional goals.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/explore-careers"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Explore Careers
            </Link>

            <Link
              to="/skills-map"
              className="rounded-lg border border-white px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              View My Skills
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Dashboard Overview
            </h2>
            <p className="mt-2 text-gray-600">
              Keep track of your skills and career development journey.
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-3 text-sm font-medium text-gray-500">
                My Skills
              </p>
              <p className="text-4xl font-bold text-blue-600">
                {loading ? '...' : skillsCount}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Skills currently available
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-3 text-sm font-medium text-gray-500">
                Career Paths
              </p>
              <p className="text-4xl font-bold text-blue-600">
                {loading ? '...' : careersCount}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Career options available
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-3 text-sm font-medium text-gray-500">
                My Assessment
              </p>
              <p className="text-2xl font-bold text-gray-800">
                Not Started
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Skills evaluation status
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-3 text-sm font-medium text-gray-500">
                Career Matches
              </p>
              <p className="text-2xl font-bold text-gray-800">
                Not Started
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Personalized recommendations
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Quick Access
            </h2>
            <p className="mt-2 text-gray-600">
              Access the tools you need to manage your career journey.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl text-blue-600">
                ◈
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">
                My Skills
              </h3>
              <p className="mb-6 text-sm leading-7 text-gray-600">
                Build your skills profile and keep track of your abilities and competencies.
              </p>
              <Link
                to="/skills-map"
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Manage My Skills →
              </Link>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl text-blue-600">
                ◎
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">
                Explore Careers
              </h3>
              <p className="mb-6 text-sm leading-7 text-gray-600">
                Discover occupations, explore career requirements and learn about opportunities.
              </p>
              <Link
                to="/explore-careers"
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Explore Opportunities →
              </Link>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl text-blue-600">
                ↗
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">
                My Development
              </h3>
              <p className="mb-6 text-sm leading-7 text-gray-600">
                Follow learning recommendations and monitor your professional development.
              </p>
              <span className="text-sm font-semibold text-gray-500">
                Not Started
              </span>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Career Development Roadmap
            </h2>
            <p className="mt-2 text-gray-600">
              Four stages to guide your professional development.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="space-y-7">
              {roadmap.map((step, index) => (
                <div key={step.number} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                      {step.number}
                    </div>

                    {index !== roadmap.length - 1 && (
                      <div className="mt-2 min-h-8 w-px flex-1 bg-blue-100" />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {step.title}
                      </h3>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        Not Started
                      </span>
                    </div>

                    <p className="max-w-3xl text-sm leading-7 text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-blue-100 bg-blue-50 p-8 md:flex md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Your Future Starts With Your Skills.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-gray-600">
              Review your existing skills and explore career opportunities
              that can help you move closer to your professional goals.
            </p>
          </div>

          <Link
            to="/skills-map"
            className="mt-6 inline-block shrink-0 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700 md:mt-0"
          >
            Review My Skills
          </Link>
        </section>

      </div>
    </main>
  )
}

export default Dashboard
