import { API_BASE_URL } from '../../config/api.config'
import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Login } from '../interfaces/login'
import { UnifiedLoginResponse } from '../interfaces/login-response'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiBase = inject(API_BASE_URL)
  private http = inject(HttpClient)
  private url: string = `${this.apiBase}/api/auth`

  login(object: Login): Observable<{ data: UnifiedLoginResponse }> {
    return this.http.post<{ data: UnifiedLoginResponse }>(this.url + '/login', object)
  }
}
