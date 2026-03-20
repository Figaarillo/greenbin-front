import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'
import { WasteCategory } from '../interfaces/wasteCategory'

import { map } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class WasteCategoryService {
  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/waste-category'

  constructor() {}
  list(offset: number, limit: number): Observable<WasteCategory[]> {
    return this.http.get<WasteCategory[]>(`${this.url}?offset=${offset}&limit=${limit}`).pipe(
      map((resp: any) => {
        console.log(resp.data)
        return resp.data
      })
    )
  }

  create(payload: any): Observable<any> {
    return this.http.post<any>(this.url, payload)
  }

  toggle(id: string, isActive: boolean): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, { isActive })
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}`)
  }

  update(payload: any, id: string): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}`, payload)
  }
}
