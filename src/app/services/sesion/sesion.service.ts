import { Injectable } from '@angular/core'
import { LoginResponse } from '../interfaces/login-response'

@Injectable({
  providedIn: 'root'
})
export class SesionService {
  constructor() {}

  setLoginData(login: LoginResponse) {
    this.setAccessToken(login.accessToken)
    this.setRefreshToken(login.refreshToken)
    this.setUserId(login.id)
    console.log(localStorage.getItem('accessToken'))
    console.log(localStorage.getItem('refreshToken'))
    console.log(localStorage.getItem('userId'))
  }

  setAccessToken(token: string) {
    localStorage.setItem('accessToken', token)
  }
  setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token)
  }
  setUserId(id: string) {
    localStorage.setItem('userId', id)
  }
  getAccessToken(): string {
    return localStorage.getItem('accessToken')!
  }
  getRefreshToken(): string {
    return localStorage.getItem('refreshToken')!
  }
  getUserId(): string {
    return localStorage.getItem('userId')!
  }
}
