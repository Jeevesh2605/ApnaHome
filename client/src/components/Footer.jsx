export default function Footer() {
  return (
    <footer className="bg-brown text-cream/70 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="ApnaHome Logo" className="w-8 h-8 object-contain rounded-lg bg-white/10" />
          <span className="font-serif font-semibold text-cream text-base">ApnaHome</span>
        </div>
        <p className="text-cream/50 text-xs">© {new Date().getFullYear()} ApnaHome. Built with ❤️ in India by Jeevesh Chaurasiya.</p>
      </div>
    </footer>
  )
}
