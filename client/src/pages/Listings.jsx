import { useEffect, useState } from 'react'
import api from '../lib/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ListingCard from '../components/ListingCard'
import Loader from '../components/Loader'
import { Search } from 'lucide-react'

export default function Listings() {
  const [listings, setListings] = useState([])
  const [scores, setScores]     = useState({})
  const [loading, setLoading]   = useState(true)
  const [filters, setFilters]   = useState({ location: '', min_rent: '', max_rent: '' })

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.location) params.location = filters.location
      if (filters.min_rent) params.min_rent = filters.min_rent
      if (filters.max_rent) params.max_rent = filters.max_rent
      const { data } = await api.get('/listings', { params })
      setListings(data)
      data.forEach(async (l) => {
        try {
          const { data: s } = await api.get(`/matches/${l.id}`)
          setScores(prev => ({ ...prev, [l.id]: s }))
        } catch {}
      })
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchListings() }, [])

  if (loading) return <Loader />

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        <h1 className="font-serif text-3xl font-bold text-brown mb-2">Browse Rooms</h1>
        <p className="text-brown-muted mb-8">Find your perfect space, matched by AI</p>

        {/* Filter bar */}
        <div className="card flex flex-wrap gap-4 items-end mb-10 p-4">
          <div className="flex-1 min-w-[160px]">
            <label className="label">Location</label>
            <input className="input" placeholder="Bandra, Mumbai…" value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })} />
          </div>
          <div className="w-32">
            <label className="label">Min Rent</label>
            <input className="input" type="number" placeholder="₹0" value={filters.min_rent}
              onChange={e => setFilters({ ...filters, min_rent: e.target.value })} />
          </div>
          <div className="w-32">
            <label className="label">Max Rent</label>
            <input className="input" type="number" placeholder="₹∞" value={filters.max_rent}
              onChange={e => setFilters({ ...filters, max_rent: e.target.value })} />
          </div>
          <button onClick={fetchListings} className="btn-primary">
            <Search size={16} /> Search
          </button>
        </div>

        {listings.length === 0
          ? <div className="text-center py-20 text-brown-muted">No listings found. Try adjusting your filters.</div>
          : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(l => (
                <ListingCard key={l.id} listing={l}
                  score={scores[l.id]?.score}
                  isFallback={scores[l.id]?.is_fallback} />
              ))}
            </div>
        }
      </main>
      <Footer />
    </div>
  )
}
