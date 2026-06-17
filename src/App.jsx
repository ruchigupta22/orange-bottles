import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Feed from './pages/Feed'
import MyJourney  from './pages/MyJourney'
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



