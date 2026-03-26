import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Insights from './pages/Insights.jsx'
import Roadmap from './pages/Roadmap.jsx'
import Experiences from './pages/Experiences.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/start" element={<Onboarding />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
