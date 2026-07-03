import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loader from '../components/Loader'
import { UserCircle, MapPin, IndianRupee, Calendar, MessageCircle, Pencil } from 'lucide-react'

const STATUS_BADGE = {
  pending:  <span className="badge-yellow">Pending</span>,
  accepted: <span className="badge-green">Accepted</span>,
  declined: <span className="badge-red">Declined</span>,
}

export default function TenantDashboard() {
  const navigate  = useNavigate()
  const [profile, setProfile]   = useState(null)
  const [interests, setInterests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tenant/profile').catch(() => ({ data: null })),
      api.get('/interests/sent'),
    ]).then(([{ data: p }, { data: i }]) => {
      setProfile(p)
      setInterests(i)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-10">

        {/* Profile */}
        <section className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-2xl font-bold text-brown">My Profile</h2>
            <Link to="/tenant/profile" className="btn-outline text-sm py-2 px-4"><Pencil size={14}/> Edit</Link>
          </div>
          {!profile
            ? <div className="text-center py-8 text-brown-muted">
                <UserCircle size={40} className="mx-auto mb-3 opacity-40"/>
                <p className="mb-4">Complete your profile to get AI match scores.</p>
                <Link to="/tenant/profile" className="btn-primary">Set Up Profile</Link>
              </div>
            : <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  [<MapPin size={16}/>, 'Location', profile.preferred_location || '—'],
                  [<IndianRupee size={16}/>, 'Budget', `₹${profile.budget_min?.toLocaleString()} – ₹${profile.budget_max?.toLocaleString()}`],
                  [<Calendar size={16}/>, 'Move-in', profile.move_in_date ? new Date(profile.move_in_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'],
                ].map(([icon, label, val]) => (
                  <div key={label}>
                    <p className="text-brown-muted text-xs flex items-center gap-1 mb-1">{icon}{label}</p>
                    <p className="font-semibold text-brown text-sm">{val}</p>
                  </div>
                ))}
              </div>
          }
        </section>

        {/* Interests */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-brown mb-5">My Interests</h2>
          {interests.length === 0
            ? <div className="card text-center py-10 text-brown-muted">No interests sent yet. <Link to="/listings" className="text-brown underline font-semibold">Browse rooms</Link></div>
            : <div className="space-y-4">
                {interests.map(i => (
                  <div key={i.id} className="folder-card flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-5 border-l-4 border-l-amber">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-serif text-lg font-bold text-brown">{i.listings?.location}</p>
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
                      <p className="text-brown-muted text-sm">₹{i.listings?.rent?.toLocaleString()}/mo · {i.listings?.room_type || 'Room'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {STATUS_BADGE[i.status]}
                      {i.status === 'accepted' && (
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
                      )}
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
