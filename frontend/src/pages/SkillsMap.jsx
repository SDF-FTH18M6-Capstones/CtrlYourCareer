
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SkillForm from '../components/SkillForm'
import SkillList from '../components/SkillList'
import { getSkills, createSkill, deleteSkill } from '../services/api'

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

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="mb-10">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">
          My Skills Map
        </h1>

        <p className="leading-7 text-gray-600">
          Identify your current skills and discover areas where you can grow.
        </p>
      </section>

      <section className="mb-8 bg-gray-100 p-7">
        <h2 className="mb-3 text-2xl font-bold">My Skills Overview</h2>
        <p className="text-gray-600">
          Build your personal skills profile by adding the skills you know.
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
        <SkillForm onSubmit={handleAddSkill} loading={saving} />
      </section>

      <section>
        {loading ? (
          <p className="text-gray-600">Loading skills...</p>
        ) : (
          <SkillList
            skills={skills}
            onDelete={handleDeleteSkill}
          />
        )}
      </section>

      <section className="mt-10 bg-gray-100 p-8">
        <h2 className="mb-3 text-2xl font-bold">Want to discover more?</h2>
        <p className="mb-6 text-gray-600">
          Explore careers and find out which skills are needed for different career paths.
        </p>

        <Link
          to="/explore-careers"
          className="inline-block bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
        >
          Explore Careers
        </Link>
      </section>
    </main>
  )
}

export default SkillsMap
