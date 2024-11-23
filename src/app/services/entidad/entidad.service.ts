import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Entidad } from '../interfaces/entidad'
import { Observable } from 'rxjs'
import * as jwt from 'jsonwebtoken'
import { map } from 'rxjs'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'

@Injectable({
  providedIn: 'root'
})
export class EntidadService {
  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/entity'
  private apiUrl = 'http://localhost:8080/metabase-dashboard'
  create(object: Entidad): Observable<Entidad> {
    return this.http.post<Entidad>(this.url, object)
  }
  update(object: Entidad, id: string): Observable<Entidad> {
    console.log('###')
    console.log(object)
    console.log('###')
    return this.http.put<Entidad>(this.url + '/' + id, object)
  }
  get(id: string): Observable<Entidad> {
    return this.http.get<Entidad>(`${this.url}/${id}`)
  }

  list(offset: number, limit: number): Observable<Entidad[]> {
    return this.http.get<Entidad[]>(`${this.url}?offset=${offset}&limit=${limit}`).pipe(
      map((resp: any) => {
        console.log(resp.data)
        return resp.data
      })
    )
  }

  delete(id: string) {
    console.log(typeof id)
    return this.http.delete(`${this.url}/${id}`)
  }

  login(object: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url + '/auth/login', object)
  }
  async roleValidator() {
    const token = localStorage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })

    return this.http.get(this.url + '/auth/validate-role', { headers }).toPromise()
  }
  private transforDataToEntity() {}
  getMetabaseIframeUrl(id: string): Observable<{ iframeUrl: string }> {
    return this.http.get<{ iframeUrl: string }>(`${this.apiUrl}?id=${id}`)
  }
}
