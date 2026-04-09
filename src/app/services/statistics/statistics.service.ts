import { HttpClient, HttpParams } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private http = inject(HttpClient)
  private url = 'http://localhost:8080/api/statistics'

  getTotalRecycled(entityId: string, from?: string, to?: string): Observable<any> {
    let params = new HttpParams()
    if (from) params = params.set('from', from)
    if (to) params = params.set('to', to)
    return this.http.get(`${this.url}/entity/${entityId}/total-recycled`, { params })
  }

  getGreenPointsRanking(entityId: string): Observable<any> {
    return this.http.get(`${this.url}/entity/${entityId}/green-points-ranking`)
  }

  getWasteByCategory(entityId: string, from?: string, to?: string): Observable<any> {
    let params = new HttpParams()
    if (from) params = params.set('from', from)
    if (to) params = params.set('to', to)
    return this.http.get(`${this.url}/entity/${entityId}/waste-by-category`, { params })
  }

  getWasteByPeriod(entityId: string, groupBy: string, from?: string, to?: string): Observable<any> {
    let params = new HttpParams().set('groupBy', groupBy)
    if (from) params = params.set('from', from)
    if (to) params = params.set('to', to)
    return this.http.get(`${this.url}/entity/${entityId}/waste-by-period`, { params })
  }

  getNeighborDeliveries(neighborId: string): Observable<any> {
    return this.http.get(`${this.url}/neighbor/${neighborId}/deliveries`)
  }
}
