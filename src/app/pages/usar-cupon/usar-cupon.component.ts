import { Component, ChangeDetectorRef } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'
import { RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SesionService } from '../../services/sesion/sesion.service'

@Component({
  selector: 'app-usar-cupon',
  standalone: true,
  imports: [
    NavbarComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    CommonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './usar-cupon.component.html',
  styleUrl: './usar-cupon.component.scss'
})
export class UsarCuponComponent {
  form: FormGroup
  resultado: any = null
  error: string = ''
  cargando: boolean = false

  constructor(
    private fb: FormBuilder,
    private service: LocalAdheridoService,
    private sesionService: SesionService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      totalAmount: [null, [Validators.required, Validators.min(1)]]
    })
  }

  onSubmit() {
    if (this.form.valid) {
      this.cargando = true
      this.error = ''
      this.resultado = null

      const payload = {
        code: this.form.value.code.toUpperCase(),
        rewardPartnerId: this.sesionService.getUserId(),
        totalAmount: this.form.value.totalAmount
      }

      this.service.useCoupon(payload).subscribe({
        next: (res: any) => {
          console.log('respuesta completa:', res)
          this.resultado = res.data
          this.cargando = false
          this.cdr.detectChanges()
        },
        error: (err: any) => {
          this.error = err.error?.message ?? 'Error al validar el cupón.'
          this.cargando = false
        }
      })
    }
  }

  reset() {
    this.form.reset()
    this.resultado = null
    this.error = ''
  }
}
