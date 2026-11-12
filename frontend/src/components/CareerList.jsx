
function CareerList({ careers = [], onDelete, loading = false }) {
  if (loading) {
    return <p className="py-4 text-gray-500">Loading careers...</p>
  }

  if (careers.length === 0) {
    return <p className="py-4 text-gray-500">No careers available yet.</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Available Careers</h2>

      {careers.map((career) => (
        <div
          key={career.id}
          className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm"
        >
          <div>
            <h3 className="font-semibold">{career.title}</h3>
            <p className="text-sm text-gray-600">
              {career.category || 'Uncategorized'}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {career.description || 'No description available'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onDelete(career.id)}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

export default CareerList
