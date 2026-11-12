
import { useState } from 'react'
import { Link } from 'react-router-dom'
import CareerForm from '../components/CareerForm'
import CareerList from '../components/CareerList'

function ExploreCareers() {
  const [careers, setCareers] = useState([
    {
      id: 1,
      title: 'Frontend Developer',
      category: 'Technology',
      description: 'Build websites and user interfaces using HTML, CSS and JavaScript.'
    },
    {
      id: 2,
      title: 'Backend Developer',
      category: 'Technology',
      description: 'Build server-side applications, APIs and manage databases.'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      category: 'Design',
      description: 'Design digital experiences that are useful and easy to navigate.'
    },
    {
      id: 4,
      title: 'Data Analyst',
      category: 'Data',
      description: 'Use data to identify patterns and support decision-making.'
    }
  ])

  const handleAddCareer = (newCareer) => {
    setCareers((currentCareers) => [
      ...currentCareers,
      { ...newCareer, id: Date.now() }
    ])
  }

  const handleDeleteCareer = (id) => {
    setCareers((currentCareers) =>
      currentCareers.filter((career) => career.id !== id)
    )
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

      <section className="mb-10">
        <CareerForm onSubmit={handleAddCareer} />
      </section>

      <section className="mb-10">
        <CareerList
          careers={careers}
          onDelete={handleDeleteCareer}
        />
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
