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

  list(): Observable<PuntoVerde[]> {
    return this.http.get<PuntoVerde[]>(`${this.url}?offset=${0}&limit=${100000}`).pipe(
      map((resp: any) => {
        return resp.data
      })
    )
  }
}
