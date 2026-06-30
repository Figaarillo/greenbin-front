import { API_BASE_URL } from '../../config/api.config'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { StorageService } from '../storage/storage.service'
import { Entidad } from '../interfaces/entidad'
import { Observable } from 'rxjs'
import { map } from 'rxjs'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'

@Injectable({
  providedIn: 'root'
})
export class EntidadService {
  private apiBase = inject(API_BASE_URL)
  private http = inject(HttpClient)
  private storage = inject(StorageService)
  private url: string = `${this.apiBase}/api/entity`
  create(object: Entidad): Observable<Entidad> {
    return this.http.post<Entidad>(this.url, object)
  }
  update(object: Entidad, id: string): Observable<Entidad> {
    return this.http.put<Entidad>(this.url + '/' + id, object)
  }
  get(id: string): Observable<Entidad> {
    return this.http.get<Entidad>(`${this.url}/${id}`)
  }

  list(offset: number, limit: number): Observable<Entidad[]> {
    return this.http.get<Entidad[]>(`${this.url}?offset=${offset}&limit=${limit}`).pipe(map((resp: any) => resp.data))
  }

  delete(id: string) {
    return this.http.delete(`${this.url}/${id}`)
  }

  login(object: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url + '/auth/login', object)
  }
  async roleValidator() {
    const token = this.storage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })

    return this.http.get(this.url + '/auth/validate-role', { headers }).toPromise()
  }
  private transforDataToEntity() {}
}
