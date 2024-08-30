import { Component, inject } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButton } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatToolbar } from '@angular/material/toolbar'
@Component({
  selector: 'app-registrar-local',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButton,
    MatFormFieldModule,
    MatIcon,
    MatInput,
    NavbarComponent,
    MatToolbar
  ],
  templateUrl: './registrar-local.component.html',
  styleUrl: './registrar-local.component.scss'
})
export class RegistrarLocalComponent {
  title: string = 'Registrarse'
  private readonly _formBuilder = inject(FormBuilder)
  formGroup = this._formBuilder.nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    cuit: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
    password: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_+{}\[\]:;"'<>,.?/~`]{8,}$/
        )
      ]
    ],
    confirmPassword: ['', Validators.required]
  })

  register(): void {}
}
