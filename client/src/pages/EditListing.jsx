import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../lib/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

const ROOM_TYPES  = ['single','shared','studio']
const FURNISHINGS = ['furnished','semi-furnished','unfurnished']

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    api.get(`/listings/${id}`).then(({ data }) => {
      setForm({
        title: data.title || '', location: data.location || '', rent: data.rent || '',
        available_from: data.available_from || '', room_type: data.room_type || '',
        furnishing: data.furnishing || '', description: data.description || '',
        image_url: data.image_url || '',
      })
    }).finally(() => setLoading(false))
  }, [id])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.put(`/listings/${id}`, { ...form, rent: Number(form.rent) })
      toast.success('Listing updated!')
      navigate('/owner/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <h1 className="font-serif text-3xl font-bold text-brown mb-2">Edit Listing</h1>
        <p className="text-brown-muted mb-8">Update your room details.</p>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="label">Title</label><input className="input" value={form.title} onChange={e=>set('title',e.target.value)}/></div>
            <div><label className="label">Location *</label><input className="input" value={form.location} onChange={e=>set('location',e.target.value)} required/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Rent (₹/month) *</label><input className="input" type="number" value={form.rent} onChange={e=>set('rent',e.target.value)} required/></div>
              <div><label className="label">Available From</label><input className="input" type="date" value={form.available_from} onChange={e=>set('available_from',e.target.value)}/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Room Type</label>
                <select className="input" value={form.room_type} onChange={e=>set('room_type',e.target.value)}>
                  <option value="">Select…</option>
                  {ROOM_TYPES.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Furnishing</label>
                <select className="input" value={form.furnishing} onChange={e=>set('furnishing',e.target.value)}>
                  <option value="">Select…</option>
                  {FURNISHINGS.map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">Image URL</label><input className="input" type="url" value={form.image_url} onChange={e=>set('image_url',e.target.value)}/></div>
            <div><label className="label">Description</label><textarea className="input resize-none" rows={4} value={form.description} onChange={e=>set('description',e.target.value)}/></div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3">
              {saving ? <Loader2 size={18} className="animate-spin"/> : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
