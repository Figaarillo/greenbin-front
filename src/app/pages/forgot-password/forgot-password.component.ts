import { API_BASE_URL } from '../../config/api.config'
import { inject, Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { HttpClient } from '@angular/common/http'
import Swal from 'sweetalert2'

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private apiBase = inject(API_BASE_URL)
  form: FormGroup
  loading = false

  userTypes = [
    { value: 'neighbor', label: 'Vecino' },
    { value: 'reward-partner', label: 'Local Adherido' },
    { value: 'responsible', label: 'Responsable' },
    { value: 'entity', label: 'Entidad' }
  ]

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      userType: ['', [Validators.required]]
    })
  }

  onSubmit(): void {
    if (this.form.invalid) return
    this.loading = true

    const { email, userType } = this.form.value

    this.http.post<any>(`${this.apiBase}/api/auth/forgot-password`, { email, userType }).subscribe({
      next: res => {
        this.loading = false
        const resetToken = res.data?.resetToken
        void this.router.navigate(['/reset-password'], {
          state: { resetToken, email, userType }
        })
      },
      error: () => {
        this.loading = false
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo enviar el código. Intentá de nuevo.' })
      }
    })
  }
}
