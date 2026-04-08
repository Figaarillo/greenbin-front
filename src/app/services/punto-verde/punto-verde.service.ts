import { inject, Injectable } from '@angular/core'
import { PuntoVerde } from '../interfaces/punto-verde'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class PuntoVerdeService {
  constructor() {}

  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/green-point'

  create(object: PuntoVerde): Observable<PuntoVerde> {
    return this.http.post<PuntoVerde>(this.url, object)
  }

  list(entityId?: string): Observable<PuntoVerde[]> {
    let params = `?offset=0&limit=100000`
    if (entityId) params += `&entityId=${entityId}`
    return this.http.get<PuntoVerde[]>(`${this.url}${params}`).pipe(
      map((resp: any) => {
        return resp.data
      })
    )
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`)
  }

  update(payload: any, id: string): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, payload)
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`)
  }
}
