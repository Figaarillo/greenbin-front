import { Component } from '@angular/core'
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { RouterModule } from '@angular/router'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { Vecino } from '../../services/interfaces/vecino'
import { VecinoService } from '../../services/vecino/vecino.service'

@Component({
  selector: 'app-registrar-vecino',
  standalone: true,
  imports: [
    NavbarComponent,
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './registrar-vecino.component.html',
  styleUrl: './registrar-vecino.component.scss'
})
export class RegistrarVecinoComponent {
  form: FormGroup
  hidePassword = true

  constructor(
    private fb: FormBuilder,
    private vecinoService: VecinoService
  ) {
    this.form = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_+{}\[\]:;"'<>,.?/~`]{8,}$/
          )
        ]
      ],
      birthdate: ['', [Validators.required, this.dateValidator]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{7,9}$')]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    })
  }

  // Validador para que la fecha de nacimiento sea menor a la actual
  dateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const inputDate = new Date(control.value)
    const currentDate = new Date()
    // Comparar las fechas
    if (inputDate >= currentDate) {
      return { invalidDate: true } // Si la fecha es igual o mayor que la actual
    }
    return null // Si es válida
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword
    const passwordField = document.querySelector('input[formControlName="password"]') as HTMLInputElement
    passwordField.type = this.hidePassword ? 'password' : 'text'
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(<Vecino>this.form.value)
      this.vecinoService.create(<Vecino>this.form.value)
    }
  }
}
