import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing        from './pages/Landing'
import Login          from './pages/Login'
import Register       from './pages/Register'
import Listings       from './pages/Listings'
import ListingDetail  from './pages/ListingDetail'
import CreateListing  from './pages/CreateListing'
import EditListing    from './pages/EditListing'
import TenantProfile  from './pages/TenantProfile'
import OwnerDashboard from './pages/OwnerDashboard'
import TenantDashboard from './pages/TenantDashboard'
import Chat           from './pages/Chat'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', borderRadius: '12px', border: '1px solid #E8E2D9' } }}/>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Tenant only */}
          <Route path="/listings" element={<ProtectedRoute allowedRoles={['tenant']}><Listings /></ProtectedRoute>} />
          <Route path="/listings/:id" element={<ProtectedRoute allowedRoles={['tenant']}><ListingDetail /></ProtectedRoute>} />
          <Route path="/tenant/profile"   element={<ProtectedRoute allowedRoles={['tenant']}><TenantProfile /></ProtectedRoute>} />
          <Route path="/tenant/dashboard" element={<ProtectedRoute allowedRoles={['tenant']}><TenantDashboard /></ProtectedRoute>} />

          {/* Owner only */}
          <Route path="/owner/dashboard"         element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/listings/new"      element={<ProtectedRoute allowedRoles={['owner']}><CreateListing /></ProtectedRoute>} />
          <Route path="/owner/listings/:id/edit" element={<ProtectedRoute allowedRoles={['owner']}><EditListing /></ProtectedRoute>} />

          {/* Both */}
          <Route path="/chat/:interestId" element={<ProtectedRoute allowedRoles={['tenant','owner']}><Chat /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
