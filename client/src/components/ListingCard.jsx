import { Link } from 'react-router-dom'
import { MapPin, IndianRupee, BedDouble, Sofa, Calendar } from 'lucide-react'
import ScoreBadge from './ScoreBadge'

export default function ListingCard({ listing, score, isFallback }) {
  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <div className="folder-card p-5 hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
        {/* Image */}
        <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-border">
          {listing.image_url
            ? <img src={listing.image_url} alt={listing.title || listing.location} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "/images/listing_placeholder.png" }} />
            : <img src="/images/listing_placeholder.png" alt="No image available" className="w-full h-full object-cover opacity-80" />
          }
        </div>

        {/* Score */}
        {score !== undefined && (
          <div className="mb-3">
            <ScoreBadge score={score} isFallback={isFallback} />
          </div>
        )}

        {/* Title */}
        <h3 className="font-serif font-semibold text-brown text-lg leading-tight mb-2 line-clamp-1">
          {listing.title || listing.location}
        </h3>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-brown-muted mt-2">
          <span className="flex items-center gap-1"><MapPin size={13}/>{listing.location}</span>
          <span className="flex items-center gap-1"><IndianRupee size={13}/>{listing.rent?.toLocaleString()}/mo</span>
          {listing.room_type  && <span className="flex items-center gap-1"><BedDouble size={13}/>{listing.room_type}</span>}
          {listing.furnishing && <span className="flex items-center gap-1"><Sofa size={13}/>{listing.furnishing}</span>}
        </div>
        {listing.available_from && (
          <p className="text-xs text-brown-muted mt-2 flex items-center gap-1">
            <Calendar size={12}/>Available {new Date(listing.available_from).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
          </p>
        )}
        {listing.is_filled && (
          <span className="mt-3 inline-block bg-brown-muted/10 text-brown-muted text-xs font-semibold px-3 py-1 rounded-full">Filled</span>
        )}
      </div>
    </Link>
  )
}
