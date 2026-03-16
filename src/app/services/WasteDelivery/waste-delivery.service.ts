import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { WasteDelivery } from '../interfaces/wasteDelivery'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class WasteDeliveryService {
  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/waste/'
  constructor() {}

  create(object: WasteDelivery): Observable<WasteDelivery> {
    return this.http.post<WasteDelivery>(this.url + 'transaction/delivery', object)
  }
}
