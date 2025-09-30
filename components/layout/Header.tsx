'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/session', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user)
        })
        .catch(() => {})
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/')
  }

  return (
    <header className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-10">
            <button
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-150"
            >
              AlbaniaRides
            </button>
            {user && (
              <nav className="hidden md:flex gap-1">
                <button
                  onClick={() => router.push('/rides')}
                  className={`relative px-4 py-2 text-sm font-semibold transition-all duration-150 rounded-lg ${
                    pathname === '/rides'
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  🔍 Find Rides
                  {pathname === '/rides' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary-600 rounded-full"></span>
                  )}
                </button>
                <button
                  onClick={() => router.push('/trips')}
                  className={`relative px-4 py-2 text-sm font-semibold transition-all duration-150 rounded-lg ${
                    pathname === '/trips'
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  ✈️ My Trips
                  {pathname === '/trips' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary-600 rounded-full"></span>
                  )}
                </button>
                {user.is_driver && (
                  <button
                    onClick={() => router.push('/rides/new')}
                    className={`relative px-4 py-2 text-sm font-semibold transition-all duration-150 rounded-lg ${
                      pathname === '/rides/new'
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    🚗 Post Ride
                    {pathname === '/rides/new' && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary-600 rounded-full"></span>
                    )}
                  </button>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-all duration-150 group"
                >
                  <div className="relative">
                    {user.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-primary-300 transition-all duration-150"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center ring-2 ring-gray-200 group-hover:ring-primary-300 transition-all duration-150">
                        <span className="text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="hidden md:inline text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-150">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-150"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="text-sm font-semibold text-gray-700 hover:text-primary-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-150"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="btn-primary px-5 py-2 text-sm font-semibold"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}