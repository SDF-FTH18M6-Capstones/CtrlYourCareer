
import { Link } from 'react-router-dom'

function Login() {
  return (
    <main className="min-h-screen bg-white px-5 py-10">
      <div className="mx-auto max-w-3xl">

        <section className="mb-8 rounded-2xl bg-blue-600 px-7 py-10 text-white shadow-md md:px-10">
          <div className="mb-4 text-3xl">🚀</div>

          <h1 className="mb-4 text-3xl font-bold">
            Your future starts here.
          </h1>

          <p className="mb-6 leading-7 text-blue-100">
            Discover your strengths, explore exciting career paths and take
            control of your professional journey.
          </p>

          <div className="space-y-2 text-sm text-white">
            <p>✓ Discover your skills</p>
            <p>✓ Explore career opportunities</p>
            <p>✓ Build your future</p>
          </div>
        </section>

        <section className="px-4 py-5 md:px-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-800">
            Welcome back!
          </h2>

          <p className="mb-8 text-gray-500">
            Log in to continue your career journey.
          </p>

          <form className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Login
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </section>

      </div>
    </main>
  )
}

export default Login
