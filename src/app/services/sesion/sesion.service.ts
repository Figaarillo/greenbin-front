import { Injectable } from '@angular/core'
import { LoginResponse } from '../interfaces/login-response'
import { BehaviorSubject } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class SesionService {
  constructor() {}
  private logging: boolean = false
  private loggingSubject = new BehaviorSubject<boolean>(false)
  isLogging$ = this.loggingSubject.asObservable()
  setLoginData(login: LoginResponse) {
    this.setAccessToken(login.accessToken)
    this.setRefreshToken(login.refreshToken)
    this.setUserId(login.id)
    this.login()
    console.log('logueandoando')
    console.log(this.isLogging())
    console.log(localStorage.getItem('accessToken'))
    console.log(localStorage.getItem('refreshToken'))
    console.log(localStorage.getItem('userId'))
  }
  isLogging(): boolean {
    return this.loggingSubject.value
  }
  login() {
    console.log('se llama a esto')
    this.loggingSubject.next(true)
  }

  logout() {
    this.loggingSubject.next(false)
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
