import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="bg-white">
      <section className="flex min-h-[480px] items-center justify-center bg-blue-700 px-5 py-16 text-center text-white">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold tracking-[2px] text-blue-100">
            WELCOME TO CTRL YOUR CAREER
          </p>

          <h1 className="mb-5 text-4xl font-bold leading-tight md:text-6xl">
            Discover Your Skills.
            <br />
            Map Your Future.
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-blue-100 md:text-lg">
            Understand your strengths, discover career opportunities
            and build the skills you need to achieve your goals.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-lg bg-white px-7 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Get Started
            </Link>

            <Link
              to="/explore-careers"
              className="rounded-lg border border-white px-7 py-3 font-semibold text-white transition hover:bg-blue-600"
            >
              Explore Careers
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-700">
            Your future begins with a plan
          </p>

          <h2 className="mb-10 text-2xl font-bold text-gray-900 md:text-3xl">
            How CtrlYourCareer Helps You
          </h2>

          <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-700">
                01
              </div>

              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Discover Your Skills
              </h3>

              <p className="leading-7 text-gray-600">
                Identify your strengths and understand the skills you already have.
              </p>

              <Link
                to="/skills-map"
                className="mt-5 inline-block font-semibold text-blue-700 hover:text-blue-900"
              >
                View Skills Map →
              </Link>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-700">
                02
              </div>

              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Explore Careers
              </h3>

              <p className="leading-7 text-gray-600">
                Discover career paths that match your interests and ambitions.
              </p>

              <Link
                to="/explore-careers"
                className="mt-5 inline-block font-semibold text-blue-700 hover:text-blue-900"
              >
                Explore Careers →
              </Link>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-700">
                03
              </div>

              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Build Your Future
              </h3>

              <p className="leading-7 text-gray-600">
                Identify areas for growth and develop your professional abilities.
              </p>

              <Link
                to="/register"
                className="mt-5 inline-block font-semibold text-blue-700 hover:text-blue-900"
              >
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 px-5 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
          Your Career Journey Starts Here
        </h2>

        <p className="mx-auto mb-7 max-w-xl leading-7 text-gray-600">
          Take the first step towards understanding your strengths and
          discovering your future opportunities.
        </p>

        <Link
          to="/register"
          className="inline-block rounded-lg bg-blue-700 px-7 py-3 font-semibold text-white transition hover:bg-blue-800"
        >
          Create an Account
        </Link>
      </section>
    </main>
  )
}

export default Home
