import { Component } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SesionService } from '../../services/sesion/sesion.service'
import Swal from 'sweetalert2'
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component'
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component'

@Component({
  selector: 'app-usar-cupon',
  standalone: true,
  imports: [
    PageHeaderComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
    MatIconModule,
    NotificationBellComponent,
    NotificationPanelComponent
  ],
  templateUrl: './usar-cupon.component.html',
  styleUrl: './usar-cupon.component.scss'
})
export class UsarCuponComponent {
  form: FormGroup
  error: string = ''
  cargando: boolean = false
  /** Modo por defecto: carga manual del código. "scan" es solo una vista previa, todavía no lee QR. */
  mode: 'code' | 'scan' = 'code'

  constructor(
    private fb: FormBuilder,
    private service: LocalAdheridoService,
    private sesionService: SesionService
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    })
  }

  onSubmit() {
    if (this.form.valid) {
      this.cargando = true
      this.error = ''

      const payload = {
        code: this.form.value.code.toUpperCase(),
        rewardPartnerId: this.sesionService.getUserId()
      }

      this.service.useCoupon(payload).subscribe({
        next: (res: any) => {
          this.cargando = false
          this.form.reset()
          Swal.fire({
            icon: 'success',
            title: '¡Cupón válido!',
            html: `
              <p><strong>${res.data.couponTitle}</strong></p>
              <p>Descuento aplicado: <strong>${res.data.discount}%</strong></p>
            `,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#4caf50'
          })
        },
        error: (err: any) => {
          this.error = err.error?.message ?? 'Error al validar el cupón.'
          this.cargando = false
        }
      })
    }
  }
}
