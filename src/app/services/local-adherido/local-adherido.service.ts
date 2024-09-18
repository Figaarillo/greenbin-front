import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { LocalAdherido } from '../interfaces/local-adherido'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class LocalAdheridoService {
  constructor() {}

  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/reward-partner'

  create(object: LocalAdherido): Observable<LocalAdherido> {
    return this.http.post<LocalAdherido>(this.url, object)
  }
}
