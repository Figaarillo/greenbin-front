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
  list(offset: number, limit: number, includeInactive = false): Observable<WasteCategory[]> {
    let params = `?offset=${offset}&limit=${limit}`
    if (includeInactive) params += `&includeInactive=true`
    return this.http.get<WasteCategory[]>(`${this.url}${params}`).pipe(
      map((resp: any) => {
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
