import { inject, Injectable } from '@angular/core'
import { LoginResponse } from '../interfaces/login-response'
import { BehaviorSubject, Observable, tap } from 'rxjs'
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders } from '@angular/common/http'
import { IS_REFRESH_TOKEN_REQUEST } from '../../interceptors/httpContextToken'
import { Router } from '@angular/router'
@Injectable({
  providedIn: 'root'
})
export class SesionService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  private apiUrl = 'http://localhost:8080/api'
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
    localStorage.setItem('isLogged', 'true')
  }
  logout() {
    localStorage.clear()
    this.router.navigateByUrl('login')
  }

  setRole(role: string) {
    localStorage.setItem('role', role)
  }
  getRole() {
    return localStorage.getItem('role')!
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

  refreshToken() {
    const role = this.getRole()
    if (role && role.length > 0) {
      this.sendRefreshToken(role)
    } else {
      this.logout()
    }
  }

  sendRefreshToken(type: string): Observable<any> {
    // Agregar el header de Authorization con el token existente
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getRefreshToken()}`
    })
    // contexto para peticiones que no deben pasar por los interceptors (se debe controlar esto en los interceptors)
    const context = new HttpContext().set(IS_REFRESH_TOKEN_REQUEST, true)
    return this.http.get<any>(`${this.apiUrl}/${type}/auth/refresh-token`, { headers, context }).pipe(
      tap(response => {
        // Almacenar la respuesta en caso de éxito
        if (response) {
          this.setAccessToken(response.data.accessToken)
        }
      })
    )
  }
}
