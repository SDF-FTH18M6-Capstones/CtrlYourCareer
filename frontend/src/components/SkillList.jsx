function SkillList({ skills = [], onDelete, loading = false }) {
  if (loading) {
    return <p className="py-8 text-center text-gray-500">Loading skills...</p>
  }

  if (skills.length === 0) {
    return <p className="py-8 text-center text-gray-500">No skills available yet.</p>
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <article
          key={skill.id}
          className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <span className="mb-3 w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {skill.category || 'Uncategorized'}
          </span>

          <h3 className="mb-2 text-lg font-bold text-gray-900">
            {skill.name}
          </h3>

          <p className="mb-5 flex-1 text-sm leading-6 text-gray-600">
            {skill.description || 'No description available.'}
          </p>

          <button
            type="button"
            onClick={() => onDelete(skill.id)}
            className="w-fit rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
        </article>
      ))}
    </div>
  )
}

export default SkillList
