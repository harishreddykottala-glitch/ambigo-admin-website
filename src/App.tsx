import { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'

// Admin Components
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRealMap from './pages/admin/AdminRealMap'
import AdminLiveBookings from './pages/admin/AdminLiveBookings'
import AdminFleetControl from './pages/admin/AdminFleetControl'
import AdminVerifyDrivers from './pages/admin/AdminVerifyDrivers'
import AdminUsers from './pages/admin/AdminUsers'
import AdminHospitals from './pages/admin/AdminHospitals'
import AdminCoAdmins from './pages/admin/AdminCoAdmins'
import AdminRideTracker from './pages/admin/AdminRideTracker'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="map" element={<AdminRealMap />} />
          <Route path="bookings" element={<AdminLiveBookings />} />
          <Route path="live-ride/:id" element={<AdminRideTracker />} />
          <Route path="fleet" element={<AdminFleetControl />} />
          <Route path="verify-drivers" element={<AdminVerifyDrivers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="co-admins" element={<AdminCoAdmins />} />
        </Route>

        <Route path="*" element={<div style={{padding: 50, textAlign: 'center'}}><h2>404 Not Found</h2><p>React Router failed to match this path.</p></div>} />
      </Routes>
    </>
  )
}

export default App
