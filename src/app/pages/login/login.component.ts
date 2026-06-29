import { StorageService } from '../../services/storage/storage.service'
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
import { catchError, map, of } from 'rxjs'

type Role = 'neighbor' | 'reward-partner' | 'responsible'

const ROLE_ROUTES: Record<Role, string> = {
  neighbor: '/vecino',
  'reward-partner': '/local',
  responsible: '/responsable'
}

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
  private storage = inject(StorageService)
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
    if (!this.recaptchaToken) {
      Swal.fire({ icon: 'warning', title: 'reCAPTCHA', text: 'Por favor, completá el reCAPTCHA' })
      return
    }
    if (this.form.invalid) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Campos inválidos' })
      return
    }

    const loginData = this.setLoginObject()

    // Cada intento queda tageado con su rol: el primero que responde OK gana.
    this.neighborService
      .login(loginData)
      .pipe(
        map((r: any) => ({ response: r, role: 'neighbor' as Role })),
        catchError(() =>
          this.businessService.login(loginData).pipe(
            map((r: any) => ({ response: r, role: 'reward-partner' as Role })),
            catchError(() =>
              this.responsibleService.login(loginData).pipe(
                map((r: any) => ({ response: r, role: 'responsible' as Role })),
                catchError(() => {
                  Swal.fire({ icon: 'error', title: 'Error de acceso', text: 'Credenciales inválidas' })
                  return of(null)
                })
              )
            )
          )
        )
      )
      .subscribe(result => {
        if (result) this.handleLoginSuccess(result.response, result.role)
      })
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

  private handleLoginSuccess(obj: any, role: Role) {
    this.sesionService.setAccessToken(obj.data.accessToken)
    this.sesionService.setRefreshToken(obj.data.refreshToken)
    this.sesionService.setUserId(obj.data.id)
    this.sesionService.setRole(role)

    const serviceMap: Record<Role, any> = {
      neighbor: this.neighborService,
      'reward-partner': this.businessService,
      responsible: this.responsibleService
    }

    // Fetcheamos el perfil completo antes de navegar para que el sidenav
    // tenga todos los datos disponibles desde el primer render.
    serviceMap[role].get(obj.data.id).subscribe({
      next: (resp: any) => {
        const data = resp.data
        this.storage.setItem('usuarioInfo', JSON.stringify(data))
        this.sesionService.setUsername(data.username ?? '')
        // name cubre el caso de local adherido que usa razón social en lugar de firstname
        this.sesionService.setFirstname(data.firstname ?? data.name ?? '')
        this.sesionService.setLastname(data.lastname ?? '')
        this.sesionService.setDni(data.dni ?? '')
        this.sesionService.setPoints(data.points ?? '')
        this.router.navigateByUrl(ROLE_ROUTES[role])
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo obtener la información del usuario' })
      }
    })
  }
}
