import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CareerForm from '../components/CareerForm'
import CareerList from '../components/CareerList'
import { getCareers, createCareer, deleteCareer } from '../services/api'

function ExploreCareers() {
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Careers')

  const categories = ['All Careers', 'Technology', 'Design', 'Business']

  useEffect(() => {
    const loadCareers = async () => {
      try {
        const data = await getCareers()
        setCareers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCareers()
  }, [])

  const filteredCareers = useMemo(() => {
    if (activeCategory === 'All Careers') return careers

    return careers.filter(
      (career) => career.category?.toLowerCase() === activeCategory.toLowerCase()
    )
  }, [careers, activeCategory])

  const handleAddCareer = async (newCareer) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const createdCareer = await createCareer(newCareer)
      setCareers((currentCareers) => [...currentCareers, createdCareer])
      setActiveCategory('All Careers')
      setSuccess('Career added successfully!')
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCareer = async (id) => {
    setError('')
    setSuccess('')

    try {
      await deleteCareer(id)
      setCareers((currentCareers) =>
        currentCareers.filter((career) => career.id !== id)
      )
      setSuccess('Career deleted successfully!')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <section className="mb-10 rounded-2xl bg-blue-700 px-7 py-12 text-white shadow-md md:px-12 md:py-16">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-100">
              Discover your future
            </p>

            <h1 className="mb-5 text-3xl font-bold md:text-5xl">
              Explore Careers
            </h1>

            <p className="max-w-2xl text-base leading-7 text-blue-50 md:text-lg">
              Discover different career paths, explore opportunities and find
              a direction that matches your interests and strengths.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/skills-map"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Explore My Skills
              </Link>

              <a
                href="#career-list"
                className="rounded-lg border border-white px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
              >
                Browse Careers
              </a>
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
              Available Career Paths
            </p>
            <h2 className="text-3xl font-bold text-blue-700">
              {loading ? '...' : careers.length}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Career opportunities currently listed
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="mb-2 text-sm font-medium text-gray-500">
              Your Next Step
            </p>
            <h2 className="text-xl font-bold text-gray-900">
              Understand Your Skills
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Explore the competencies needed for different career paths.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
              Career management
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Add a Career Path
            </h2>
            <p className="mt-2 text-gray-600">
              Add career information to the platform.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <CareerForm onSubmit={handleAddCareer} loading={saving} />
          </div>
        </section>

        <section id="career-list" className="mb-12 scroll-mt-8">
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
              Find your direction
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              Available Careers
            </h2>
            <p className="mt-2 text-gray-600">
              Explore career paths available on CtrlYourCareer.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeCategory === category
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'border border-gray-300 bg-white text-gray-700 hover:border-blue-600 hover:text-blue-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mb-5 flex justify-between text-sm text-gray-500">
            <span>
              {loading ? 'Loading careers...' : `${filteredCareers.length} careers found`}
            </span>
            <span>{activeCategory}</span>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            {loading ? (
              <p className="py-8 text-center text-gray-500">
                Loading careers...
              </p>
            ) : filteredCareers.length === 0 ? (
              <div className="py-10 text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  No careers found
                </h3>
                <p className="text-gray-500">
                  There are no careers in this category yet. Try another category.
                </p>
              </div>
            ) : (
              <CareerList
                careers={filteredCareers}
                onDelete={handleDeleteCareer}
              />
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-blue-700 p-8 text-white shadow-md md:p-10">
          <div className="max-w-2xl">
            <h2 className="mb-3 text-2xl font-bold">
              Not sure where to start?
            </h2>

            <p className="mb-6 leading-7 text-blue-50">
              Review your current skills, understand your strengths and
              identify areas you would like to improve as you work towards
              your career goals.
            </p>

            <Link
              to="/skills-map"
              className="inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              View My Skills Map
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ExploreCareers
