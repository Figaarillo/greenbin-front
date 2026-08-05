import { API_BASE_URL } from '../../config/api.config'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { StorageService } from '../storage/storage.service'
import { LocalAdherido } from '../interfaces/local-adherido'
import { Observable, map } from 'rxjs'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'

@Injectable({
  providedIn: 'root'
})
export class LocalAdheridoService {
  private apiBase = inject(API_BASE_URL)
  constructor() {}

  private http = inject(HttpClient)
  private storage = inject(StorageService)
  private url: string = `${this.apiBase}/api/reward-partner`
  private urlCoupon: string = `${this.apiBase}/api/coupon`

  create(object: LocalAdherido): Observable<LocalAdherido> {
    return this.http.post<LocalAdherido>(this.url, object)
  }
  requestRegisterOtp(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/api/auth/register/request-otp`, { email, userType: 'reward-partner' })
  }

  login(object: Login): Observable<any> {
    return this.http.post<LoginResponse>(this.url + '/auth/login', object)
  }

  get(id: string): Observable<any> {
    return this.http.get<any>(this.url + '/' + id)
  }

  /** true si el CUIT existe en el padrón de ARCA (vía backend, evita el CORS de AfipSDK y no expone su token). */
  cuitExists(cuit: string): Observable<boolean> {
    return this.http.get<any>(`${this.url}/validate-cuit/${cuit}`).pipe(map((resp: any) => resp?.data?.exists === true))
  }
  async roleValidator() {
    const token = this.storage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })

    return this.http.get(this.url + '/auth/validate-role', { headers }).toPromise()
  }

  createCupon(coupon: any): Observable<any> {
    return this.http.post<any>(this.urlCoupon, coupon)
  }

  listCupon(entityId?: string): Observable<any> {
    const url = this.urlCoupon + '/available' + (entityId ? `?entityId=${entityId}` : '')
    return this.http.get<any>(url)
  }

  update(object: any, id: string): Observable<any> {
    const token = this.storage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
    return this.http.put<any>(this.url + '/' + id, object, { headers })
  }

  delete(id: string): Observable<any> {
    const token = this.storage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
    return this.http.delete<any>(this.url + '/' + id, { headers })
  }

  getCouponTransactions(rewardPartnerId: string): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/api/coupon-transaction/reward-partner/` + rewardPartnerId)
  }

  getRewardPartnerStats(rewardPartnerId: string, from?: string, to?: string): Observable<any> {
    let params = new HttpParams()
    if (from) params = params.set('from', from)
    if (to) params = params.set('to', to)
    return this.http.get<any>(`${this.apiBase}/api/coupon-transaction/reward-partner/${rewardPartnerId}/stats`, {
      params
    })
  }

  useCoupon(payload: { code: string; rewardPartnerId: string }): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/api/coupon-transaction/use`, payload)
  }

  getCupon(id: string): Observable<any> {
    return this.http.get<any>(this.urlCoupon + '/' + id)
  }

  updateCupon(payload: any, id: string): Observable<any> {
    return this.http.put<any>(this.urlCoupon + '/' + id, payload)
  }

  disableCupon(id: string): Observable<any> {
    return this.http.put<any>(this.urlCoupon + '/' + id, { isAvailable: false, state: 'DISABLED' })
  }

  list(entityId?: string, includeInactive = false): Observable<LocalAdherido[]> {
    const query = new URLSearchParams()
    if (entityId) query.set('entityId', entityId)
    if (includeInactive) query.set('includeInactive', 'true')
    const params = query.toString() ? `?${query.toString()}` : ''
    return this.http.get<any>(`${this.url}${params}`).pipe(map((resp: any) => resp.data ?? []))
  }
}
