import { useState, useCallback } from 'react'
import { authService, type LoginResponse } from './authService'
import { saveUserToStorage } from '../../shared/stores/useUserStore'

interface UseLoginStoreReturn {
  email: string
  password: string
  rememberMe: boolean
  isLoading: boolean
  error: string | null
  successMessage: string | null

  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setRememberMe: (remember: boolean) => void
  setError: (error: string | null) => void
  setSuccessMessage: (message: string | null) => void
  handleLogin: () => Promise<LoginResponse | null>
}

export function useLoginStore(): UseLoginStoreReturn {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleLogin = useCallback(async (): Promise<LoginResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login(email, password)
      authService.setToken(response.token)
      saveUserToStorage(response.user)
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [email, password])

  return {
    email,
    password,
    rememberMe,
    isLoading,
    error,
    successMessage,

    setEmail,
    setPassword,
    setRememberMe,
    setError,
    setSuccessMessage,
    handleLogin,
  }
}
