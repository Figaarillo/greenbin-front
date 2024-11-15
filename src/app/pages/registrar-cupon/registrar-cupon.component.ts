import { Component, inject } from '@angular/core'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatButton } from '@angular/material/button'
import { MatInput } from '@angular/material/input'
import { MatCardModule } from '@angular/material/card'

@Component({
  selector: 'app-registrar-cupon',
  standalone: true,
  imports: [NavbarComponent, MatFormFieldModule, MatButton, MatInput, MatCardModule, ReactiveFormsModule],
  templateUrl: './registrar-cupon.component.html',
  styleUrl: './registrar-cupon.component.scss'
})
export class RegistrarCuponComponent {
  private readonly formBuilder = inject(FormBuilder)

  formGroup = this.formBuilder.nonNullable.group({
    titulo: ['', Validators.required],
    description: ['', Validators.required],
    descuento: ['', Validators.required],
    costo: ['', Validators.required],
    diasVigente: ['', Validators.required]
  })

  registrarCupon() {
    if (this.formGroup.valid) {
      alert('cuponcito')
    }
  }
}
