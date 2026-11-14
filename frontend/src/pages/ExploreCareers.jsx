
import { useEffect, useState } from 'react'
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

  const handleAddCareer = async (newCareer) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const createdCareer = await createCareer(newCareer)
      setCareers((currentCareers) => [...currentCareers, createdCareer])
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
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-10">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
          Explore Careers
        </h1>

        <p className="leading-7 text-gray-600">
          Discover career paths, understand the skills they require and find your next opportunity.
        </p>
      </section>

      {error && (
        <p className="mb-4 rounded bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 rounded bg-green-100 p-3 text-green-700">
          {success}
        </p>
      )}

      <section className="mb-10">
        <CareerForm onSubmit={handleAddCareer} loading={saving} />
      </section>

      <section className="mb-10">
        {loading ? (
          <p className="text-gray-600">Loading careers...</p>
        ) : (
          <CareerList
            careers={careers}
            onDelete={handleDeleteCareer}
          />
        )}
      </section>

      <section className="mt-10 bg-gray-100 p-8">
        <h2 className="mb-3 text-2xl font-bold">Not sure where to start?</h2>

        <p className="mb-6 text-gray-600">
          Review your skills and identify areas you would like to improve.
        </p>

        <Link
          to="/skills-map"
          className="inline-block bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
        >
          View My Skills Map
        </Link>
      </section>
    </main>
  )
}

export default ExploreCareers
