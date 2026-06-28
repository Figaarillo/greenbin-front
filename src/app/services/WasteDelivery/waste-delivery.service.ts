import { API_BASE_URL } from '../../config/api.config'
import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { WasteDelivery } from '../interfaces/wasteDelivery'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class WasteDeliveryService {
  private apiBase = inject(API_BASE_URL)
  private http = inject(HttpClient)
  private url: string = `${this.apiBase}/api/waste/`
  constructor() {}

  create(object: WasteDelivery): Observable<WasteDelivery> {
    return this.http.post<WasteDelivery>(this.url + 'transaction/delivery', object)
  }

  listByResponsible(responsibleId: string): Observable<any> {
    return this.http.get(this.url + 'transaction/responsible/' + responsibleId)
  }
}
