
import { Link } from 'react-router-dom'

function Register() {
  return (
    <main className="min-h-screen bg-white px-5 py-10">
      <div className="mx-auto max-w-3xl">

        <section className="mb-8 rounded-2xl bg-blue-600 px-7 py-10 text-white shadow-md md:px-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-100">
            CtrlYourCareer
          </p>

          <h1 className="mb-4 text-3xl font-bold">
            Your future starts here!
          </h1>

          <p className="leading-7 text-blue-100">
            Create your account and begin discovering your skills,
            exploring career opportunities and planning your professional growth.
          </p>
        </section>

        <section className="px-4 py-5 md:px-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-800">
            Create Your Account
          </h2>

          <p className="mb-8 text-gray-500">
            Join CtrlYourCareer and take control of your career journey.
          </p>

          <form className="flex flex-col gap-5">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="accountType" className="mb-2 block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                id="accountType"
                name="accountType"
                required
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>Select account type</option>
                <option value="student">Student / Job Seeker</option>
                <option value="mentor">Mentor</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Create Account
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default Register
