import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScoreBadge from '../components/ScoreBadge'
import InterestButton from '../components/InterestButton'
import Loader from '../components/Loader'
import { MapPin, IndianRupee, BedDouble, Sofa, Calendar, User } from 'lucide-react'

export default function ListingDetail() {
  const { id } = useParams()
  const [listing, setListing]   = useState(null)
  const [score, setScore]       = useState(null)
  const [interest, setInterest] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: l }, { data: sent }] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get('/interests/sent'),
        ])
        setListing(l)
        setInterest(sent.find(i => i.listing_id === id) || null)
        try {
          const { data: s } = await api.get(`/matches/${id}`)
          setScore(s)
        } catch {}
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <Loader />
  if (!listing) return <div className="p-10 text-center text-brown-muted">Listing not found.</div>

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Image */}
        <div className="w-full h-64 rounded-2xl overflow-hidden bg-border mb-8">
          {listing.image_url
            ? <img src={listing.image_url} alt={listing.location} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "/images/listing_placeholder.png" }}/>
            : <img src="/images/listing_placeholder.png" alt="Placeholder" className="w-full h-full object-cover opacity-80"/>}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="font-serif text-3xl font-bold text-brown mb-2">{listing.title || listing.location}</h1>
              {score && <ScoreBadge score={score.score} isFallback={score.is_fallback} />}
              {score?.explanation && <p className="text-brown-muted text-sm mt-2 italic">{score.explanation}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                [<MapPin size={16}/>, listing.location],
                [<IndianRupee size={16}/>, `₹${listing.rent?.toLocaleString()}/month`],
                [<BedDouble size={16}/>, listing.room_type || 'N/A'],
                [<Sofa size={16}/>, listing.furnishing || 'N/A'],
                [<Calendar size={16}/>, listing.available_from ? new Date(listing.available_from).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : 'N/A'],
                [<User size={16}/>, listing.users?.name || 'Owner'],
              ].map(([icon, val], i) => (
                <div key={i} className="flex items-center gap-2 text-brown-muted text-sm">
                  <span className="text-brown">{icon}</span>{val}
                </div>
              ))}
            </div>

            {listing.description && (
              <div>
                <h2 className="font-serif text-lg font-semibold text-brown mb-2">Description</h2>
                <p className="text-brown-muted text-sm leading-relaxed">{listing.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="card h-fit sticky top-24">
            <h3 className="font-serif text-xl font-bold text-brown mb-1">Interested?</h3>
            <p className="text-brown-muted text-sm mb-5">Send an interest request to the owner.</p>
            <InterestButton listingId={id} existingInterest={interest} onSent={() => {
              api.get('/interests/sent').then(({ data }) => setInterest(data.find(i => i.listing_id === id) || null))
            }}/>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
