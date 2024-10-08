import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { Vecino } from '../interfaces/vecino'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'

@Injectable({
  providedIn: 'root'
})
export class VecinoService {
  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/neighbor'

  create(object: Vecino): Observable<Vecino> {
    return this.http.post<Vecino>(this.url + '/signup', object)
  }
  update(object: Vecino, id: string): Observable<Vecino> {
    return this.http.put<Vecino>(this.url + '/' + id, object)
  }
  get(id: string): Observable<Vecino> {
    return this.http.get<Vecino>(this.url + '/' + id)
  }

  login(object: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url + '/auth/login', object)
  }
  roleValidator(token: string) {
    return true
  }
}
