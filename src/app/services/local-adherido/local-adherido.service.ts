import { HttpClient, HttpHeaders } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { LocalAdherido } from '../interfaces/local-adherido'
import { Observable } from 'rxjs'
import { Login } from '../interfaces/login'
import { LoginResponse } from '../interfaces/login-response'

@Injectable({
  providedIn: 'root'
})
export class LocalAdheridoService {
  constructor() {}

  private http = inject(HttpClient)
  private url: string = 'http://localhost:8080/api/reward-partner'
  private url_afip_auth = 'https://app.afipsdk.com/api/v1/afip/auth'
  private url_afip_cuit = 'https://app.afipsdk.com/api/v1/afip/requests'

  create(object: LocalAdherido): Observable<LocalAdherido> {
    return this.http.post<LocalAdherido>(this.url, object)
  }

  login(object: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url + '/auth/login', object)
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
  roleValidator(token: string) {
    return true
  }
}
