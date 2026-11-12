
function SkillList({ skills = [], onDelete, loading = false }) {
  if (loading) {
    return <p className="py-4 text-gray-500">Loading skills...</p>
  }

  if (skills.length === 0) {
    return <p className="py-4 text-gray-500">No skills available yet.</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Available Skills</h2>

      {skills.map((skill) => (
        <div
          key={skill.id}
          className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm"
        >
          <div>
            <h3 className="font-semibold">{skill.name}</h3>
            <p className="text-sm text-gray-600">
              {skill.category || 'Uncategorized'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {skill.description || 'No description available'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(skill.id)}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

export default SkillList
