import { Role } from './role'

export interface LoginResponse {
  id: string
  accessToken: string
  refreshToken: string
}

export interface UnifiedLoginResponse extends LoginResponse {
  role: Role
}
