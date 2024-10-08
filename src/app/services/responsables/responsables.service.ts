import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Responsable } from '../interfaces/responsaible'
import { map } from 'rxjs'
import { HttpHeaders } from '@angular/common/http'
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

  async roleValidator() {
    const token = localStorage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })

    return this.http.get(this.url + '/auth/validate-role', { headers }).toPromise()
  }
}
