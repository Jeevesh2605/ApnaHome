import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { auth, googleProvider } from '../lib/firebase'
import { signInWithPopup } from 'firebase/auth'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: '' })
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)

  const redirect = (role) => role === 'owner' ? navigate('/owner/dashboard') : navigate('/listings')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.role) { toast.error('Please select your role'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.token, data.user)
      toast.success(`Welcome to ApnaHome, ${data.user.name}!`)
      redirect(data.user.role)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    if (!form.role) { toast.error('Please select your role first'); return }
    setGLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const { data } = await api.post('/auth/google', { idToken, role: form.role })
      login(data.token, data.user)
      toast.success(`Welcome, ${data.user.name}!`)
      redirect(data.user.role)
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user')
        toast.error(err.response?.data?.message || 'Google signup failed')
    } finally { setGLoading(false) }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-amber rounded-lg flex items-center justify-center font-serif font-bold text-brown">A</div>
            <span className="font-serif font-bold text-2xl text-brown">ApnaHome</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-brown">Create your account</h1>
          <p className="text-brown-muted mt-2">Join thousands finding their perfect home</p>
        </div>

        <div className="card">
          {/* Role selector */}
          <p className="label text-center mb-3">I want to…</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'tenant', emoji: '🔍', label: "Find a Room" },
              { value: 'owner',  emoji: '🏠', label: "List a Room" },
            ].map(r => (
              <button key={r.value} type="button"
                onClick={() => setForm({...form, role: r.value})}
                className={`border-2 rounded-2xl p-4 text-center transition-all
                  ${form.role === r.value ? 'border-amber bg-amber/10 shadow-sm' : 'border-border hover:border-amber/50'}`}>
                <div className="text-3xl mb-1">{r.emoji}</div>
                <p className="text-sm font-semibold text-brown">{r.label}</p>
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={gLoading} className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-3 font-medium text-brown hover:bg-cream transition mb-5">
            {gLoading ? <Loader2 size={18} className="animate-spin"/> : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google"/>}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border"/><span className="text-brown-muted text-xs">or</span><div className="flex-1 h-px bg-border"/>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="Rahul Sharma" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6}/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Loader2 size={18} className="animate-spin"/> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-brown-muted text-sm mt-5">
          Already have an account? <Link to="/login" className="text-brown font-semibold underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
