import { useState } from 'react'

function SkillForm({ onSubmit, loading = false }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: ''
  })

  const categories = [
    'Communication',
    'Problem Solving',
    'Programming',
    'Leadership',
    'Creativity',
    'Teamwork'
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.name.trim().length < 2) return
    if (!formData.category) return

    try {
      await onSubmit({
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim()
      })

      setFormData({
        name: '',
        category: '',
        description: ''
      })
    } catch {
      return
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-900">Add a Skill</h2>

      <div>
        <label className="mb-2 block font-medium text-gray-700">Skill Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Python"
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
          <option value="">Select a skill category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the skill"
          rows="4"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add Skill'}
      </button>
    </form>
  )
}

export default SkillForm
