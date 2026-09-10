import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../services/api.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    setLoading(true)
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      // 401 is expected if not logged in
      if (error.status !== 401) {
        console.error('Failed to fetch user:', error)
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      refreshUser,
      signOut: () => setUser(null), // Placeholder for logout slice
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// We will keep useAuth in hooks/useAuth.js
