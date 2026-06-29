import { StorageService } from '../../services/storage/storage.service'
import { Component, inject } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import Swal from 'sweetalert2'
import { SuperadminService } from '../../services/superadmin/superadmin.service'
import { SesionService } from '../../services/sesion/sesion.service'

@Component({
  selector: 'app-login-superadmin',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './login-superadmin.component.html',
  styleUrl: './login-superadmin.component.scss'
})
export class LoginSuperadminComponent {
  private storage = inject(StorageService)
  router = inject(Router)
  hide = true
  form: FormGroup

  constructor(
    private fb: FormBuilder,
    private superadminService: SuperadminService,
    private sesionService: SesionService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  onSubmit(): void {
    if (this.form.invalid) return

    const { username, password } = this.form.value
    this.superadminService.login(username, password).subscribe({
      next: (resp: any) => {
        this.sesionService.setAccessToken(resp.data.accessToken)
        this.sesionService.setRefreshToken(resp.data.refreshToken)
        this.storage.setItem('rol', 'superadmin')
        this.router.navigateByUrl('/superadmin/dashboard')
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Credenciales inválidas' })
      }
    })
  }
}
