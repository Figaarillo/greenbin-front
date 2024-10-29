import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Entidad } from '../interfaces/entidad'
import { Observable } from 'rxjs'

import { map } from 'rxjs'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'

@Injectable({
  providedIn: 'root'
})
export class EntidadService {
  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/entity'

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
    const headers = new HttpHeaders({
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjk3ODUxZi02MDI0LTQ0ZDgtYmQ0OS1jMmRmN2NmMzJhMDEiLCJuYW1lIjoiTXVuaWNpcGFsaWRhZCB2bSIsImVtYWlsIjoidm1AZ21haWwuY29tIiwicm9sZSI6ImVudGl0eSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3MzAxNjk5MjUsImV4cCI6MTczMDE3MDUyNX0.WFxoBiGh2h6XXjDaD7oT2LWtwdoxWmnZYTVgCOYhONc'
    })

    return this.http.get<Entidad>(`${this.url}/${id}`, { headers })
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

  private transforDataToEntity() {}
}
