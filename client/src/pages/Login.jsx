import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { auth, googleProvider } from '../lib/firebase'
import { signInWithPopup } from 'firebase/auth'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [roleModal, setRoleModal] = useState(null) // { idToken }

  const redirect = (role) => role === 'owner' ? navigate('/owner/dashboard') : navigate('/listings')

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name}!`)
      redirect(data.user.role)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setGLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      // Try login first (returning user)
      try {
        const { data } = await api.post('/auth/google', { idToken })
        login(data.token, data.user)
        toast.success(`Welcome back, ${data.user.name}!`)
        redirect(data.user.role)
      } catch (err) {
        // First time user — need role
        if (err.response?.status === 400 && err.response?.data?.message?.includes('role')) {
          setRoleModal({ idToken })
        } else { throw err }
      }
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user')
        toast.error(err.response?.data?.message || 'Google login failed')
    } finally { setGLoading(false) }
  }

  const handleRoleSelect = async (role) => {
    try {
      const { data } = await api.post('/auth/google', { idToken: roleModal.idToken, role })
      login(data.token, data.user)
      toast.success(`Welcome, ${data.user.name}!`)
      setRoleModal(null)
      redirect(data.user.role)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-amber rounded-lg flex items-center justify-center font-serif font-bold text-brown">A</div>
            <span className="font-serif font-bold text-2xl text-brown">ApnaHome</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-brown">Welcome back</h1>
          <p className="text-brown-muted mt-2">Sign in to continue</p>
        </div>

        <div className="card">
          {/* Google button */}
          <button onClick={handleGoogle} disabled={gLoading} className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 font-medium text-brown hover:bg-cream transition mb-5">
            {gLoading ? <Loader2 size={18} className="animate-spin"/> : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google"/>}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border"/><span className="text-brown-muted text-xs">or</span><div className="flex-1 h-px bg-border"/>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Loader2 size={18} className="animate-spin"/> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-brown-muted text-sm mt-5">
          No account? <Link to="/register" className="text-brown font-semibold underline">Register here</Link>
        </p>
      </div>

      {/* Role modal */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <h2 className="font-serif text-2xl font-bold text-brown mb-2 text-center">One last step</h2>
            <p className="text-brown-muted text-sm text-center mb-6">How will you use ApnaHome?</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleRoleSelect('tenant')} className="border-2 border-border rounded-2xl p-5 text-center hover:border-amber transition">
                <div className="text-4xl mb-2">🔍</div>
                <p className="font-semibold text-brown text-sm">I'm Looking for a Room</p>
              </button>
              <button onClick={() => handleRoleSelect('owner')} className="border-2 border-border rounded-2xl p-5 text-center hover:border-amber transition">
                <div className="text-4xl mb-2">🏠</div>
                <p className="font-semibold text-brown text-sm">I want to List a Room</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
