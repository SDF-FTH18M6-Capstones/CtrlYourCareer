
import { Link } from 'react-router-dom'

function Home() {
  return (
    <main>
      <section className="flex min-h-[430px] items-center justify-center bg-gray-100 px-5 py-16 text-center">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm tracking-[2px] text-gray-600">
            WELCOME TO CTRL YOUR CAREER
          </p>

          <h1 className="mb-5 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            Discover Your Skills.
            <br />
            Map Your Future.
          </h1>

          <p className="mb-8 text-base leading-7 text-gray-600 md:text-lg">
            Understand your strengths, discover career opportunities
            and build the skills you need to achieve your goals.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="border border-gray-900 bg-gray-900 px-6 py-3 text-sm text-white hover:bg-gray-700">
              Get Started
            </Link>

            <Link to="/explore-careers" className="border border-gray-900 bg-white px-6 py-3 text-sm text-gray-900 hover:bg-gray-200">
              Explore Careers
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 text-center md:px-12">
        <h2 className="mb-10 text-2xl font-bold text-gray-900 md:text-3xl">
          How CtrlYourCareer Helps You
        </h2>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border border-gray-300 p-8 text-left">
            <h3 className="mb-4 text-lg font-bold">Discover Your Skills</h3>
            <p className="leading-7 text-gray-600">
              Identify your strengths and understand the skills you already have.
            </p>
          </div>

          <div className="border border-gray-300 p-8 text-left">
            <h3 className="mb-4 text-lg font-bold">Explore Careers</h3>
            <p className="leading-7 text-gray-600">
              Discover career paths that match your interests and ambitions.
            </p>
          </div>

          <div className="border border-gray-300 p-8 text-left">
            <h3 className="mb-4 text-lg font-bold">Build Your Future</h3>
            <p className="leading-7 text-gray-600">
              Identify skill gaps and develop your professional abilities.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-200 px-5 py-14 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Your Career Journey Starts Here
        </h2>

        <p className="mb-7 text-gray-600">
          Take the first step towards understanding your future.
        </p>

        <Link to="/register" className="inline-block bg-gray-900 px-6 py-3 text-sm text-white hover:bg-gray-700">
          Create an Account
        </Link>
      </section>
    </main>
  )
}

export default Home
