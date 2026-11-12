
import { useState } from 'react'

function SkillForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
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

    if (!formData.name.trim()) return

    onSubmit({
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description.trim()
    })

    setFormData({
      name: '',
      category: '',
      description: ''
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-semibold">Add a Skill</h2>

      <div>
        <label className="mb-1 block font-medium">Skill Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Python"
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
          placeholder="e.g. Programming"
          className="w-full rounded-md border p-3"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the skill"
          rows="3"
          className="w-full rounded-md border p-3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-yellow-500 px-6 py-3 font-semibold text-black hover:bg-yellow-400 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add Skill'}
      </button>
    </form>
  )
}

export default SkillForm
