import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Entidad } from '../interfaces/entidad'

@Injectable({
  providedIn: 'root'
})
export class EntidadService {
  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/entity'

  list(offset: number, limit: number): Observable<Entidad[]> {
    return this.http.get<Entidad[]>(`${this.url}?offset=${offset}&limit=${limit}`)
  }
  get(id: number) {
    return this.http.get('http://localhost:8000/api')
  }
}
