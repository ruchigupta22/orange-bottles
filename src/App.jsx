import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import Home          from './pages/Home'
import Feed          from './pages/Feed'
import MyJourney     from './pages/MyJourney'
import Login         from './pages/Login'
import SetupUsername from './pages/SetupUsername'
import PageWrapper   from './components/PageWrapper'
import SendBottle  from './pages/SendBottle'
import UserProfile from './pages/UserProfile'

function AnimatedRoutes() {
  const location = useLocation()
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--parchment)' }}>
      <div style={{ fontSize: 36, animation: 'floatB 2s ease-in-out infinite' }}>🍶</div>
    </div>
  )

  // Logged in but no username yet
  if (user && !profile) return <SetupUsername />

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"        element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/feed"    element={<PageWrapper><Feed /></PageWrapper>} />
        <Route path="/journey" element={user ? <PageWrapper><MyJourney /></PageWrapper> : <Navigate to="/login" />} />
        <Route path="/login"   element={user ? <Navigate to="/" /> : <PageWrapper><Login /></PageWrapper>} />
        <Route path="/send"       element={<PageWrapper><SendBottle /></PageWrapper>} />
        <Route path="/u/:username" element={<PageWrapper><UserProfile /></PageWrapper>} />

      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}