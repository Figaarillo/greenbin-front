import { inject, Injectable } from '@angular/core'
import { Responsable } from '../interfaces/responsable'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'

@Injectable({
  providedIn: 'root'
})
export class ResponsableService {
  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/responsible'

  create(object: Responsable): Observable<Responsable> {
    return this.http.post<Responsable>(this.url, object)
  }
  update(object: Responsable, id: string): Observable<Responsable> {
    return this.http.put<Responsable>(this.url + '/' + id, object)
  }
  get(id: string): Observable<Responsable> {
    return this.http.get<Responsable>(this.url + '/' + id)
  }

  login(object: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url + '/auth/login', object)
  }
}
