
import { useState } from 'react'
import { Link } from 'react-router-dom'
import SkillForm from '../components/SkillForm'
import SkillList from '../components/SkillList'

function SkillsMap() {
  const [skills, setSkills] = useState([
    { id: 1, name: 'HTML', category: 'Technical Skills', description: 'Building web page structure' },
    { id: 2, name: 'CSS', category: 'Technical Skills', description: 'Styling web pages' },
    { id: 3, name: 'JavaScript', category: 'Technical Skills', description: 'Adding interactivity to websites' },
    { id: 4, name: 'Python', category: 'Programming', description: 'Programming and problem solving' }
  ])

  const handleAddSkill = (newSkill) => {
    setSkills((currentSkills) => [
      ...currentSkills,
      { ...newSkill, id: Date.now() }
    ])
  }

  const handleDeleteSkill = (id) => {
    setSkills((currentSkills) =>
      currentSkills.filter((skill) => skill.id !== id)
    )
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

      <section className="mb-10">
        <SkillForm onSubmit={handleAddSkill} />
      </section>

      <section>
        <SkillList
          skills={skills}
          onDelete={handleDeleteSkill}
        />
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
