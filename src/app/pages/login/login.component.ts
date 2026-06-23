import { Component, inject } from '@angular/core'

import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { Router, RouterModule } from '@angular/router'
import Swal from 'sweetalert2'
import { MatTabsModule } from '@angular/material/tabs'
import { VecinoService } from '../../services/vecino/vecino.service'
import { Login } from '../../services/interfaces/login'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { ResponsableService } from '../../services/responsable/responsable.service'
import { CommonModule } from '@angular/common'
import { SesionService } from '../../services/sesion/sesion.service'
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha'
import { catchError, of, tap } from 'rxjs'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    RecaptchaModule,
    RecaptchaFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  router = inject(Router)
  hide = true
  loginAs = 0
  userRole: string[] = ['Vecino', 'Local adherido', 'Responsable']
  recaptchaToken = ''
  recaptchaSiteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

  form: FormGroup

  constructor(
    private fb: FormBuilder,
    private neighborService: VecinoService,
    private businessService: LocalAdheridoService,
    private responsibleService: ResponsableService,
    private sesionService: SesionService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
  }

  onCaptchaResolved(token: string | null): void {
    this.recaptchaToken = token ?? ''
  }

  onSubmit() {
    if (this.form.valid && this.recaptchaToken) {
      const loginData = this.setLoginObject()

      // Intentar login como Vecino
      this.neighborService
        .login(loginData)
        .pipe(
          catchError(() => {
            // Si falla Vecino, intentar como Local
            return this.businessService.login(loginData).pipe(
              catchError(() => {
                // Si falla Local, intentar como Responsable
                return this.responsibleService.login(loginData).pipe(
                  catchError(() => {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error de acceso',
                      text: 'Credenciales inválidas para cualquier rol'
                    })
                    return of(null)
                  })
                )
              })
            )
          })
        )
        .subscribe(response => {
          if (response) {
            this.handleLoginSuccess(response)
          }
        })
    } else if (!this.recaptchaToken) {
      Swal.fire({
        icon: 'warning',
        title: 'reCAPTCHA',
        text: 'Por favor, completá el reCAPTCHA'
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Campos inválidos'
      })
    }
  }

  setLoginObject(): Login {
    const emailControl = new FormControl(this.form.get('username')?.value, [Validators.email])
    if (emailControl.valid) {
      return {
        username: undefined,
        email: this.form.get('username')?.value,
        password: this.form.get('password')?.value,
        recaptchaToken: this.recaptchaToken
      }
    }
    return {
      email: undefined,
      username: this.form.get('username')?.value,
      password: this.form.get('password')?.value,
      recaptchaToken: this.recaptchaToken
    }
  }

  private handleLoginSuccess(obj: any) {
    // El backend suele devolver el rol en el token o en el objeto de respuesta
    // Aquí detectamos qué tipo de usuario es según la estructura de la respuesta o probando roles
    this.sesionService.setAccessToken(obj.data.accessToken)
    this.sesionService.setRefreshToken(obj.data.refreshToken)
    this.sesionService.setUserId(obj.data.id)

    // Determinamos el rol (esto depende de cómo tu backend identifique al usuario)
    // Por ahora, usamos una lógica basada en el objeto devuelto o la URL de éxito
    const role = this.determineRole(obj.data)
    this.sesionService.setRole(role)

    // Obtener información adicional según el rol
    this.fetchUserInfo(role, obj.data.id)

    this.sesionService.refreshUserData().subscribe(() => {
      // Redirigir según el rol detectado
      const routes: any = {
        neighbor: '/vecino',
        'reward-partner': '/local',
        responsible: '/responsable'
      }
      this.router.navigateByUrl(routes[role] || '/')
    })
  }

  private determineRole(data: any): string {
    // Lógica para identificar el rol. Puedes ajustarla según lo que devuelva tu API.
    if (data.role) return data.role // Si el API ya lo devuelve
    // Fallback: Si no viene el rol, el sistema de intentos arriba ya sabe cuál funcionó.
    // Nota: En una implementación real, el JWT suele tener el rol.
    return data.accessToken ? 'neighbor' : 'neighbor' // Ajustar según necesidad
  }

  private fetchUserInfo(role: string, id: string) {
    const serviceMap: any = {
      neighbor: this.neighborService,
      'reward-partner': this.businessService,
      responsible: this.responsibleService
    }

    serviceMap[role]?.get(id).subscribe((resp: any) => {
      localStorage.setItem('usuarioInfo', JSON.stringify(resp.data))
    })
  }
}
