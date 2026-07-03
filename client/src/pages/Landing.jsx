import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { ArrowUpRight, Home, Users } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 max-w-7xl mx-auto px-6 pt-16 pb-12 grid md:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-amber/20 text-brown text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            🏠 India's Smartest Flatmate Finder
          </div>
          <h1 className="font-serif font-bold text-5xl md:text-6xl text-brown leading-tight mb-5">
            Find Your{' '}
            <span className="relative inline-block">
              <span className="relative z-10">Apna</span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 9 Q100 2 198 9" stroke="#F5C518" strokeWidth="4" strokeLinecap="round" fill="none"/>
              </svg>
            </span>{' '}
            Home
          </h1>
          <p className="text-brown-muted text-lg mb-8 max-w-md">
            AI-powered matching connects tenants with the right room. Chat in real time. Move in with confidence.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-4">
              <ArrowUpRight size={18}/> Find a Room
            </Link>
            <Link to="/register" className="btn-outline text-base px-8 py-4">
              List Your Room
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['#F5C518','#22C55E','#1C1917','#E8E2D9'].map((c,i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white" style={{background:c}}/>
              ))}
            </div>
            <p className="text-brown-muted text-sm"><span className="font-bold text-brown">500+</span> people found their home this month</p>
          </div>
        </div>

        {/* Right — illustration */}
        <div className="hidden md:flex justify-center relative">
          <div className="relative w-full max-w-lg aspect-square">
            <img src="/images/hero_graffiti_1783007661231.png" alt="Young people looking for apartment" className="w-full h-full object-contain drop-shadow-2xl z-10 relative"/>
            
            {/* Floating badges */}
            <div className="absolute top-10 -right-4 bg-amber text-brown text-sm font-bold px-4 py-2 rounded-xl shadow-xl rotate-6 z-20 border-2 border-brown">AI Match ✨</div>
            <div className="absolute bottom-12 -left-8 bg-green text-white text-sm font-bold px-4 py-2 rounded-xl shadow-xl -rotate-3 z-20 border-2 border-brown">Live Chat 💬</div>
            
            {/* Abstract Background Blob */}
            <div className="absolute inset-0 bg-amber/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-brown py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber/20 text-amber text-xs font-semibold px-3 py-1.5 rounded-full mb-4">✦ REAL ESTATE PLATFORM</div>
            <h2 className="font-serif text-4xl text-cream font-bold">How ApnaHome Works</h2>
            <p className="text-cream/60 mt-3 max-w-xl mx-auto">Find your ideal space in four simple steps</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Feature 1 */}
            <div className="folder-card bg-cream p-8 flex flex-col md:flex-row gap-6 items-center border-b-8 border-r-8 border-brown transition-transform hover:-translate-y-1">
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-serif font-bold text-brown text-2xl mb-3">AI Powered Matching</h3>
                <p className="text-brown-muted text-base leading-relaxed">
                  Get an instant compatibility score based on your profile, lifestyle preferences, and budget. Let our AI do the heavy lifting to find your perfect flatmate.
                </p>
              </div>
              <div className="w-48 h-48 rounded-2xl overflow-hidden shrink-0 border-4 border-brown shadow-inner bg-white">
                <img src="/images/ai_graffiti_1783007680483.png" alt="AI matching houses" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="folder-card bg-amber/20 p-8 flex flex-col md:flex-row gap-6 items-center border-b-8 border-r-8 border-brown transition-transform hover:-translate-y-1">
              <div className="w-48 h-48 rounded-2xl overflow-hidden shrink-0 border-4 border-brown shadow-inner bg-white md:order-1">
                <img src="/images/chat_graffiti_1783007671260.png" alt="People chatting" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-center md:text-right md:order-2">
                <h3 className="font-serif font-bold text-brown text-2xl mb-3">Real-time Chat</h3>
                <p className="text-brown-muted text-base leading-relaxed">
                  Once there's mutual interest, instantly connect via our secure real-time chat. Drop emojis, discuss details, and finalise your move stress-free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-cream relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-green/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-brown font-bold">Loved by Roommates Everywhere</h2>
            <p className="text-brown-muted mt-3 max-w-xl mx-auto">Don't just take our word for it. Here's what our community has to say.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "ApnaHome matched me with a flatmate who loves indie music just as much as I do! It felt less like a transaction and more like making a friend.", author: "Priya S.", role: "Tenant in Bangalore" },
              { text: "The AI matching is incredibly accurate. I found a tenant in 2 days and the built-in chat made it super easy to coordinate the move-in.", author: "Rahul M.", role: "Owner in Mumbai" },
              { text: "Finally an app that doesn't just show empty rooms. The graffiti UI is cool, but the verified profiles and compatibility scores are the real deal.", author: "Ananya K.", role: "Tenant in Delhi" }
            ].map((t, i) => (
              <div key={i} className="folder-card bg-white p-8 relative border-t-4 border-t-amber transition-transform hover:-translate-y-2">
                <div className="text-4xl text-amber mb-4 opacity-50">"</div>
                <p className="text-brown font-medium italic mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center font-bold text-brown">{t.author[0]}</div>
                  <div>
                    <h4 className="font-bold text-brown text-sm">{t.author}</h4>
                    <p className="text-brown-muted text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-amber py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[['500+','Listings'],['1K+','Happy Tenants'],['98%','Match Accuracy']].map(([n,l]) => (
            <div key={l}>
              <p className="font-serif font-bold text-4xl text-brown">{n}</p>
              <p className="text-brown-muted text-sm mt-1 font-medium">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
