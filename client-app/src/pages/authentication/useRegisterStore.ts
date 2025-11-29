import { useState, useCallback } from 'react'
import { authService, type RegisterResponse, type RegisterParams } from './authService'

interface UseRegisterStoreReturn {
  email: string
  password: string
  passwordConfirmation: string
  role: string
  isLoading: boolean
  error: string | null

  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setPasswordConfirmation: (password: string) => void
  setRole: (role: string) => void
  setError: (error: string | null) => void
  handleRegister: () => Promise<RegisterResponse | null>
}

export function useRegisterStore(): UseRegisterStoreReturn {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState('member')
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
        roles: role ? [role] : undefined,
      }
      const response = await authService.register(params)
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [email, password, passwordConfirmation, role])

  return {
    email,
    password,
    passwordConfirmation,
    role,
    isLoading,
    error,

    setEmail,
    setPassword,
    setPasswordConfirmation,
    setRole,
    setError,
    handleRegister,
  }
}
