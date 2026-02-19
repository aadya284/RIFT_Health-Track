import { Routes, Route } from 'react-router-dom'
import Header from './layout/Header.jsx'
import Navbar from './layout/Navbar.jsx'
import Footer from './layout/Footer.jsx'
import Home from './pages/Home.jsx'
import Analyze from './pages/Analyze.jsx'
import Results from './pages/Results.jsx'
import About from './pages/About.jsx'
import Documentation from './pages/Documentation.jsx'

function NotFound() {
  return (
    <main id="main-content" className="max-w-6xl mx-auto px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-gov-blue mb-3">404 – Page Not Found</h1>
      <p className="text-sm text-gov-muted">The requested page does not exist.</p>
    </main>
  )
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-gov-blue focus:text-white focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>

      <Header />
      <Navbar />

      <div className="flex-1 bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/results" element={<Results />} />
          <Route path="/about" element={<About />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}
