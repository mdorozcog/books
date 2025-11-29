import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { getStoredToken } from '../../lib/api'
import type { User } from '../types'

const USER_STORAGE_KEY = 'user'

interface UseUserStoreReturn {
  user: User | null
  isLibrarian: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  clearUser: () => void
}

export function useUserStore(): UseUserStoreReturn {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUserState] = useState<User | null>(
    (location.state as { user?: User })?.user || null
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      navigate('/login')
      setIsLoading(false)
      return
    }

    if (!user) {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User
          setUserState(parsedUser)
        } catch (e) {
          localStorage.removeItem(USER_STORAGE_KEY)
        }
      }
    }
    setIsLoading(false)
  }, [navigate, user])

  const setUser = useCallback((newUser: User | null) => {
    setUserState(newUser)
    if (newUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  }, [])

  const clearUser = useCallback(() => {
    setUserState(null)
    localStorage.removeItem(USER_STORAGE_KEY)
  }, [])

  const isLibrarian = user?.roles.includes('librarian') || false

  return {
    user,
    isLibrarian,
    isLoading,
    setUser,
    clearUser,
  }
}

export function saveUserToStorage(user: User): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}
