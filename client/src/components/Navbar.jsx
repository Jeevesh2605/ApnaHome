import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, LayoutDashboard, List, PlusCircle, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="ApnaHome Logo" className="w-10 h-10 object-contain rounded-lg" />
          <span className="font-serif font-bold text-xl text-brown">ApnaHome</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {!isAuthenticated && (
            <>
              <Link to="/login" className="btn-ghost text-sm">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">Sign Up</Link>
            </>
          )}
          {isAuthenticated && user?.role === 'tenant' && (
            <>
              <Link to="/listings" className="btn-ghost text-sm flex items-center gap-1"><List size={15}/>Browse</Link>
              <Link to="/tenant/dashboard" className="btn-ghost text-sm flex items-center gap-1"><LayoutDashboard size={15}/>Dashboard</Link>
              <button onClick={handleLogout} className="btn-ghost text-sm flex items-center gap-1 text-red-500"><LogOut size={15}/>Logout</button>
            </>
          )}
          {isAuthenticated && user?.role === 'owner' && (
            <>
              <Link to="/owner/dashboard" className="btn-ghost text-sm flex items-center gap-1"><LayoutDashboard size={15}/>Dashboard</Link>
              <Link to="/owner/listings/new" className="btn-primary text-sm py-2 px-5 flex items-center gap-1"><PlusCircle size={15}/>Add Listing</Link>
              <button onClick={handleLogout} className="btn-ghost text-sm flex items-center gap-1 text-red-500"><LogOut size={15}/>Logout</button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-brown" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-4">
          {!isAuthenticated && (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-brown font-medium">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm text-center">Sign Up</Link>
            </>
          )}
          {isAuthenticated && user?.role === 'tenant' && (
            <>
              <Link to="/listings" onClick={() => setOpen(false)} className="text-brown font-medium">Browse Rooms</Link>
              <Link to="/tenant/dashboard" onClick={() => setOpen(false)} className="text-brown font-medium">Dashboard</Link>
              <button onClick={() => { handleLogout(); setOpen(false) }} className="text-red-500 font-medium text-left">Logout</button>
            </>
          )}
          {isAuthenticated && user?.role === 'owner' && (
            <>
              <Link to="/owner/dashboard" onClick={() => setOpen(false)} className="text-brown font-medium">Dashboard</Link>
              <Link to="/owner/listings/new" onClick={() => setOpen(false)} className="text-brown font-medium">Add Listing</Link>
              <button onClick={() => { handleLogout(); setOpen(false) }} className="text-red-500 font-medium text-left">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
