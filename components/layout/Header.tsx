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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-red-600 hover:text-red-700"
            >
              AlbaniaRides
            </button>
            {user && (
              <nav className="hidden md:flex gap-6">
                <button
                  onClick={() => router.push('/rides')}
                  className={`text-sm font-medium ${
                    pathname === '/rides' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
                  }`}
                >
                  Find Rides
                </button>
                <button
                  onClick={() => router.push('/trips')}
                  className={`text-sm font-medium ${
                    pathname === '/trips' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
                  }`}
                >
                  My Trips
                </button>
                {user.is_driver && (
                  <button
                    onClick={() => router.push('/rides/new')}
                    className={`text-sm font-medium ${
                      pathname === '/rides/new' ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
                    }`}
                  >
                    Post Ride
                  </button>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={() => router.push('/profile')}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2"
                >
                  {user.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="text-sm font-medium text-gray-700 hover:text-red-600"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
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