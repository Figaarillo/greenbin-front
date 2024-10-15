import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Vecino } from '../interfaces/vecino'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'

@Injectable({
  providedIn: 'root'
})
export class VecinoService {
  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/neighbor'

  create(object: Vecino): Observable<Vecino> {
    return this.http.post<Vecino>(this.url, object)
  }
  update(object: Vecino, id: string): Observable<Vecino> {
    return this.http.put<Vecino>(this.url + '/' + id, object)
  }
  get(id: string): Observable<Vecino> {
    return this.http.get<Vecino>(this.url + '/' + id)
  }

  login(object: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url + '/auth/login', object)
  }

  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken') || ''
    const headers = new HttpHeaders({
      Authorization: `Bearer ${refreshToken}`
    })
    return this.http.get<any>(this.url + '/auth/refresh-token', { headers })
  }

  async roleValidator() {
    const token = localStorage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })

    return this.http.get(this.url + '/auth/validate-role', { headers }).toPromise()
  }
}
