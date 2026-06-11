import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Feed from './pages/Feed'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"     element={<Home />} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </BrowserRouter>
  )
}