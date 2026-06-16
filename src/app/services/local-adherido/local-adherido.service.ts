import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { LocalAdherido } from '../interfaces/local-adherido'
import { Observable } from 'rxjs'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'
import { Coupon } from '../interfaces/coupon'

@Injectable({
  providedIn: 'root'
})
export class LocalAdheridoService {
  constructor() {}

  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/reward-partner'
  private urlCoupon: string = 'http://localhost:8080/api/coupon'
  private url_afip_auth = 'https://app.afipsdk.com/api/v1/afip/auth'
  private url_afip_cuit = 'https://app.afipsdk.com/api/v1/afip/requests'

  create(object: LocalAdherido): Observable<LocalAdherido> {
    return this.http.post<LocalAdherido>(this.url, object)
  }

  login(object: Login): Observable<any> {
    return this.http.post<LoginResponse>(this.url + '/auth/login', object)
  }

  get(id: string): Observable<any> {
    return this.http.get<any>(this.url + '/' + id)
  }

  authenticateAfip(): Observable<any> {
    const body = {
      environment: 'dev',
      tax_id: '20409378472',
      wsid: 'ws_sr_padron_a13'
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })

    return this.http.post<any>(this.url_afip_auth, body, { headers })
  }
  authenthicateCuit(cuit: any, token: string, sign: string): Observable<any> {
    const body = {
      environment: 'dev',
      method: 'getPersona',
      wsid: 'ws_sr_padron_a13',
      params: {
        token: token,
        sign: sign,
        cuitRepresentada: '20409378472',
        idPersona: cuit
      }
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post<any>(this.url_afip_cuit, body, { headers })
  }
  async roleValidator() {
    const token = localStorage.getItem('accessToken')
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
    const token = localStorage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
    return this.http.put<any>(this.url + '/' + id, object, { headers })
  }

  delete(id: string): Observable<any> {
    const token = localStorage.getItem('accessToken')
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
    return this.http.delete<any>(this.url + '/' + id, { headers })
  }

  getCouponTransactions(rewardPartnerId: string): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/coupon-transaction/reward-partner/' + rewardPartnerId)
  }

  useCoupon(payload: { code: string; rewardPartnerId: string }): Observable<any> {
    return this.http.post<any>('http://localhost:8080/api/coupon-transaction/use', payload)
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

  list(entityId?: string, includeInactive = false): Observable<any> {
    const query = new URLSearchParams()
    if (entityId) query.set('entityId', entityId)
    if (includeInactive) query.set('includeInactive', 'true')
    const params = query.toString() ? `?${query.toString()}` : ''
    return this.http.get<any>(`${this.url}${params}`)
  }
}
