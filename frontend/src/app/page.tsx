// frontend/src/app/page.tsx
import Link from 'next/link';
import Navbar from './(components)/layout/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="hero-gradient text-white py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-violet-200 font-semibold uppercase tracking-widest text-sm mb-4">
              100% Free Events
            </p>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
              Live Music for <br />
              <span className="text-yellow-300">Everyone</span>
            </h1>
            <p className="text-violet-100 text-lg sm:text-xl mb-10 max-w-xl mx-auto">
              Browse upcoming free concerts and reserve your seat — no credit
              card needed, ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/concerts"
                className="bg-white text-violet-700 font-bold px-8 py-3.5 rounded-xl
                           hover:bg-violet-50 transition-colors duration-200"
              >
                Browse Concerts
              </Link>
              <Link
                href="/auth/register"
                className="bg-violet-600 text-white font-bold px-8 py-3.5 rounded-xl
                           border border-violet-400 hover:bg-violet-500 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why ConcertFree?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🎟️',
                title: 'Free Tickets',
                desc: 'All events listed are 100% free. No hidden fees.',
              },
              {
                icon: '⚡',
                title: 'Instant Reservation',
                desc: 'Reserve your seat in one click. Cancellation is just as easy.',
              },
              {
                icon: '📱',
                title: 'Works Everywhere',
                desc: 'Optimized for mobile, tablet, and desktop.',
              },
            ].map((f) => (
              <div key={f.title} className="card text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="text-center py-6 text-sm text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} ConcertFree — Built with Next.js &amp;
        NestJS
      </footer>
    </>
  );
}
