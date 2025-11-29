import type { User } from '../../shared/types'

export interface LoginResponse {
  message: string
  user: User
  token: string
}

export interface RegisterParams {
  email: string
  password: string
  password_confirmation: string
  roles?: string[]
}

export interface RegisterResponse {
  email: string
  roles: string[]
}
