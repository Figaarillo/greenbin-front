import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class EntidadService {
  private http = inject(HttpClient)

  list() {
    return this.http.get('http://localhost:8080/api/entity?offset=0&limit=10')
  }
  get(id: number) {
    return this.http.get('http://localhost:8000/api')
  }
}
