import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Responsable } from '../interfaces/responsaible'
import { map } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class ResponsablesService {
  constructor() {}

  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/responsible'

  list(offset: number, limit: number): Observable<Responsable[]> {
    return this.http.get<Responsable[]>(`${this.url}?offset=${offset}&limit=${limit}`).pipe(
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

  roleValidator(token: string) {
    return true
  }
}
