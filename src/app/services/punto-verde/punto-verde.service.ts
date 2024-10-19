import { inject, Injectable } from '@angular/core'
import { PuntoVerde } from '../interfaces/punto-verde'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

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
}
