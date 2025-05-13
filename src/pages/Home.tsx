import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-200 relative">
      {/* Decorative Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-40 border-b border-yellow-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 drop-shadow-lg tracking-tight flex items-center gap-3">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" className="animate-pulse">
              <circle cx="12" cy="12" r="10" fill="url(#grad)" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#facc15" />
                  <stop offset="1" stopColor="#fb923c" />
                </linearGradient>
              </defs>
            </svg>
            99Notes
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 relative z-10 flex-1">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block md:col-span-4">
            <div className="fixed w-[calc(33.333%-2rem)] bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-yellow-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-orange-500 tracking-wide flex items-center gap-2">
                  <span className="inline-block">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="url(#grad2)" />
                      <defs>
                        <linearGradient id="grad2" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#facc15" />
                          <stop offset="1" stopColor="#fb923c" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                  Quick Actions
                </h2>
              </div>
              <nav className="space-y-3">
                {/* Mobile version - only shows on small screens */}
                <div className="block md:hidden col-span-12 space-y-3">
                  <Link to="/dashboard/add" 
                    className="group flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-orange-700 bg-white/90 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl border border-orange-100 hover:border-transparent transform hover:-translate-y-1">
                    <span role="img" aria-label="Create" className="text-xl group-hover:scale-110 transition-transform">📝</span>
                    <span>Create Note</span>
                  </Link>
                </div>

                {/* Desktop version - only shows on medium and larger screens */}
                <div className="hidden md:block space-y-3">
                  <Link to="/dashboard/add" 
                    className="group flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-orange-700 bg-white/90 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl border border-orange-100 hover:border-transparent transform hover:-translate-y-1">
                    <span role="img" aria-label="Create" className="text-xl group-hover:scale-110 transition-transform">📝</span>
                    <span>Create Note</span>
                  </Link>
                  <Link to="/dashboard/edit" 
                    className="group flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-orange-700 bg-white/90 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl border border-orange-100 hover:border-transparent transform hover:-translate-y-1">
                    <span role="img" aria-label="Edit" className="text-xl group-hover:scale-110 transition-transform">✏️</span>
                    <span>Edit Notes</span>
                  </Link>
                  <Link to="/dashboard/settings" 
                    className="group flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-orange-700 bg-white/90 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl border border-orange-100 hover:border-transparent transform hover:-translate-y-1">
                    <span role="img" aria-label="Settings" className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
                    <span>Settings</span>
                  </Link>
                </div>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;