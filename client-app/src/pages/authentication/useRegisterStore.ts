import { useState, useCallback } from 'react'
import { authService, type RegisterResponse, type RegisterParams } from './authService'

interface UseRegisterStoreReturn {
  email: string
  password: string
  passwordConfirmation: string
  isLoading: boolean
  error: string | null

  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setPasswordConfirmation: (password: string) => void
  setError: (error: string | null) => void
  handleRegister: () => Promise<RegisterResponse | null>
}

export function useRegisterStore(): UseRegisterStoreReturn {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = useCallback(async (): Promise<RegisterResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const params: RegisterParams = {
        email,
        password,
        password_confirmation: passwordConfirmation,
      }
      const response = await authService.register(params)
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [email, password, passwordConfirmation])

  return {
    email,
    password,
    passwordConfirmation,
    isLoading,
    error,

    setEmail,
    setPassword,
    setPasswordConfirmation,
    setError,
    handleRegister,
  }
}
