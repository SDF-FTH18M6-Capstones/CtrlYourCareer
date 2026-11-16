import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SkillForm from '../components/SkillForm'
import SkillList from '../components/SkillList'
import { getSkills, createSkill, deleteSkill } from '../services/api'

const categories = [
  'Communication',
  'Problem Solving',
  'Programming',
  'Leadership',
  'Creativity',
  'Teamwork'
]

function SkillsMap() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await getSkills()
        setSkills(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSkills()
  }, [])

  const handleAddSkill = async (newSkill) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const createdSkill = await createSkill(newSkill)
      setSkills((currentSkills) => [...currentSkills, createdSkill])
      setSuccess('Skill added successfully!')
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSkill = async (id) => {
    setError('')
    setSuccess('')

    try {
      await deleteSkill(id)
      setSkills((currentSkills) =>
        currentSkills.filter((skill) => skill.id !== id)
      )
      setSuccess('Skill deleted successfully!')
    } catch (err) {
      setError(err.message)
    }
  }

  const getCategoryCount = (category) =>
    skills.filter(
      (skill) =>
        skill.category?.toLowerCase() === category.toLowerCase()
    ).length

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <section className="mb-10 overflow-hidden rounded-2xl bg-blue-700 px-7 py-10 text-white shadow-lg md:px-12 md:py-14">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-100">
              Understand your strengths
            </p>

            <h1 className="mb-5 text-3xl font-bold leading-tight md:text-5xl">
              My Skills Map
            </h1>

            <p className="max-w-2xl text-base leading-7 text-blue-100 md:text-lg">
              Build your personal skills profile, track what you know and
              identify areas where you can grow to reach your career goals.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#add-skill"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Add a Skill
              </a>

              <Link
                to="/explore-careers"
                className="rounded-lg border border-white/70 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
              >
                Explore Careers
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        <section className="mb-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-sm font-medium text-gray-500">
              Skills Added
            </p>

            <h2 className="text-3xl font-bold text-blue-700">
              {loading ? '...' : skills.length}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Skills in your personal profile
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-sm font-medium text-gray-500">
              Skill Categories
            </p>

            <h2 className="text-3xl font-bold text-blue-700">6</h2>

            <p className="mt-2 text-sm text-gray-500">
              Areas to explore and develop
            </p>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
              Your skills overview
            </p>

            <h2 className="text-2xl font-bold text-gray-900">
              Explore Skill Categories
            </h2>

            <p className="mt-2 text-gray-600">
              Discover the six skill areas that support your career growth.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {category}
                  </h3>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {loading ? '...' : getCategoryCount(category)}
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-blue-50">
                  <div className="h-1.5 w-full rounded-full bg-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="add-skill" className="mb-10 scroll-mt-8">
          <div className="mb-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
              Build your profile
            </p>

            <h2 className="text-2xl font-bold text-gray-900">
              Add Your Skills
            </h2>

            <p className="mt-2 text-gray-600">
              Record the skills and competencies you currently have.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <SkillForm onSubmit={handleAddSkill} loading={saving} />
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
                Your personal profile
              </p>

              <h2 className="text-2xl font-bold text-gray-900">
                My Current Skills
              </h2>

              <p className="mt-2 text-gray-600">
                View and manage the skills you have added.
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              {loading ? 'Loading...' : `${skills.length} skills`}
            </span>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <SkillList
              skills={skills}
              onDelete={handleDeleteSkill}
              loading={loading}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm md:p-10">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
              Take the next step
            </p>

            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Discover Your Career Opportunities
            </h2>

            <p className="mb-6 leading-7 text-gray-600">
              Explore different career paths and learn about the skills
              required to pursue them.
            </p>

            <Link
              to="/explore-careers"
              className="inline-flex rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Explore Careers
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

export default SkillsMap
