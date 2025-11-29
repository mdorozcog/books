import {
  login as apiLogin,
  register as apiRegister,
  setStoredToken,
  type RegisterParams as ApiRegisterParams,
} from '../../lib/api'
import type { LoginResponse, RegisterParams, RegisterResponse } from './types'

/**
 * Service layer for authentication-related API operations
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiLogin(email, password)
  },

  /**
   * Register a new user
   */
  async register(params: RegisterParams): Promise<RegisterResponse> {
    const apiParams: ApiRegisterParams = {
      email: params.email,
      password: params.password,
      password_confirmation: params.password_confirmation,
      roles: params.roles,
    }
    const apiResponse = await apiRegister(apiParams)
    return {
      email: apiResponse.email,
      roles: apiResponse.roles,
    }
  },

  /**
   * Store authentication token
   */
  setToken(token: string): void {
    setStoredToken(token)
  },
}

export type { LoginResponse, RegisterParams, RegisterResponse }
