import { API_BASE_URL } from '../../config/api.config'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { StorageService } from '../storage/storage.service'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SuperadminService {
  private apiBase = inject(API_BASE_URL)
  private http = inject(HttpClient)
  private storage = inject(StorageService)
  private url = `${this.apiBase}/api/superadmin`

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.url}/auth/login`, { username, password })
  }

  async roleValidator(): Promise<any> {
    const token = this.storage.getItem('accessToken')
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` })
    return this.http.get(`${this.url}/auth/validate-role`, { headers }).toPromise()
  }
}
