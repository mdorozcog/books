import { login as apiLogin, register as apiRegister, setStoredToken } from '../../lib/api'
import type { LoginResponse, RegisterParams, RegisterResponse } from './types'

/**
 * Service layer for authentication-related API operations
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiLogin<LoginResponse>(email, password)
  },

  /**
   * Register a new user
   */
  async register(params: RegisterParams): Promise<RegisterResponse> {
    return apiRegister<RegisterParams, RegisterResponse>(params)
  },

  /**
   * Store authentication token
   */
  setToken(token: string): void {
    setStoredToken(token)
  },
}

export type { LoginResponse, RegisterParams, RegisterResponse }
