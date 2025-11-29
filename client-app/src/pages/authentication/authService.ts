import { login as apiLogin, register as apiRegister, setStoredToken } from '../../lib/api'
import type { LoginResponse, RegisterParams, RegisterResponse } from './types'

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiLogin<LoginResponse>(email, password)
  },

  async register(params: RegisterParams): Promise<RegisterResponse> {
    return apiRegister<RegisterParams, RegisterResponse>(params)
  },

  setToken(token: string): void {
    setStoredToken(token)
  },
}

export type { LoginResponse, RegisterParams, RegisterResponse }
