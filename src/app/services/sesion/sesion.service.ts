import { API_BASE_URL } from '../../config/api.config'
import { inject, Injectable } from '@angular/core'
import { LoginResponse } from '../interfaces/login-response'
import { BehaviorSubject, Observable, tap } from 'rxjs'
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders } from '@angular/common/http'
import { IS_REFRESH_TOKEN_REQUEST } from '../../interceptors/httpContextToken'
import { Router } from '@angular/router'
import { StorageService } from '../storage/storage.service'
@Injectable({
  providedIn: 'root'
})
export class SesionService {
  private apiBase = inject(API_BASE_URL)
  private storage = inject(StorageService)
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  private apiUrl = `${this.apiBase}/api`

  //borrar?
  private logging: boolean = false
  private loggingSubject = new BehaviorSubject<boolean>(false)
  isLogging$ = this.loggingSubject.asObservable()
  setLoginData(login: LoginResponse) {
    this.setAccessToken(login.accessToken)
    this.setRefreshToken(login.refreshToken)
    this.setUserId(login.id)
    this.login()
  }
  isLogging(): boolean {
    return this.loggingSubject.value
  }
  login() {
    this.storage.setItem('isLogged', 'true')
  }
  ///--------

  logout() {
    this.storage.clear()
    this.router.navigateByUrl('/login')
  }

  setPoints(data: string) {
    this.storage.setItem('points', data)
  }
  getPoints() {
    return this.storage.getItem('points')!
  }
  setFirstname(data: string) {
    this.storage.setItem('firstname', data)
  }
  getFirstname() {
    return this.storage.getItem('firstname')!
  }
  setLastname(data: string) {
    this.storage.setItem('lastname', data)
  }
  getLastname() {
    return this.storage.getItem('lastname')!
  }
  setDni(data: string) {
    this.storage.setItem('dni', data)
  }
  getDni() {
    return this.storage.getItem('dni')!
  }
  setUsername(data: string) {
    this.storage.setItem('username', data)
  }
  getUsername() {
    return this.storage.getItem('username')!
  }

  setRole(role: string) {
    this.storage.setItem('role', role)
  }
  getRole() {
    return this.storage.getItem('role')!
  }

  setAccessToken(token: string) {
    this.storage.setItem('accessToken', token)
  }
  setRefreshToken(token: string) {
    this.storage.setItem('refreshToken', token)
  }
  setUserId(id: string) {
    this.storage.setItem('userId', id)
  }
  getAccessToken(): string {
    return this.storage.getItem('accessToken')!
  }
  getRefreshToken(): string {
    return this.storage.getItem('refreshToken')!
  }
  getUserId(): string {
    return this.storage.getItem('userId')!
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

  refreshUserData() {
    return this.http.get<any>(`${this.apiUrl}/${this.getRole()}/${this.getUserId()}`).pipe(
      tap(response => {
        // Almacenar la respuesta en caso de éxito
        if (response) {
          this.setDni(response.data.dni ?? null)
          this.setFirstname(response.data.firstname ?? null)
          this.setLastname(response.data.lastname ?? null)
          this.setPoints(response.data.points != null ? response.data.points : null)
          this.setUsername(response.data.username ?? null)
        }
      })
    )
  }

  //MOKEO DE CUPONES CANJEADOS
  addCupon(id: string) {
    let array = this.getCupones()
    array.push(id)
    this.storage.setItem('cupones', JSON.stringify(array))
  }
  getCupones() {
    const retrievedData = this.storage.getItem('cupones')
    if (retrievedData) {
      return JSON.parse(retrievedData) as string[]
    }
    return []
  }
}
