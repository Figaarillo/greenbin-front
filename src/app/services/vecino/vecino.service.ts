import { API_BASE_URL } from '../../config/api.config'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { StorageService } from '../storage/storage.service'
import { Observable } from 'rxjs'
import { Vecino } from '../interfaces/vecino'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'
import { VecinoUpdate } from '../interfaces/vecino_update'

@Injectable({
  providedIn: 'root'
})
export class VecinoService {
  private apiBase = inject(API_BASE_URL)
  private http = inject(HttpClient)
  private storage = inject(StorageService)
  private url: string = `${this.apiBase}/api/neighbor`
  private couponUrl = `${this.apiBase}/api/redeem-coupon`

  create(object: Vecino): Observable<Vecino> {
    return this.http.post<Vecino>(this.url, object)
  }
  update(object: VecinoUpdate, id: string): Observable<VecinoUpdate> {
    return this.http.put<VecinoUpdate>(this.url + '/' + id, object)
  }
  get(id: string): Observable<Vecino> {
    return this.http.get<Vecino>(this.url + '/' + id)
  }

  login(object: Login): Observable<any> {
    return this.http.post<LoginResponse>(this.url + '/auth/login', object)
  }
  validateDni(dni: number): Observable<any> {
    return this.http.get<any>(this.url + '/dni/' + dni)
  }

  async roleValidator() {
    const token = this.storage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })

    return this.http.get(this.url + '/auth/validate-role', { headers }).toPromise()
  }
  buyCoupon(couponId: string, neighborId: string) {
    const body = {
      couponId: couponId,
      neighborId: neighborId
    }
    return this.http.post<any>(this.couponUrl, body)
  }

  getMyTransactions(neighborId: string): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/api/coupon-transaction/neighbor/${neighborId}`)
  }

  list(entityId?: string, includeInactive = false): Observable<any> {
    const token = this.storage.getItem('accessToken')
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` })
    const query = new URLSearchParams()
    if (entityId) query.set('entityId', entityId)
    if (includeInactive) query.set('includeInactive', 'true')
    const params = query.toString() ? `?${query.toString()}` : ''
    return this.http.get<any>(`${this.url}${params}`, { headers })
  }

  delete(id: string): Observable<any> {
    const token = this.storage.getItem('accessToken')
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` })
    return this.http.delete<any>(this.url + '/' + id, { headers })
  }

  getMyWasteTransactions(neighborId: string): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/api/waste/transaction/neighbor/${neighborId}`)
  }
}
