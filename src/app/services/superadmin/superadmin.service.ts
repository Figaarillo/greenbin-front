import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SuperadminService {
  private http = inject(HttpClient)
  private url = 'http://localhost:8080/api/superadmin'

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.url}/auth/login`, { username, password })
  }

  async roleValidator(): Promise<any> {
    const token = localStorage.getItem('accessToken')
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` })
    return this.http.get(`${this.url}/auth/validate-role`, { headers }).toPromise()
  }
}
