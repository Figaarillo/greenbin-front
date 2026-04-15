import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { HttpClient } from '@angular/common/http'
import Swal from 'sweetalert2'

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup
  loading = false
  hideNew = true
  hideConfirm = true

  private resetToken = ''

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
    const state = history.state as { resetToken?: string }
    if (!state?.resetToken) {
      void this.router.navigate(['/forgot-password'])
      return
    }
    this.resetToken = state.resetToken
  }

  get passwordsMismatch(): boolean {
    return this.form.get('newPassword')?.value !== this.form.get('confirmPassword')?.value
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordsMismatch) return
    this.loading = true

    const { otp, newPassword } = this.form.value

    this.http
      .post<any>('http://localhost:8080/api/auth/reset-password', {
        resetToken: this.resetToken,
        otp,
        newPassword
      })
      .subscribe({
        next: () => {
          this.loading = false
          void Swal.fire({
            icon: 'success',
            title: '¡Listo!',
            text: 'Tu contraseña fue actualizada correctamente.'
          }).then(() => {
            void this.router.navigate(['/login'])
          })
        },
        error: err => {
          this.loading = false
          const msg = err?.error?.message ?? 'Código inválido o expirado. Solicitá uno nuevo.'
          Swal.fire({ icon: 'error', title: 'Error', text: msg })
        }
      })
  }
}
