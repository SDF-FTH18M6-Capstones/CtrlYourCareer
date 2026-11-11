
import { Link } from 'react-router-dom'

function ExploreCareers() {
  const careers = [
    {
      title: 'Frontend Developer',
      description: 'Build websites and user interfaces using HTML, CSS and JavaScript.',
      skills: ['HTML', 'CSS', 'JavaScript', 'React']
    },
    {
      title: 'Backend Developer',
      description: 'Build server-side applications, APIs and manage databases.',
      skills: ['Python', 'Flask', 'SQL', 'APIs']
    },
    {
      title: 'UI/UX Designer',
      description: 'Design digital experiences that are useful and easy to navigate.',
      skills: ['Figma', 'Wireframing', 'Prototyping', 'Research']
    },
    {
      title: 'Data Analyst',
      description: 'Use data to identify patterns and support decision-making.',
      skills: ['Python', 'SQL', 'Excel', 'Data Visualization']
    }
  ]

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

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {careers.map((career) => (
          <div key={career.title} className="border border-gray-300 p-7">
            <h2 className="mb-4 text-xl font-bold">{career.title}</h2>

            <p className="mb-6 leading-7 text-gray-600">
              {career.description}
            </p>

            <h3 className="mb-3 font-bold">Skills Required</h3>

            <div className="mb-6 flex flex-wrap gap-2">
              {career.skills.map((skill) => (
                <span key={skill} className="border border-gray-300 px-3 py-2 text-sm">
                  {skill}
                </span>
              ))}
            </div>

            <Link to="/skills-map" className="font-bold underline">
              Explore Required Skills
            </Link>
          </div>
        ))}
      </section>

      <section className="mt-10 bg-gray-100 p-8">
        <h2 className="mb-3 text-2xl font-bold">Not sure where to start?</h2>

        <p className="mb-6 text-gray-600">
          Review your skills and identify areas you would like to improve.
        </p>

        <Link to="/skills-map" className="inline-block bg-gray-900 px-6 py-3 text-white hover:bg-gray-700">
          View My Skills Map
        </Link>
      </section>
    </main>
  )
}

export default ExploreCareers
