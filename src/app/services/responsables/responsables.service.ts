import { API_BASE_URL } from '../../config/api.config'
import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { StorageService } from '../storage/storage.service'
import { Observable } from 'rxjs'
import { Responsable } from '../interfaces/responsaible'
import { map } from 'rxjs'
import { HttpHeaders } from '@angular/common/http'
@Injectable({
  providedIn: 'root'
})
export class ResponsablesService {
  private apiBase = inject(API_BASE_URL)
  constructor() {}

  private http = inject(HttpClient)
  private storage = inject(StorageService)
  private url: string = `${this.apiBase}/api/responsible`

  list(offset: number, limit: number, entityId?: string): Observable<Responsable[]> {
    let params = `?offset=${offset}&limit=${limit}`
    if (entityId) params += `&entityId=${entityId}`
    return this.http.get<Responsable[]>(`${this.url}${params}`).pipe(
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
    const token = this.storage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })

    return this.http.get(this.url + '/auth/validate-role', { headers }).toPromise()
  }
}
