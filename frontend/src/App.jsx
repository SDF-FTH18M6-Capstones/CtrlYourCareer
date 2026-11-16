import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SkillsMap from './pages/SkillsMap'
import ExploreCareers from './pages/ExploreCareers'

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/skills-map" element={<SkillsMap />} />
          <Route path="/explore-careers" element={<ExploreCareers />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}

export default App
