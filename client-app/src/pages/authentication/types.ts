export interface User {
  id: number
  email: string
  roles: string[]
}

export interface LoginResponse {
  message: string
  user: User
  token: string
}

export interface RegisterParams {
  email: string
  password: string
  password_confirmation: string
}

export interface RegisterResponse {
  email: string
  roles: string[]
}
