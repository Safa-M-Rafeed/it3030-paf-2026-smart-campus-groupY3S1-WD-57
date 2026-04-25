import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import FacilitiesPage from './features/facilities/FacilitiesPage.jsx'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
