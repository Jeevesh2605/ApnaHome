import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import { PlusCircle, Pencil, Trash2, CheckCircle, MessageCircle, MapPin, IndianRupee } from 'lucide-react'

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const [listings, setListings]   = useState([])
  const [interests, setInterests] = useState([])
  const [loading, setLoading]     = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [{ data: l }, { data: i }] = await Promise.all([
        api.get('/listings/mine'),
        api.get('/interests/incoming'),
      ])
      setListings(l)
      setInterests(i)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return
    try { await api.delete(`/listings/${id}`); toast.success('Deleted'); load() }
    catch { toast.error('Delete failed') }
  }

  const markFilled = async (id) => {
    try { await api.patch(`/listings/${id}/fill`); toast.success('Marked as filled'); load() }
    catch { toast.error('Failed') }
  }

  const respond = async (id, status) => {
    try {
      await api.patch(`/interests/${id}`, { status })
      toast.success(`Interest ${status}`)
      load()
    } catch { toast.error('Failed') }
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 space-y-12">

        {/* My Listings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-3xl font-bold text-brown">My Listings</h1>
              <p className="text-brown-muted mt-1">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
            </div>
            <Link to="/owner/listings/new" className="btn-primary"><PlusCircle size={16}/> Add Listing</Link>
          </div>

          {listings.length === 0
            ? <div className="card text-center py-12 text-brown-muted">No listings yet. <Link to="/owner/listings/new" className="text-brown underline font-semibold">Create one</Link></div>
            : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map(l => (
                  <div key={l.id} className={`folder-card p-5 space-y-3 ${l.is_filled ? 'opacity-60' : ''}`}>
                    <div className="w-full h-32 rounded-xl overflow-hidden bg-border">
                      {l.image_url 
                        ? <img src={l.image_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.onerror = null; e.target.src = "/images/listing_placeholder.png" }} /> 
                        : <img src="/images/listing_placeholder.png" className="w-full h-full object-cover opacity-80" alt="Placeholder"/>
                      }
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-brown line-clamp-1">{l.title || l.location}</h3>
                      <p className="text-brown-muted text-sm flex items-center gap-1"><MapPin size={12}/>{l.location}</p>
                      <p className="text-brown font-semibold text-sm flex items-center gap-1"><IndianRupee size={12}/>₹{l.rent?.toLocaleString()}/mo</p>
                    </div>
                    {l.is_filled && <span className="badge-yellow">Filled</span>}
                    <div className="flex gap-2 flex-wrap pt-1">
                      <button onClick={() => navigate(`/owner/listings/${l.id}/edit`)} className="btn-outline text-xs py-1.5 px-3"><Pencil size={12}/> Edit</button>
                      {!l.is_filled && <button onClick={() => markFilled(l.id)} className="btn-outline text-xs py-1.5 px-3"><CheckCircle size={12}/> Fill</button>}
                      <button onClick={() => deleteListing(l.id)} className="text-red-400 border border-red-200 rounded-full text-xs py-1.5 px-3 hover:bg-red-50 transition"><Trash2 size={12}/> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </section>

        {/* Incoming interests */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-brown mb-6">Incoming Interests</h2>
          {interests.length === 0
            ? <div className="card text-center py-10 text-brown-muted">No interests yet.</div>
            : <div className="space-y-4">
                {interests.map(i => (
                  <div key={i.id} className="folder-card flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-5 border-l-4 border-l-amber">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-serif text-lg font-bold text-brown">{i.users?.name}</p>
                        {i.score && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            i.score > 80 ? 'bg-green/10 text-green-dark border border-green/20' : 
                            i.score > 50 ? 'bg-amber/10 text-amber-dark border border-amber/20' : 
                            'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}>
                            AI Score: {i.score}%
                          </span>
                        )}
                      </div>
                      <p className="text-brown-muted text-sm">{i.listings?.location} · ₹{i.listings?.rent?.toLocaleString()}/mo</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {i.status === 'pending' && (
                        <>
                          <button onClick={() => respond(i.id,'accepted')} className="btn-primary text-sm py-2 px-5">Accept</button>
                          <button onClick={() => respond(i.id,'declined')} className="btn-outline text-sm py-2 px-5">Decline</button>
                        </>
                      )}
                      {i.status === 'accepted' && (
                        <>
                          <span className="badge-green">Accepted</span>
                          <div className="relative">
                            <button onClick={() => navigate(`/chat/${i.id}`)} className="btn-primary text-sm py-2 px-5 bg-green text-white hover:bg-green-dark">
                              <MessageCircle size={14}/> Chat
                            </button>
                            {i.unread_count > 0 && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                {i.unread_count}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                      {i.status === 'declined' && <span className="badge-red">Declined</span>}
                    </div>
                  </div>
                ))}
              </div>
          }
        </section>
      </main>
      <Footer />
    </div>
  )
}
