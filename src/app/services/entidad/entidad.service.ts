import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Entidad } from '../interfaces/entidad'
import { Observable } from 'rxjs'

import { map } from 'rxjs'
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
    return this.http.put<Entidad>(this.url + '/' + id, object)
  }
  get(id: string): Observable<Entidad> {
    return this.http.get<Entidad>(this.url + '/' + id)
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

  private transforDataToEntity() {}
}
