import { useState } from 'react'

function CareerList({ careers = [], onDelete, loading = false }) {
  const [expandedCareer, setExpandedCareer] = useState(null)

  if (loading) {
    return <p className="py-8 text-center text-gray-500">Loading careers...</p>
  }

  if (careers.length === 0) {
    return <p className="py-8 text-center text-gray-500">No careers available yet.</p>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {careers.map((career) => (
        <article
          key={career.id}
          className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <span className="mb-4 w-fit rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            {career.category || 'Uncategorized'}
          </span>

          <h3 className="mb-3 text-xl font-bold text-gray-900">
            {career.title}
          </h3>

          <p className="mb-5 text-sm leading-6 text-gray-600">
            {expandedCareer === career.id
              ? career.description || 'No description available.'
              : `${(career.description || 'No description available.').slice(0, 100)}${(career.description || '').length > 100 ? '...' : ''}`}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setExpandedCareer(
                expandedCareer === career.id ? null : career.id
              )}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              {expandedCareer === career.id ? 'Show Less' : 'Learn More'}
            </button>

            <button
              type="button"
              onClick={() => onDelete(career.id)}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default CareerList
