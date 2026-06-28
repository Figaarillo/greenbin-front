import { API_BASE_URL } from '../../config/api.config'
import { inject, Injectable } from '@angular/core'
import { Responsable } from '../interfaces/responsable'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'
import { Vecino } from '../interfaces/vecino'

@Injectable({
  providedIn: 'root'
})
export class ResponsableService {
  private apiBase = inject(API_BASE_URL)
  private http = inject(HttpClient)
  private url: string = `${this.apiBase}/api/responsible`
  private urlVecino: string = `${this.apiBase}/api/neighbor/ba605e0b-adbb-47c1-868e-2a12fd85b860`

  create(object: Responsable): Observable<Responsable> {
    return this.http.post<Responsable>(this.url, object)
  }
  update(object: Responsable, id: string): Observable<Responsable> {
    return this.http.put<Responsable>(this.url + '/' + id, object)
  }
  get(id: string): Observable<Responsable> {
    return this.http.get<Responsable>(this.url + '/' + id)
  }

  login(object: Login): Observable<any> {
    return this.http.post<LoginResponse>(this.url + '/auth/login', object)
  }

  setPuntos(vecino: Vecino): Observable<Vecino> {
    return this.http.put<Vecino>(this.urlVecino, vecino)
  }
}
