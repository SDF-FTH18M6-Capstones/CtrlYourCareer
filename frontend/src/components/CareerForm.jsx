
import { useState } from 'react'

function CareerForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.title.trim()) return

    onSubmit({
      title: formData.title.trim(),
      category: formData.category.trim(),
      description: formData.description.trim()
    })

    setFormData({
      title: '',
      category: '',
      description: ''
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-semibold">Add a Career</h2>

      <div>
        <label className="mb-1 block font-medium">Career Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Software Developer"
          required
          className="w-full rounded-md border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g. Technology"
          className="w-full rounded-md border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe this career"
          rows="3"
          className="w-full rounded-md border p-3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-yellow-500 px-6 py-3 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add Career'}
      </button>
    </form>
  )
}

export default CareerForm
