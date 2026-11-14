
import { Link } from 'react-router-dom'

function Login() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md border border-gray-300 p-8">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Welcome Back
        </h1>

        <p className="mb-8 text-sm leading-6 text-gray-600">
          Log in to continue your career journey.
        </p>

        <form className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              required
              className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-gray-900 py-3 text-white hover:bg-gray-700"
          >
            Login
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-gray-900 underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Login
