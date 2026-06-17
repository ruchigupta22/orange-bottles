import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home      from './pages/Home'       // ← capital H
import Feed      from './pages/Feed'       // ← capital F
import MyJourney from './pages/MyJourney'  // ← capital M, J
import PageWrapper from './components/PageWrapper'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"        element={<PageWrapper><Home /></PageWrapper>}      />
        <Route path="/feed"    element={<PageWrapper><Feed /></PageWrapper>}      />
        <Route path="/journey" element={<PageWrapper><MyJourney /></PageWrapper>} />
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



