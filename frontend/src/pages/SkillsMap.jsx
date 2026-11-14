
import { Link } from 'react-router-dom'

function SkillsMap() {
  const skills = [
    {
      category: 'Technical Skills',
      items: ['HTML', 'CSS', 'JavaScript', 'Python']
    },
    {
      category: 'Professional Skills',
      items: ['Communication', 'Problem Solving', 'Teamwork', 'Time Management']
    }
  ]

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
          Start building your personal skills profile by identifying what you know.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {skills.map((group) => (
          <div key={group.category} className="border border-gray-300 p-7">
            <h3 className="mb-6 text-xl font-bold">{group.category}</h3>

            <div className="flex flex-wrap gap-3">
              {group.items.map((skill) => (
                <span key={skill} className="border border-gray-300 px-4 py-3 text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10 bg-gray-100 p-8">
        <h2 className="mb-3 text-2xl font-bold">Want to discover more?</h2>
        <p className="mb-6 text-gray-600">
          Explore careers and find out which skills are needed for different career paths.
        </p>

        <Link to="/explore-careers" className="inline-block bg-gray-900 px-6 py-3 text-white hover:bg-gray-700">
          Explore Careers
        </Link>
      </section>
    </main>
  )
}

export default SkillsMap
