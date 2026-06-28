import { StorageService } from '../../services/storage/storage.service'
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
import { Component, inject } from '@angular/core'
import { EntidadService } from '../../services/entidad/entidad.service'
import { SesionService } from '../../services/sesion/sesion.service'
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha'

@Component({
  selector: 'app-login-entidad',
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
  templateUrl: './login-entidad.component.html',
  styleUrl: './login-entidad.component.scss'
})
export class LoginEntidadComponent {
  private storage = inject(StorageService)
  router = inject(Router)
  hide = true
  recaptchaToken = ''
  recaptchaSiteKey = '6Lfgqq8sAAAAALwsy8mZSWfWJeoIfoxHAwQ6Vbhy'

  form: FormGroup

  constructor(
    private fb: FormBuilder,
    private entidadServ: EntidadService,
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
      const login = this.setLoginObject()
      this.entidadServ.login(login).subscribe((obj: any) => {
        this.sesionService.setAccessToken(obj.data.accessToken)
        this.sesionService.setRefreshToken(obj.data.refreshToken)
        this.sesionService.setUserId(obj.data.id)
        this.storage.setItem('rol', 'admin')

        this.entidadServ.get(obj.data.id).subscribe((resp: any) => {
          this.storage.setItem('entidadInfo', JSON.stringify(resp.data))
          this.router.navigateByUrl('/entidad')
        })
      })
    } else if (!this.recaptchaToken) {
      Swal.fire({
        icon: 'warning',
        title: 'reCAPTCHA',
        text: 'Por favor, completá el reCAPTCHA'
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
}
