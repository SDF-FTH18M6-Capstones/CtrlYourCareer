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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.title.trim().length < 2) return
    if (!formData.category) return
    if (formData.description.trim().length < 10) return

    try {
      await onSubmit({
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim()
      })

      setFormData({
        title: '',
        category: '',
        description: ''
      })
    } catch {
      return
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900">Add a Career</h2>

      <div>
        <label className="mb-2 block font-medium text-gray-700">Career Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Software Developer"
          minLength="2"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium text-gray-700">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Select a category</option>
          <option value="Technology">Technology</option>
          <option value="Design">Design</option>
          <option value="Business">Business</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe this career"
          minLength="10"
          rows="4"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add Career'}
      </button>
    </form>
  )
}

export default CareerForm
