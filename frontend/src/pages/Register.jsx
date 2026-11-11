
import { Link } from 'react-router-dom'

function Register() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md border border-gray-300 p-8">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Create Your Account
        </h1>

        <p className="mb-7 text-sm leading-6 text-gray-600">
          Start discovering your skills and career opportunities.
        </p>

        <form className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Full Name</label>
            <input type="text" placeholder="Enter your full name" required className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email Address</label>
            <input type="email" placeholder="Enter your email" required className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input type="password" placeholder="Create a password" required className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Confirm Password</label>
            <input type="password" placeholder="Confirm your password" required className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Account Type</label>
            <select required defaultValue="" className="w-full border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900">
              <option value="" disabled>Select account type</option>
              <option value="student">Student / Job Seeker</option>
              <option value="mentor">Mentor</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>

          <button type="submit" className="mt-3 bg-gray-900 py-3 text-white hover:bg-gray-700">
            Create Account
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-gray-900 underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Register
