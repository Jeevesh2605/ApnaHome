import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function TenantProfile() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ preferred_location:'', budget_min:'', budget_max:'', move_in_date:'' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    api.get('/tenant/profile').then(({ data }) => {
      setForm({
        preferred_location: data.preferred_location || '',
        budget_min: data.budget_min || '',
        budget_max: data.budget_max || '',
        move_in_date: data.move_in_date || '',
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/tenant/profile', { ...form, budget_min: Number(form.budget_min), budget_max: Number(form.budget_max) })
      toast.success('Profile saved!')
      navigate('/tenant/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile')
    } finally { setSaving(false) }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <h1 className="font-serif text-3xl font-bold text-brown mb-2">Your Profile</h1>
        <p className="text-brown-muted mb-8">Tell us what you're looking for — we'll find your best matches.</p>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="label">Preferred Location</label><input className="input" placeholder="Bandra, Mumbai" value={form.preferred_location} onChange={e=>set('preferred_location',e.target.value)}/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Min Budget (₹)</label><input className="input" type="number" placeholder="5000" value={form.budget_min} onChange={e=>set('budget_min',e.target.value)}/></div>
              <div><label className="label">Max Budget (₹)</label><input className="input" type="number" placeholder="20000" value={form.budget_max} onChange={e=>set('budget_max',e.target.value)}/></div>
            </div>
            <div><label className="label">Preferred Move-in Date</label><input className="input" type="date" value={form.move_in_date} onChange={e=>set('move_in_date',e.target.value)}/></div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3">
              {saving ? <Loader2 size={18} className="animate-spin"/> : 'Save Profile'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
