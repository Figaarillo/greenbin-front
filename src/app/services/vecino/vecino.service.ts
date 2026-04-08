import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Vecino } from '../interfaces/vecino'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'
import { VecinoUpdate } from '../interfaces/vecino_update'

@Injectable({
  providedIn: 'root'
})
export class VecinoService {
  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/neighbor'
  private couponUrl = 'http://localhost:8080/api/redeem-coupon'

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
    const token = localStorage.getItem('accessToken')
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
    return this.http.get<any>(`http://localhost:8080/api/coupon-transaction/neighbor/${neighborId}`)
  }

  list(entityId?: string): Observable<any> {
    const token = localStorage.getItem('accessToken')
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` })
    const params = entityId ? `?entityId=${entityId}` : ''
    return this.http.get<any>(`${this.url}${params}`, { headers })
  }

  delete(id: string): Observable<any> {
    const token = localStorage.getItem('accessToken')
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` })
    return this.http.delete<any>(this.url + '/' + id, { headers })
  }

  getMyWasteTransactions(neighborId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/waste/transaction/neighbor/${neighborId}`)
  }
}
